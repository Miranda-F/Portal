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

    // Verificar se a vaga existe e está ativa
    const job = await db.jobPosting.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    if (job.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Vaga não está mais ativa' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já está inscrito
    const existingRegistration = await db.jobApplication.findFirst({
      where: {
        userId: session.userId,
        jobId: jobId
      }
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Você já está inscrito nesta vaga' },
        { status: 400 }
      )
    }

    // Criar inscrição
    const registration = await db.jobApplication.create({
      data: {
        userId: session.userId,
        jobId: jobId,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'Inscrição realizada com sucesso',
      registration
    })
  } catch (error) {
    console.error('Register for job error:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar inscrição' },
      { status: 500 }
    )
  }
}