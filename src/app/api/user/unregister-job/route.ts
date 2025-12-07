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

    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json(
        { error: 'ID da vaga é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a inscrição existe
    const existingRegistration = await db.jobApplication.findFirst({
      where: {
        userId: session.userId,
        jobId: jobId
      }
    })

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      )
    }

    // Remover inscrição
    await db.jobApplication.delete({
      where: {
        id: existingRegistration.id
      }
    })

    return NextResponse.json({
      message: 'Inscrição cancelada com sucesso'
    })
  } catch (error) {
    console.error('Unregister from job error:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar inscrição' },
      { status: 500 }
    )
  }
}