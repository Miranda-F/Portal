import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySession, getSessionCookieFromNextRequest } from '@/lib/session'
import { parse } from 'cookie'
import { auditCrudAction } from '@/lib/audit-middleware'
import { getClientIP, getUserAgent } from '@/lib/auth-utils'

async function getAuthUser(request: NextRequest) {
  // Try to get session from cookie directly
  const token = getSessionCookieFromNextRequest(request)
  
  if (!token) return null
  
  const session = verifySession(token)
  if (!session) return null
  
  return { userId: session.userId, userRole: session.role }
}

export async function GET(request: NextRequest) {
  try {
    // Get session cookie directly from request
    const cookieHeader = request.headers.get('cookie')
    
    if (!cookieHeader) {
      return NextResponse.json({ error: 'No session cookie found' }, { status: 401 })
    }
    
    const cookies = parse(cookieHeader)
    const token = cookies.access_token
    
    if (!token) {
      return NextResponse.json({ error: 'No session token found' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // Build where clause
    const whereClause: any = {}
    
    // Add search filter if provided
    if (search.trim()) {
      whereClause.name = { contains: search, mode: 'insensitive' }
    }
    
    // Add status filter
    if (status === 'active') {
      whereClause.active = true
    } else if (status === 'inactive') {
      whereClause.active = false
    }
    
    const sectors = await db.sector.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    return NextResponse.json(sectors)
  } catch (error) {
    console.error('Error fetching sectors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session cookie directly from request
    const cookieHeader = request.headers.get('cookie')
    
    if (!cookieHeader) {
      return NextResponse.json({ error: 'No session cookie found' }, { status: 401 })
    }
    
    const cookies = parse(cookieHeader)
    const token = cookies.access_token
    
    if (!token) {
      return NextResponse.json({ error: 'No session token found' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Sector name is required' }, { status: 400 })
    }

    // Check if sector already exists
    const existingSector = await db.sector.findUnique({
      where: { name }
    })

    if (existingSector) {
      return NextResponse.json({ error: 'Sector with this name already exists' }, { status: 400 })
    }

    const sector = await db.sector.create({
      data: {
        name,
        description,
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    // Registrar auditoria da criação
    await auditCrudAction(
      request,
      'CREATE',
      'SECTOR',
      sector.id,
      sector.name,
      {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role
      },
      null,
      {
        name: sector.name,
        description: sector.description,
        active: sector.active
      }
    )

    return NextResponse.json(sector)
  } catch (error) {
    console.error('Error creating sector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}