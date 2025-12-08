import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/auth'
import { verifyAccessToken, getRefreshTokenCookieFromNextRequest, createAccessToken } from '@/lib/session'
import { db } from '@/lib/db'
import { createAuthError, validateRefreshToken, revokeRefreshToken, createRefreshTokenForUser, AuthErrorType } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      // Retornar null em vez de erro 401 para evitar logs de erro no console
      return NextResponse.json(null)
    }

    // Verify access token
    let payload = await verifyAccessToken(accessToken)

    // Se o access token expirou, tentar fazer refresh
    if (!payload) {
      const refreshToken = getRefreshTokenCookieFromNextRequest(request)

      if (refreshToken) {
        try {
          // Validar refresh token
          const validationResult = await validateRefreshToken(refreshToken)

          if (validationResult) {
            const { userId, tokenId } = validationResult

            // Get user data
            const user = await getUserById(userId, false)

            if (user) {
              // Revoke old refresh token
              await revokeRefreshToken(tokenId)

              // Create new access token
              const newAccessToken = await createAccessToken(user as any)

              // Create new refresh token
              const { tokenId: newTokenId, token: newRefreshToken } = await createRefreshTokenForUser(userId)

              // Verificar payload do novo access token
              payload = await verifyAccessToken(newAccessToken)

              // Determinar se estamos em produção
              const isProduction = process.env.NODE_ENV === 'production'

              // Get user with sector information (mesmo formato que o retorno normal)
              const userWithSector = await db.user.findUnique({
                where: { id: userId },
                select: {
                  id: true,
                  email: true,
                  name: true,
                  sectorId: true,
                  showIdentityCard: true,
                  approved: true,
                  sector: {
                    select: {
                      name: true
                    }
                  },
                  role: true,
                  photoUrl: true,
                  lastLogin: true,
                  createdAt: true,
                }
              })

              if (!userWithSector) {
                // Usuário não encontrado, retornar null
                return NextResponse.json(null)
              }

              // Criar response e definir novos cookies
              const userResponse = NextResponse.json(userWithSector)

              // Set access token cookie (15 minutos)
              userResponse.cookies.set('access_token', newAccessToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'strict',
                path: '/',
                maxAge: 15 * 60, // 15 minutos em segundos
                ...(isProduction && process.env.DOMAIN ? { domain: process.env.DOMAIN } : {})
              })

              // Set refresh token cookie (7 dias)
              userResponse.cookies.set('refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'strict',
                path: '/',
                maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
                ...(isProduction && process.env.DOMAIN ? { domain: process.env.DOMAIN } : {})
              })

              return userResponse
            }
          }
        } catch (refreshError) {
          console.error('Error refreshing token in /api/auth/me:', refreshError)
          // Continuar com o fluxo normal (retornar null) se o refresh falhar
        }
      }

      // Se ainda não temos payload após tentar refresh, retornar null
      if (!payload) {
        return NextResponse.json(null)
      }
    }

    // Get user with sector information
    const userWithSector = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        sectorId: true,
        showIdentityCard: true,
        approved: true,
        sector: {
          select: {
            name: true
          }
        },
        role: true,
        photoUrl: true,
        lastLogin: true,
        createdAt: true,
      }
    })

    if (!userWithSector) {
      return NextResponse.json(null)
    }

    return NextResponse.json(userWithSector)
  } catch (error) {
    // Handle AuthError instances
    if (error && typeof error === 'object' && 'type' in error) {
      // Se for erro de autenticação, retornar null em vez de erro
      return NextResponse.json(null)
    }

    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Erro ao obter usuário' },
      { status: 500 }
    )
  }
}