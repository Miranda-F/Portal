import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookieFromNextRequest } from '@/lib/session'
import { db } from '@/lib/db'
import { TrainingStatus } from '@prisma/client'

async function getAuthUser(request: NextRequest) {
  // Try to get session from cookie directly
  const token = getSessionCookieFromNextRequest(request)
  if (!token) return null
  
  const session = await verifySession(token)
  if (!session) return null
  
  return { userId: session.userId, userRole: session.role }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const training = await db.training.findUnique({
      where: { id: params.id },
      include: {
        collaborator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sector: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!training) {
      return NextResponse.json(
        { error: 'Treinamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(training)
  } catch (error) {
    console.error('Erro ao buscar treinamento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar treinamento' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { collaborator, training, sector, deadline, status } = body

    // Verificar se o treinamento existe
    const existingTraining = await db.training.findUnique({
      where: { id: params.id }
    })

    if (!existingTraining) {
      return NextResponse.json(
        { error: 'Treinamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o colaborador existe (se fornecido)
    if (collaborator) {
      const collaboratorUser = await db.user.findUnique({
        where: { id: collaborator }
      })

      if (!collaboratorUser) {
        return NextResponse.json(
          { error: 'Colaborador não encontrado' },
          { status: 404 }
        )
      }
    }

    // Verificar se o setor existe (se fornecido)
    if (sector) {
      const sectorExists = await db.sector.findUnique({
        where: { id: sector }
      })

      if (!sectorExists) {
        return NextResponse.json(
          { error: 'Setor não encontrado' },
          { status: 404 }
        )
      }
    }

    // Calcular o status automaticamente se a data de vencimento for alterada
    let calculatedStatus = status
    if (deadline) {
      const deadlineDate = new Date(deadline)
      const now = new Date()
      const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDeadline < 0) {
        calculatedStatus = TrainingStatus.EXPIRED
      } else if (daysUntilDeadline <= 30) {
        calculatedStatus = TrainingStatus.PENDING
      } else {
        calculatedStatus = TrainingStatus.VALID
      }
    }

    const updatedTraining = await db.training.update({
      where: { id: params.id },
      data: {
        ...(collaborator && { collaboratorId: collaborator }),
        ...(training && { title: training }),
        ...(sector !== undefined && { sectorId: sector || null }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(calculatedStatus && { status: calculatedStatus })
      },
      include: {
        collaborator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sector: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedTraining)
  } catch (error) {
    console.error('Erro ao atualizar treinamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar treinamento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o treinamento existe
    const existingTraining = await db.training.findUnique({
      where: { id: params.id }
    })

    if (!existingTraining) {
      return NextResponse.json(
        { error: 'Treinamento não encontrado' },
        { status: 404 }
      )
    }

    await db.training.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Treinamento excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir treinamento:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir treinamento' },
      { status: 500 }
    )
  }
}