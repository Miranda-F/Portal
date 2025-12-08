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

    // Verificar se o evento existe e está disponível
    const event = await db.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    if (event.status !== 'UPCOMING') {
      return NextResponse.json(
        { error: 'Evento não está mais disponível para inscrição' },
        { status: 400 }
      )
    }

    // Verificar se há vagas disponíveis
    if (event.maxAttendees) {
      const currentAttendees = await db.eventAttendance.count({
        where: { eventId: eventId }
      })

      if (currentAttendees >= event.maxAttendees) {
        return NextResponse.json(
          { error: 'Evento esgotado' },
          { status: 400 }
        )
      }
    }

    // Verificar se o usuário já está inscrito
    const existingRegistration = await db.eventAttendance.findFirst({
      where: {
        userId: session.userId,
        eventId: eventId
      }
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Você já está inscrito neste evento' },
        { status: 400 }
      )
    }

    // Criar inscrição
    const registration = await db.eventAttendance.create({
      data: {
        userId: session.userId,
        eventId: eventId,
        status: 'CONFIRMED'
      }
    })

    return NextResponse.json({
      message: 'Inscrição realizada com sucesso',
      registration
    })
  } catch (error) {
    console.error('Register for event error:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar inscrição' },
      { status: 500 }
    )
  }
}