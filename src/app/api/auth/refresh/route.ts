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
    
    // Set new cookies
    const response = NextResponse.json(
      { message: 'Token atualizado com sucesso' },
      { status: 200 }
    )
    
    response.headers.set('Set-Cookie', [
      `access_token=${newAccessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`, // 15 minutos
      `refresh_token=${newRefreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800` // 7 dias
    ].join(', '))
    
    return response
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar token' },
      { status: 500 }
    )
  }
}