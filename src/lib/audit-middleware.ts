import { NextRequest } from 'next/server'
import { logCrudAction, logAccessAction, createAuditLog } from '@/lib/audit-logger'
import { ActionType, ActionResult } from '@prisma/client'

/**
 * Middleware para registrar automaticamente ações CRUD
 */
export async function auditCrudAction(
  request: NextRequest,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityType: string,
  entityId: string,
  entityName: string,
  user: { id: string; name: string; email: string; role: string },
  oldValues?: any,
  newValues?: any
) {
  try {
    await logCrudAction(
      action,
      entityType,
      entityId,
      entityName,
      user.id,
      user.name,
      user.email,
      user.role,
      oldValues,
      newValues,
      request
    )
  } catch (error) {
    console.error('Error in auditCrudAction:', error)
  }
}

/**
 * Middleware para registrar automaticamente acesso a recursos
 */
export async function auditAccessAction(
  request: NextRequest,
  entityType: string,
  entityId: string,
  entityName: string,
  user: { id: string; name: string; email: string; role: string },
  accessType: 'VIEW' | 'EXPORT' | 'DOWNLOAD' = 'VIEW'
) {
  try {
    await logAccessAction(
      entityType,
      entityId,
      entityName,
      user.id,
      user.name,
      user.email,
      user.role,
      accessType,
      request
    )
  } catch (error) {
    console.error('Error in auditAccessAction:', error)
  }
}

/**
 * Wrapper para API routes que automaticamente registra auditoria
 */
export function withAudit<T extends (...args: any[]) => any>(
  handler: T,
  options: {
    action: string
    actionType: ActionType
    entityType?: string
    getEntityId?: (args: Parameters<T>) => string
    getEntityName?: (args: Parameters<T>) => string
    getDetails?: (args: Parameters<T>) => string
  }
) {
  return async (request: NextRequest, context: any) => {
    const startTime = Date.now()
    let result: any
    let error: any

    try {
      result = await handler(request, context)
      return result
    } catch (err) {
      error = err
      throw err
    } finally {
      try {
        const session = await import('@/lib/session').then(m => m.getServerSession(request))
        if (session?.userId) {
          const user = await import('@/lib/auth').then(m => m.getUserById(session.userId))
          
          if (user) {
            const entityId = options.getEntityId ? options.getEntityId([request, context] as any) : undefined
            const entityName = options.getEntityName ? options.getEntityName([request, context] as any) : undefined
            const details = options.getDetails ? options.getDetails([request, context] as any) : undefined

            await createAuditLog({
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
              userRole: user.role,
              action: options.action,
              actionType: options.actionType,
              description: options.action,
              entityType: options.entityType,
              entityId,
              entityName,
              details,
              result: error ? ActionResult.FAILURE : ActionResult.SUCCESS,
              errorMessage: error?.message,
              request
            })
          }
        }
      } catch (auditError) {
        console.error('Error in audit wrapper:', auditError)
      }
    }
  }
}

/**
 * Função utilitária para extrair informações da requisição
 */
export function extractRequestInfo(request: NextRequest) {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    method: request.method,
    url: request.url
  }
}

/**
 * Função para registrar ações de sistema
 */
export async function auditSystemAction(
  action: string,
  description: string,
  request?: NextRequest,
  details?: string
) {
  try {
    await createAuditLog({
      action,
      actionType: ActionType.SYSTEM_ACTION,
      description,
      details,
      request
    })
  } catch (error) {
    console.error('Error in auditSystemAction:', error)
  }
}