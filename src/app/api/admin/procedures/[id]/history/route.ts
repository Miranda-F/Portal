import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'
import { getProcedureHistory } from '@/lib/procedure-history'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if procedure exists
    const procedure = await db.procedure.findUnique({
      where: { id }
    })

    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
    }

    const history = await getProcedureHistory(id)

    return NextResponse.json(history)
  } catch (error) {
    console.error('Error fetching procedure history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}