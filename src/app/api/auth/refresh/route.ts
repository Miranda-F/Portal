import { NextRequest, NextResponse } from 'next/server'
import { createAccessToken } from '@/lib/session'
import { validateRefreshToken, revokeRefreshToken, createRefreshTokenForUser, logAuthEvent, getClientIP, getUserAgent } from '@/lib/auth-utils'
import { getUserById } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refresh_token')?.value
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token não encontrado' },
        { status: 401 }
      )
    }
    
    // Validate refresh token
    const validationResult = await validateRefreshToken(refreshToken)
    
    if (!validationResult) {
      return NextResponse.json(
        { error: 'Refresh token inválido' },
        { status: 401 }
      )
    }
    
    const { userId, tokenId } = validationResult
    
    // Get user data
    const user = await getUserById(userId, true)
    
    if (!user) {
      await revokeRefreshToken(tokenId)
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }
    
    // Revoke old refresh token
    await revokeRefreshToken(tokenId)
    
    // Create new access token
    const newAccessToken = await createAccessToken(user as any)
    
    // Create new refresh token
    const { tokenId: newTokenId, token: newRefreshToken } = await createRefreshTokenForUser(userId)
    
    // Log token refresh
    await logAuthEvent({
      userId,
      email: user.email,
      action: 'TOKEN_REFRESH',
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    // Set new cookies usando a API do Next.js
    const response = NextResponse.json(
      { message: 'Token atualizado com sucesso' },
      { status: 200 }
    )
    
    // Determinar se estamos em produção
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Set access token cookie (15 minutos)
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutos em segundos
      ...(isProduction && process.env.DOMAIN ? { domain: process.env.DOMAIN } : {})
    })
    
    // Set refresh token cookie (7 dias)
    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
      ...(isProduction && process.env.DOMAIN ? { domain: process.env.DOMAIN } : {})
    })
    
    return response
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar token' },
      { status: 500 }
    )
  }
}