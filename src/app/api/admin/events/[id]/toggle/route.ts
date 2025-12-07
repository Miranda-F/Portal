import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { parse } from 'cookie'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const eventId = params.id

    // Get the current event
    const event = await db.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Toggle between active (UPCOMING/ONGOING) and inactive (COMPLETED/CANCELLED)
    let newStatus
    if (event.status === 'UPCOMING' || event.status === 'ONGOING') {
      // If currently active, set to CANCELLED
      newStatus = 'CANCELLED'
    } else {
      // If currently inactive, set to UPCOMING
      newStatus = 'UPCOMING'
    }

    // Update the event status
    const updatedEvent = await db.event.update({
      where: { id: eventId },
      data: { status: newStatus }
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error toggling event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}