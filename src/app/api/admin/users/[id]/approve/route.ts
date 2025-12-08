import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'
import { logAuthEvent, getClientIP, getUserAgent } from '@/lib/auth-utils'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const token = getSessionCookie(request)
    const accessToken = request.cookies.get('access_token')?.value
    const finalToken = token || accessToken
    
    if (!finalToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(finalToken)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { approved } = await request.json()

    // Usar transação para garantir consistência e melhor performance
    const result = await db.$transaction(async (tx) => {
      // Buscar o usuário e funcionário em paralelo
      const [userBeforeUpdate, employee] = await Promise.all([
        tx.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            name: true,
            approved: true,
          },
        }),
        // Buscar funcionário apenas se necessário (otimização)
        tx.employee.findFirst({
          where: { 
            email: {
              // Usar uma query mais eficiente
              in: await tx.user.findUnique({
                where: { id },
                select: { email: true }
              }).then(user => user ? [user.email] : [])
            }
          },
          select: {
            id: true,
            status: true,
            email: true
          }
        })
      ])

      if (!userBeforeUpdate) {
        throw new Error('User not found')
      }

      // Atualizar usuário
      const updatedUser = await tx.user.update({
        where: { id },
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

      // Atualizar funcionário se existir (em paralelo com o log de auditoria)
      const employeeUpdatePromise = employee ? (async () => {
        const newStatus = approved ? 'ACTIVE' : 'INACTIVE'
        
        await Promise.all([
          tx.employee.update({
            where: { id: employee.id },
            data: { status: newStatus }
          }),
          tx.employeeHistory.create({
            data: {
              employeeId: employee.id,
              type: 'OTHER',
              title: approved ? 'Ativação de Usuário' : 'Desativação de Usuário',
              description: `Funcionário ${approved ? 'ativado' : 'desativado'} devido à ${approved ? 'ativação' : 'desativação'} do usuário no sistema`,
              date: new Date(),
              oldValues: JSON.stringify({ status: employee.status }),
              newValues: JSON.stringify({ status: newStatus }),
            }
          })
        ])
      })() : Promise.resolve()

      // Criar log de auditoria em paralelo
      const auditLogPromise = tx.auditLog.create({
        data: {
          userId: session.userId,
          userName: session.name,
          userEmail: session.email,
          userRole: session.role,
          action: approved ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
          actionType: 'UPDATE',
          description: approved 
            ? `Usuário ${userBeforeUpdate.name} (${userBeforeUpdate.email}) foi ativado`
            : `Usuário ${userBeforeUpdate.name} (${userBeforeUpdate.email}) foi desativado`,
          entityType: 'User',
          entityId: userBeforeUpdate.id,
          entityName: userBeforeUpdate.name,
          ipAddress: getClientIP(request) || 'unknown',
          userAgent: getUserAgent(request) || 'unknown',
          result: 'SUCCESS',
          details: JSON.stringify({
            oldStatus: userBeforeUpdate.approved,
            newStatus: approved,
            action: approved ? 'activated' : 'deactivated',
            employeeStatusUpdated: !!employee
          }),
        }
      })

      // Aguardar operações em paralelo
      await Promise.all([employeeUpdatePromise, auditLogPromise])

      return updatedUser
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating user approval status:', error)
    
    // Registrar erro nos logs de auditoria (sem bloquear a resposta)
    setImmediate(async () => {
      try {
        const session = await verifySession(getSessionCookie(request) || '')
        if (session) {
          await db.auditLog.create({
            data: {
              userId: session.userId,
              userName: session.name,
              userEmail: session.email,
              userRole: session.role,
              action: 'USER_STATUS_UPDATE_FAILED',
              actionType: 'UPDATE',
              description: `Falha ao atualizar status do usuário`,
              entityType: 'User',
              entityId: 'unknown',
              ipAddress: getClientIP(request) || 'unknown',
              userAgent: getUserAgent(request) || 'unknown',
              result: 'FAILURE',
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
            }
          })
        }
      } catch (logError) {
        console.error('Error logging audit event:', logError)
      }
    })

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}