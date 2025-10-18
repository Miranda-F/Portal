import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'
import { logAuthEvent, getClientIP, getUserAgent } from '@/lib/auth-utils'

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

    const { approved } = await request.json()

    // Buscar o usuário antes de atualizar para obter informações para o log
    const userBeforeUpdate = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        approved: true,
      },
    })

    if (!userBeforeUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Atualizar o status do usuário
    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: { approved },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approved: true,
        updatedAt: true,
      },
    })

    // Se o usuário foi desativado (approved = false), também desativar o funcionário correspondente no RH
    // Se o usuário foi ativado (approved = true), também ativar o funcionário correspondente no RH
    try {
      // Buscar funcionário pelo email do usuário
      const employee = await db.employee.findFirst({
        where: { email: userBeforeUpdate.email }
      })

      if (employee) {
        const newStatus = approved ? 'ACTIVE' : 'INACTIVE'
        
        // Atualizar o status do funcionário
        await db.employee.update({
          where: { id: employee.id },
          data: { status: newStatus }
        })

        // Criar histórico de alteração de status do funcionário
        await db.employeeHistory.create({
          data: {
            employeeId: employee.id,
            type: 'STATUS_CHANGE',
            title: approved ? 'Ativação de Usuário' : 'Desativação de Usuário',
            description: `Funcionário ${approved ? 'ativado' : 'desativado'} devido à ${approved ? 'ativação' : 'desativação'} do usuário no sistema`,
            date: new Date(),
            oldValues: JSON.stringify({ status: employee.status }),
            newValues: JSON.stringify({ status: newStatus }),
          }
        })
      }
    } catch (error) {
      console.error('Error updating employee status:', error)
      // Não falhar a operação principal se não conseguir atualizar o funcionário
    }

    // Registrar o evento de aprovação/desaprovação nos logs de auditoria
    await db.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userEmail: session.email,
        userRole: session.role,
        action: approved ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        actionType: 'APPROVE',
        description: approved 
          ? `Usuário ${userBeforeUpdate.name} (${userBeforeUpdate.email}) foi ativado`
          : `Usuário ${userBeforeUpdate.name} (${userBeforeUpdate.email}) foi desativado`,
        entityType: 'User',
        entityId: userBeforeUpdate.id,
        entityName: userBeforeUpdate.name,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        result: 'SUCCESS',
        details: JSON.stringify({
          oldStatus: userBeforeUpdate.approved,
          newStatus: approved,
          action: approved ? 'activated' : 'deactivated',
          employeeStatusUpdated: true
        }),
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user approval status:', error)
    
    // Registrar erro nos logs de auditoria
    try {
      const session = await verifySession(getSessionCookie(request) || '')
      if (session) {
        await db.auditLog.create({
          data: {
            userId: session.id,
            userName: session.name,
            userEmail: session.email,
            userRole: session.role,
            action: 'USER_STATUS_UPDATE_FAILED',
            actionType: 'UPDATE',
            description: `Falha ao atualizar status do usuário ${params.id}`,
            entityType: 'User',
            entityId: params.id,
            ipAddress: getClientIP(request),
            userAgent: getUserAgent(request),
            result: 'FAILURE',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          }
        })
      }
    } catch (logError) {
      console.error('Error logging audit event:', logError)
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}