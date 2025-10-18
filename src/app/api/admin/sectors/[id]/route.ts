import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sector = await db.sector.findUnique({
      where: { id: params.id },
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, active } = await request.json()

    // Check if another sector with the same name already exists
    if (name) {
      const existingSector = await db.sector.findFirst({
        where: {
          name,
          NOT: {
            id: params.id
          }
        }
      })

      if (existingSector) {
        return NextResponse.json({ error: 'Sector with this name already exists' }, { status: 400 })
      }
    }

    const sector = await db.sector.update({
      where: { id: params.id },
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

    return NextResponse.json(sector)
  } catch (error) {
    console.error('Error updating sector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if sector has users
    const sectorWithUsers = await db.sector.findUnique({
      where: { id: params.id },
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

    await db.sector.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Sector deleted successfully' })
  } catch (error) {
    console.error('Error deleting sector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}