import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession, createAuthErrorResponse } from '@/lib/auth-helpers'
import { auditCrudAction } from '@/lib/audit-middleware'
import { getClientIP, getUserAgent } from '@/lib/auth-utils'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const authResult = await getAdminSession(request)
    
    if (authResult.error) {
      return createAuthErrorResponse(authResult.error, authResult.status)
    }

    const sector = await db.sector.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            approved: true
          }
        }
      }
    })

    if (!sector) {
      return NextResponse.json({ error: 'Sector not found' }, { status: 404 })
    }

    return NextResponse.json(sector)
  } catch (error) {
    console.error('Error fetching sector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const authResult = await getAdminSession(request)
    
    if (authResult.error) {
      return createAuthErrorResponse(authResult.error, authResult.status)
    }

    const { name, description, active } = await request.json()

    // Check if another sector with the same name already exists
    if (name) {
      const existingSector = await db.sector.findFirst({
        where: {
          name,
          NOT: {
            id
          }
        }
      })

      if (existingSector) {
        return NextResponse.json({ error: 'Sector with this name already exists' }, { status: 400 })
      }
    }

    // Buscar dados do setor antes da atualização para auditoria
    const sectorBefore = await db.sector.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        active: true
      }
    })

    if (!sectorBefore) {
      return NextResponse.json({ error: 'Sector not found' }, { status: 404 })
    }

    const sector = await db.sector.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(active !== undefined && { active }),
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    // Registrar auditoria da atualização
    await auditCrudAction(
      request,
      'UPDATE',
      'SECTOR',
      sector.id,
      sector.name,
      {
        id: authResult.session.userId,
        name: authResult.session.name,
        email: authResult.session.email,
        role: authResult.session.role
      },
      {
        name: sectorBefore.name,
        description: sectorBefore.description,
        active: sectorBefore.active
      },
      {
        name: sector.name,
        description: sector.description,
        active: sector.active
      }
    )

    return NextResponse.json(sector)
  } catch (error) {
    console.error('Error updating sector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const authResult = await getAdminSession(request)
    
    if (authResult.error) {
      return createAuthErrorResponse(authResult.error, authResult.status)
    }

    // Check if sector has users
    const sectorWithUsers = await db.sector.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (!sectorWithUsers) {
      return NextResponse.json({ error: 'Sector not found' }, { status: 404 })
    }

    if (sectorWithUsers._count.users > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete sector with associated users. Please reassign or remove users first.' 
      }, { status: 400 })
    }

    // Registrar auditoria da exclusão
    await auditCrudAction(
      request,
      'DELETE',
      'SECTOR',
      sectorWithUsers.id,
      sectorWithUsers.name,
      {
        id: authResult.session.userId,
        name: authResult.session.name,
        email: authResult.session.email,
        role: authResult.session.role
      },
      {
        name: sectorWithUsers.name,
        description: sectorWithUsers.description,
        active: sectorWithUsers.active,
        userCount: sectorWithUsers._count.users
      },
      null
    )

    await db.sector.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Sector deleted successfully' })
  } catch (error) {
    console.error('Error deleting sector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}