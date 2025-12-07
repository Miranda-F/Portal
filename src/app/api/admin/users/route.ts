import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookieFromNextRequest } from '@/lib/session'
import { db } from '@/lib/db'
import { User } from '@prisma/client'
import { auditCrudAction } from '@/lib/audit-middleware'
import { ActionType } from '@prisma/client'

async function getAuthUser(request: NextRequest) {
  // Try to get session from cookie directly
  const token = getSessionCookieFromNextRequest(request)
  if (!token) return null
  
  const session = await verifySession(token)
  if (!session) return null
  
  return { userId: session.userId, userRole: session.role }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const pending = searchParams.get('pending') === 'true'
    const active = searchParams.get('active') === 'true'
    const sectorId = searchParams.get('sectorId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100 por página
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {}
    
    // Add pending filter
    if (pending) {
      whereClause.approved = false
    }
    
    // Add active filter
    if (active) {
      whereClause.approved = true
    }
    
    // Add sector filter
    if (sectorId) {
      whereClause.sectorId = sectorId
    }
    
    // Add search filter if provided
    if (search.trim()) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Usar Promise.all para buscar dados e contagem em paralelo
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          sectorId: true,
          role: true,
          photoUrl: true,
          approved: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          showIdentityCard: true,
          sector: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      db.user.count({ where: whereClause })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
