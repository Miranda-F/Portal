import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { randomUUID } from 'crypto'
import { logAuthAction } from '@/lib/audit-logger'
import { NextRequest } from 'next/server'
import { ActionType, ActionResult } from '@prisma/client'

export interface AuthLogData {
  userId?: string
  email?: string
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'TOKEN_REFRESH' | 'SESSION_EXPIRED'
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

// Função para registrar logs de auditoria de autenticação
export async function logAuthEvent(data: AuthLogData): Promise<void> {
  try {
    // Mapear ações para o novo sistema de auditoria
    let action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE'
    let errorMessage: string | undefined
    
    switch (data.action) {
      case 'LOGIN_SUCCESS':
        action = 'LOGIN'
        break
      case 'LOGIN_FAILED':
        action = 'LOGIN_FAILED'
        errorMessage = data.metadata?.reason || 'Credenciais inválidas'
        break
      case 'LOGOUT':
        action = 'LOGOUT'
        break
      case 'TOKEN_REFRESH':
        action = 'LOGIN' // Token refresh é considerado uma ação de login
        break
      case 'SESSION_EXPIRED':
        action = 'LOGOUT' // Sessão expirada é considerada um logout
        break
      default:
        action = 'LOGIN'
    }
    
    // Usar o novo sistema de auditoria
    await logAuthAction(
      action,
      data.userId,
      data.email,
      undefined, // request será passado pelo chamador
      errorMessage
    )
  } catch (error) {
    console.error('Error logging auth event:', error)
    // Fallback para console logging em caso de falha
    console.log(`[AUTH_AUDIT] ${new Date().toISOString()} - ${data.action}:`, {
      userId: data.userId,
      email: data.email,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata
    })
  }
}

// Função para criar refresh token seguro
export async function createRefreshTokenForUser(userId: string): Promise<{ tokenId: string; token: string }> {
  const tokenId = randomUUID()
  const token = `${tokenId}.${randomUUID()}.${Date.now()}`
  const tokenHash = await hashPassword(token)
  
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias
  
  // Salvar no banco de dados
  await db.refreshToken.create({
    data: {
      tokenId,
      tokenHash,
      userId,
      expiresAt,
    }
  })
  
  return { tokenId, token }
}

// Função para validar refresh token
export async function validateRefreshToken(token: string): Promise<{ userId: string; tokenId: string } | null> {
  try {
    const [tokenId] = token.split('.')
    if (!tokenId) return null
    
    const refreshToken = await db.refreshToken.findUnique({
      where: { tokenId },
      include: { user: true }
    })
    
    if (!refreshToken) return null
    
    // Verificar se expirou
    if (refreshToken.expiresAt < new Date()) {
      await db.refreshToken.delete({ where: { tokenId } })
      return null
    }
    
    // Verificar hash do token
    const isValid = await verifyPassword(token, refreshToken.tokenHash)
    if (!isValid) return null
    
    return { userId: refreshToken.userId, tokenId }
  } catch (error) {
    console.error('Error validating refresh token:', error)
    return null
  }
}

// Função para revogar refresh token
export async function revokeRefreshToken(tokenId: string): Promise<void> {
  try {
    await db.refreshToken.delete({
      where: { tokenId }
    })
  } catch (error) {
    console.error('Error revoking refresh token:', error)
  }
}

// Função para revogar todos os refresh tokens de um usuário
export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  try {
    await db.refreshToken.deleteMany({
      where: { userId }
    })
  } catch (error) {
    console.error('Error revoking user refresh tokens:', error)
  }
}

// Função para limpar refresh tokens expirados
export async function cleanupExpiredRefreshTokens(): Promise<number> {
  try {
    const result = await db.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    
    return result.count
  } catch (error) {
    console.error('Error cleaning up expired refresh tokens:', error)
    return 0
  }
}

// Função para obter IP address do request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (real) {
    return real
  }
  
  return 'unknown'
}

// Função para obter User Agent do request
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}

// Tipos para erros de autenticação
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_NOT_APPROVED = 'USER_NOT_APPROVED',
  ACCOUNT_DEACTIVATED = 'ACCOUNT_DEACTIVATED',
  RATE_LIMITED = 'RATE_LIMITED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Classe para erros de autenticação
export class AuthError extends Error {
  public readonly type: AuthErrorType
  public readonly statusCode: number
  
  constructor(type: AuthErrorType, message: string, statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
    this.type = type
    this.statusCode = statusCode
  }
}

// Função para criar erro de autenticação padronizado
export function createAuthError(type: AuthErrorType, message?: string): AuthError {
  const messages = {
    [AuthErrorType.INVALID_CREDENTIALS]: 'Credenciais inválidas',
    [AuthErrorType.TOKEN_EXPIRED]: 'Token expirado',
    [AuthErrorType.INVALID_TOKEN]: 'Token inválido',
    [AuthErrorType.USER_NOT_FOUND]: 'Usuário não encontrado',
    [AuthErrorType.USER_NOT_APPROVED]: 'Usuário não aprovado',
    [AuthErrorType.ACCOUNT_DEACTIVATED]: 'Sua conta foi desativada. Entre em contato com o administrador.',
    [AuthErrorType.RATE_LIMITED]: 'Muitas tentativas. Tente novamente mais tarde.',
    [AuthErrorType.UNKNOWN_ERROR]: 'Erro de autenticação'
  }
  
  return new AuthError(type, message || messages[type])
}