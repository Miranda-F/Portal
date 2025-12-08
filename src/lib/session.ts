import { serialize, parse } from 'cookie'
import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { User } from '@prisma/client'
import { NextRequest } from 'next/server'
import cacheManager from './cache-manager'

// Tornar JWT_SECRET obrigatório - sem fallback para valores default
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || (() => {
    throw new Error('JWT_SECRET environment variable is required')
  })()
)

export interface SessionPayload extends JWTPayload {
  userId: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

export interface RefreshTokenPayload extends JWTPayload {
  userId: string
  tokenId: string
}

const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'

// Prefixo para chaves de cache de sessão
const SESSION_CACHE_PREFIX = 'session:'

/* ----------------- JWT Helpers ----------------- */
export async function createAccessToken(user: User): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  } as SessionPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // Expiração curta: 15 minutos
    .sign(secretKey)
}

export async function createRefreshToken(userId: string, tokenId: string): Promise<string> {
  return new SignJWT({
    userId,
    tokenId,
  } as RefreshTokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Refresh token válido por 7 dias
    .sign(secretKey)
}

export async function verifyAccessToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secretKey)
    return payload
  } catch (error) {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify<RefreshTokenPayload>(token, secretKey)
    return payload
  } catch (error) {
    return null
  }
}

/* ----------------- Cache Management ----------------- */
export function cacheSession(token: string, payload: SessionPayload): void {
  const cacheKey = `${SESSION_CACHE_PREFIX}${token}`
  const ttl = 15 * 60 * 1000 // 15 minutos
  cacheManager.set(cacheKey, payload, ttl)
}

export function getCachedSession(token: string): SessionPayload | null {
  const cacheKey = `${SESSION_CACHE_PREFIX}${token}`
  return cacheManager.get<SessionPayload>(cacheKey)
}

export function clearSessionCache(token: string): void {
  const cacheKey = `${SESSION_CACHE_PREFIX}${token}`
  cacheManager.delete(cacheKey)
}

/* ----------------- Cookie Helpers ----------------- */
function getCookieOptions(maxAge: number, isProduction: boolean = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: isProduction, // Sempre true em produção
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
    domain: isProduction ? process.env.DOMAIN : undefined,
  }
}

export function setAccessTokenCookie(token: string): string {
  return serialize(ACCESS_TOKEN_COOKIE, token, getCookieOptions(15 * 60)) // 15 minutos
}

export function setRefreshTokenCookie(token: string): string {
  return serialize(REFRESH_TOKEN_COOKIE, token, getCookieOptions(7 * 24 * 60 * 60)) // 7 dias
}

export function deleteAuthCookies(): string {
  const accessCookie = serialize(ACCESS_TOKEN_COOKIE, '', getCookieOptions(0))
  const refreshCookie = serialize(REFRESH_TOKEN_COOKIE, '', getCookieOptions(0))
  return `${accessCookie}; ${refreshCookie}`
}

export function getAccessTokenCookie(request: Request): string | undefined {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return undefined
  return parse(cookieHeader)[ACCESS_TOKEN_COOKIE]
}

export function getRefreshTokenCookie(request: Request): string | undefined {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return undefined
  return parse(cookieHeader)[REFRESH_TOKEN_COOKIE]
}

export function getAccessTokenCookieFromNextRequest(request: NextRequest): string | undefined {
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
}

export function getRefreshTokenCookieFromNextRequest(request: NextRequest): string | undefined {
  return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
}

// Funções de compatibilidade para manter o código existente funcionando
export function getSessionCookieFromNextRequest(request: NextRequest): string | undefined {
  return getAccessTokenCookieFromNextRequest(request)
}

// Alias para compatibilidade com código existente
export function getSessionCookie(request: NextRequest): string | undefined {
  return getAccessTokenCookieFromNextRequest(request)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  return await verifyAccessToken(token)
}

/* ----------------- Server Helper ----------------- */
export async function getServerSession(request: Request): Promise<SessionPayload | null> {
  const token = getAccessTokenCookie(request)
  if (!token) return null
  
  // Verificar cache primeiro
  const cached = getCachedSession(token)
  if (cached) return cached
  
  // Validar token
  const payload = await verifyAccessToken(token)
  if (payload) {
    cacheSession(token, payload)
  }
  
  return payload
}

/* ----------------- Função Centralizada de Validação ----------------- */
export interface AuthResult {
  success: boolean
  payload?: SessionPayload
  error?: string
  needsRefresh?: boolean
}

export async function validateAuth(request: Request): Promise<AuthResult> {
  try {
    const accessToken = getAccessTokenCookie(request)
    
    if (!accessToken) {
      return { success: false, error: 'No access token' }
    }
    
    // Verificar cache primeiro
    const cached = getCachedSession(accessToken)
    if (cached) {
      return { success: true, payload: cached }
    }
    
    // Validar access token
    const payload = await verifyAccessToken(accessToken)
    if (payload) {
      cacheSession(accessToken, payload)
      return { success: true, payload }
    }
    
    // Se access token expirou, tentar refresh token
    const refreshToken = getRefreshTokenCookie(request)
    if (!refreshToken) {
      return { success: false, error: 'No refresh token' }
    }
    
    const refreshPayload = await verifyRefreshToken(refreshToken)
    if (!refreshPayload) {
      return { success: false, error: 'Invalid refresh token' }
    }
    
    return { 
      success: false, 
      error: 'Access token expired', 
      needsRefresh: true,
      payload: { userId: refreshPayload.userId, email: '', name: '', role: 'USER' } as SessionPayload
    }
  } catch (error) {
    return { success: false, error: 'Authentication error' }
  }
}