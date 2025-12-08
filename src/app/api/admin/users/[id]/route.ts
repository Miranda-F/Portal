import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'
import { auditCrudAction } from '@/lib/audit-middleware'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        sector: true,
        role: true,
        approved: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, sectorId, role, password, approved } = await request.json()

    const updateData: any = {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(sectorId !== undefined && { sectorId }),
      ...(role !== undefined && { role }),
      ...(approved !== undefined && { approved }),
    }

    // Se senha foi fornecida, hashear e atualizar
    if (password) {
      const hashedPassword = await import('@/lib/auth').then(({ hashPassword }) => hashPassword(password))
      updateData.password = hashedPassword
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        sector: true,
        role: true,
        approved: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar o usuário antes de deletar
    const user = await db.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        email: true,
        name: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verificar se existe um funcionário com o mesmo email (usuário criado pelo RH)
    try {
      const employee = await db.employee.findFirst({
        where: { email: user.email }
      })

      if (employee) {
        // Deletar o funcionário correspondente
        await db.employee.delete({
          where: { id: employee.id }
        })
      }
    } catch (employeeError) {
      console.error('Erro ao deletar funcionário correspondente:', employeeError)
      // Continuar com a deleção do usuário mesmo se falhar ao deletar o funcionário
    }

    // Registrar auditoria da exclusão do usuário
    const adminUser = await db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, role: true }
    })

    if (adminUser) {
      await auditCrudAction(
        request,
        'DELETE',
        'USER',
        user.id,
        user.name,
        {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        },
        {
          email: user.email,
          name: user.name
        },
        null
      )
    }

    // Deletar o usuário
    await db.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}