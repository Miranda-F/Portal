import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { createAccessToken } from '@/lib/session'
import { createRefreshTokenForUser, logAuthEvent, getClientIP, getUserAgent, createAuthError } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // Authenticate user
    const user = await authenticateUser(validatedData.email, validatedData.password)
    
    if (!user) {
      await logAuthEvent({
        email: validatedData.email,
        action: 'LOGIN_FAILED',
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { reason: 'invalid_credentials' }
      })
      
      throw createAuthError('INVALID_CREDENTIALS')
    }
    
    // Check if user is approved (active)
    if (!user.approved) {
      await logAuthEvent({
        userId: user.id,
        email: user.email,
        action: 'LOGIN_FAILED',
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { reason: 'account_deactivated' }
      })
      
      throw createAuthError('ACCOUNT_DEACTIVATED', 'Sua conta foi desativada. Entre em contato com o administrador.')
    }
    
    // Update last login timestamp
    try {
      await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })
    } catch (error) {
      console.error('Error updating last login:', error)
      // Don't fail the login if we can't update the timestamp
    }
    
    // Create access token
    const accessToken = await createAccessToken(user as any)
    
    // Create refresh token
    const { tokenId, token: refreshToken } = await createRefreshTokenForUser(user.id)
    
    // Log successful login
    await logAuthEvent({
      userId: user.id,
      email: user.email,
      action: 'LOGIN_SUCCESS',
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    // Set cookies usando a API do Next.js
    const response = NextResponse.json(
      { 
        message: 'Login realizado com sucesso', 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          role: user.role,
          showIdentityCard: user.showIdentityCard,
          approved: user.approved,
          sectorId: user.sectorId,
          photoUrl: user.photoUrl
        }
      },
      { status: 200 }
    )
    
    // Determinar se estamos em produção
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Set access token cookie (15 minutos)
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutos em segundos
      ...(isProduction && process.env.DOMAIN ? { domain: process.env.DOMAIN } : {})
    })
    
    // Set refresh token cookie (7 dias)
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
      ...(isProduction && process.env.DOMAIN ? { domain: process.env.DOMAIN } : {})
    })
    
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    // Handle AuthError instances
    if (error && typeof error === 'object' && 'type' in error) {
      const authError = error as any
      return NextResponse.json(
        { error: authError.message || 'Erro de autenticação' },
        { status: authError.statusCode || 401 }
      )
    }
    
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar login' },
      { status: 500 }
    )
  }
}