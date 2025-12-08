import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'

async function getAuthUser(request: NextRequest) {
  const token = getSessionCookie(request)
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

    const folders = await (db as any).folder.findMany({
      orderBy: { path: 'asc' }
    })

    return NextResponse.json({ folders })
  } catch (error) {
    console.error('Error listing folders:', error)
    return NextResponse.json(
      { error: 'Failed to list folders', details: (error as Error).message },
      { status: 500 }
    )
  }
}

