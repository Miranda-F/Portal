import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const registrations = await db.eventAttendance.findMany({
      where: {
        userId: session.userId
      },
      select: {
        id: true,
        eventId: true,
        status: true,
        createdAt: true,
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Get event registrations error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar inscrições' },
      { status: 500 }
    )
  }
}