import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a inscrição existe
    const existingRegistration = await db.eventAttendance.findFirst({
      where: {
        userId: session.userId,
        eventId: eventId
      }
    })

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      )
    }

    // Remover inscrição
    await db.eventAttendance.delete({
      where: {
        id: existingRegistration.id
      }
    })

    return NextResponse.json({
      message: 'Inscrição cancelada com sucesso'
    })
  } catch (error) {
    console.error('Unregister from event error:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar inscrição' },
      { status: 500 }
    )
  }
}