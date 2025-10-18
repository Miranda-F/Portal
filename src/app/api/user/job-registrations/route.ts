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

    const registrations = await db.jobApplication.findMany({
      where: {
        userId: session.userId
      },
      select: {
        id: true,
        jobId: true,
        status: true,
        createdAt: true,
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Get job registrations error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar inscrições' },
      { status: 500 }
    )
  }
}