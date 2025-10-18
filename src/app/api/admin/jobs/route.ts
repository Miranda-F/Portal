import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookieFromNextRequest } from '@/lib/session'
import { db } from '@/lib/db'

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

    const jobs = await db.jobPosting.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        jobApplications: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, requirements, department, salary, maxApplications, type } = await request.json()

    if (!title || !department) {
      return NextResponse.json({ error: 'Title and department are required' }, { status: 400 })
    }

    const job = await db.jobPosting.create({
      data: {
        title,
        description: description || null,
        requirements: requirements || null,
        department,
        email: "rh@pratagy.com.br", // Email padrão
        salary: salary || null,
        maxApplications: maxApplications ? parseInt(maxApplications) : null,
        type: type || 'FULL_TIME',
        createdById: authUser.userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}