import { NextRequest, NextResponse } from 'next/server'
import { revokeRefreshToken, revokeAllUserRefreshTokens, logAuthEvent, getClientIP, getUserAgent } from '@/lib/auth-utils'
import { verifyAccessToken } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('access_token')?.value
    const refreshToken = request.cookies.get('refresh_token')?.value
    
    let userId: string | undefined
    
    // Try to get user info from access token
    if (accessToken) {
      try {
        const payload = await verifyAccessToken(accessToken)
        if (payload) {
          userId = payload.userId
        }
      } catch (error) {
        // Access token is invalid or expired, continue with refresh token
      }
    }
    
    // Revoke refresh token if present
    if (refreshToken) {
      try {
        const [tokenId] = refreshToken.split('.')
        if (tokenId) {
          await revokeRefreshToken(tokenId)
        }
      } catch (error) {
        console.error('Error revoking refresh token:', error)
      }
    }
    
    // Revoke all user refresh tokens for security
    if (userId) {
      await revokeAllUserRefreshTokens(userId)
      
      // Log logout event
      await logAuthEvent({
        userId,
        action: 'LOGOUT',
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request)
      })
    }
    
    // Clear cookies
    const response = NextResponse.json(
      { message: 'Logout realizado com sucesso' },
      { status: 200 }
    )
    
    response.headers.set('Set-Cookie', [
      'access_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
      'refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    ].join(', '))
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar logout' },
      { status: 500 }
    )
  }
}