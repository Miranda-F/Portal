import { db } from '@/lib/db'
import { ActionType, ActionResult, RequestSource } from '@prisma/client'
import { NextRequest } from 'next/server'

export interface AuditLogData {
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: string
  action: string
  actionType: ActionType
  description: string
  details?: string
  entityType?: string
  entityId?: string
  entityName?: string
  result?: ActionResult
  errorCode?: string
  errorMessage?: string
  request?: NextRequest
  requestSource?: RequestSource
}

/**
 * Cria um registro de log de auditoria no sistema
 * 
 * @param data Dados do log de auditoria
 * @returns Promise com o log criado
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    const auditLog = await db.auditLog.create({
      data: {
        userId: data.userId || null,
        userName: data.userName || null,
        userEmail: data.userEmail || null,
        userRole: data.userRole as any || null,
        action: data.action,
        actionType: data.actionType,
        description: data.description,
        details: data.details || null,
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        entityName: data.entityName || null,
        result: data.result || ActionResult.SUCCESS,
        errorCode: data.errorCode || null,
        errorMessage: data.errorMessage || null,
        ipAddress: data.request ? 
          (data.request.headers.get('x-forwarded-for') || 
           data.request.headers.get('x-real-ip') || 
           'unknown') : null,
        userAgent: data.request ? 
          data.request.headers.get('user-agent') || null : null,
        requestSource: data.requestSource || RequestSource.SYSTEM
      }
    })

    return auditLog
  } catch (error) {
    console.error('Error creating audit log:', error)
    // Não lançar erro para não interromper a operação principal
    return null
  }
}

/**
 * Cria um log de auditoria para ações de autenticação
 */
export async function logAuthAction(
  action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE',
  userId?: string,
  userEmail?: string,
  request?: NextRequest,
  errorMessage?: string
) {
  const actionMap = {
    'LOGIN': { type: ActionType.LOGIN, desc: 'Usuário realizou login no sistema' },
    'LOGOUT': { type: ActionType.LOGOUT, desc: 'Usuário realizou logout do sistema' },
    'LOGIN_FAILED': { type: ActionType.LOGIN, desc: 'Tentativa de login falhou' },
    'PASSWORD_CHANGE': { type: ActionType.PASSWORD_CHANGE, desc: 'Usuário alterou sua senha' }
  }

  const actionInfo = actionMap[action]

  return await createAuditLog({
    userId,
    userEmail,
    action: actionInfo.desc,
    actionType: actionInfo.type,
    description: actionInfo.desc,
    result: action === 'LOGIN_FAILED' ? ActionResult.FAILURE : ActionResult.SUCCESS,
    errorMessage,
    request,
    requestSource: RequestSource.WEB_INTERFACE
  })
}

/**
 * Cria um log de auditoria para ações CRUD
 */
export async function logCrudAction(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityType: string,
  entityId: string,
  entityName: string,
  userId: string,
  userName: string,
  userEmail: string,
  userRole: string,
  oldValues?: any,
  newValues?: any,
  request?: NextRequest
) {
  const actionMap = {
    'CREATE': { type: ActionType.CREATE, desc: 'Criou' },
    'UPDATE': { type: ActionType.UPDATE, desc: 'Atualizou' },
    'DELETE': { type: ActionType.DELETE, desc: 'Excluiu' }
  }

  const actionInfo = actionMap[action]

  let details = null
  if (oldValues && newValues) {
    details = JSON.stringify({
      oldValues,
      newValues,
      changedFields: Object.keys(newValues).filter(key => 
        JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])
      )
    })
  }

  return await createAuditLog({
    userId,
    userName,
    userEmail,
    userRole,
    action: `${actionInfo.desc} ${entityType}`,
    actionType: actionInfo.type,
    description: `${actionInfo.desc} ${entityType}: ${entityName}`,
    details,
    entityType,
    entityId,
    entityName,
    request,
    requestSource: RequestSource.WEB_INTERFACE
  })
}

/**
 * Cria um log de auditoria para acesso a recursos
 */
export async function logAccessAction(
  entityType: string,
  entityId: string,
  entityName: string,
  userId: string,
  userName: string,
  userEmail: string,
  userRole: string,
  accessType: 'VIEW' | 'EXPORT' | 'DOWNLOAD' = 'VIEW',
  request?: NextRequest
) {
  const actionMap = {
    'VIEW': { type: ActionType.VIEW, desc: 'Visualizou' },
    'EXPORT': { type: ActionType.EXPORT, desc: 'Exportou' },
    'DOWNLOAD': { type: ActionType.DOWNLOAD, desc: 'Baixou' }
  }

  const actionInfo = actionMap[accessType]

  return await createAuditLog({
    userId,
    userName,
    userEmail,
    userRole,
    action: `${actionInfo.desc} ${entityType}`,
    actionType: actionInfo.type,
    description: `${actionInfo.desc} ${entityType}: ${entityName}`,
    entityType,
    entityId,
    entityName,
    request,
    requestSource: RequestSource.WEB_INTERFACE
  })
}

/**
 * Cria um log de auditoria para ações de sistema
 */
export async function logSystemAction(
  action: string,
  description: string,
  userId?: string,
  userName?: string,
  userEmail?: string,
  userRole?: string,
  details?: string,
  request?: NextRequest
) {
  return await createAuditLog({
    userId,
    userName,
    userEmail,
    userRole,
    action,
    actionType: ActionType.SYSTEM_ACTION,
    description,
    details,
    request,
    requestSource: RequestSource.SYSTEM
  })
}