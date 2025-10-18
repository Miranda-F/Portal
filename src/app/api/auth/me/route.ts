import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/session'
import { db } from '@/lib/db'
import { createAuthError } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('access_token')?.value
    
    if (!accessToken) {
      throw createAuthError('INVALID_TOKEN', 'Token não encontrado')
    }
    
    // Verify access token
    const payload = await verifyAccessToken(accessToken)
    
    if (!payload) {
      throw createAuthError('INVALID_TOKEN', 'Token inválido')
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
      throw createAuthError('USER_NOT_FOUND')
    }
    
    return NextResponse.json(userWithSector)
  } catch (error) {
    // Handle AuthError instances
    if (error && typeof error === 'object' && 'type' in error) {
      const authError = error as any
      return NextResponse.json(
        { error: authError.message || 'Erro de autenticação' },
        { status: authError.statusCode || 401 }
      )
    }
    
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Erro ao obter usuário' },
      { status: 500 }
    )
  }
}