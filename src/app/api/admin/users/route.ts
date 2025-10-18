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

    // Build where clause
    const whereClause: any = {}
    
    // Add search filter if provided
    if (search.trim()) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const users = await db.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
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
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, name, sectorId, role = 'USER', password } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Use the provided password instead of generating a temporary one
    const hashedPassword = await import('@/lib/auth').then(({ hashPassword }) => hashPassword(password))

    const user = await db.user.create({
      data: {
        email,
        name,
        sectorId,
        role,
        password: hashedPassword,
        approved: true, // All users are approved by default
      },
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
    })

    // Registrar auditoria da criação do usuário
    const adminUser = await db.user.findUnique({
      where: { id: authUser.userId },
      select: { name: true, email: true, role: true }
    })

    if (adminUser) {
      await auditCrudAction(
        request,
        'CREATE',
        'USER',
        user.id,
        user.name,
        {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        },
        null,
        {
          email: user.email,
          name: user.name,
          role: user.role,
          sectorId: user.sectorId
        }
      )
    }

    return NextResponse.json({ 
      user, 
      message: 'User created successfully' 
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}