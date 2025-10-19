import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookieFromNextRequest } from '@/lib/session'
import { db } from '@/lib/db'

async function getAuthUser(request: NextRequest) {
  const token = getSessionCookieFromNextRequest(request)
  if (!token) return null
  
  const session = await verifySession(token)
  if (!session) return null
  
  return { userId: session.userId, userRole: session.role }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use raw SQL to avoid enum issues
    const result = await db.$executeRaw`
      UPDATE Procedure 
      SET type = 'MANAGEMENT_PROCEDURE' 
      WHERE type IN ('QUALITY', 'INSPECTION', 'STRATIFICATION', 'ANNOUNCEMENT')
    `
    
    console.log('Migration result:', result)

    return NextResponse.json({ 
      message: 'Database migration completed successfully',
      updatedCount: result 
    })
  } catch (error) {
    console.error('Error updating procedures:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}