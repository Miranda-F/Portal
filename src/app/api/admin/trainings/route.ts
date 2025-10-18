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

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Construir a cláusula WHERE
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { collaborator: { name: { contains: search, mode: 'insensitive' } } },
        { sector: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status as TrainingStatus
    }

    const [trainings, total] = await Promise.all([
      db.training.findMany({
        where,
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
        },
        orderBy: [
          { deadline: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      db.training.count({ where })
    ])

    return NextResponse.json({
      trainings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar treinamentos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar treinamentos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { collaborator, training, sector, deadline, status } = body

    // Validação básica
    if (!collaborator || !training || !deadline) {
      return NextResponse.json(
        { error: 'Colaborador, treinamento e data de vencimento são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o colaborador existe
    const collaboratorUser = await db.user.findUnique({
      where: { id: collaborator }
    })

    if (!collaboratorUser) {
      return NextResponse.json(
        { error: 'Colaborador não encontrado' },
        { status: 404 }
      )
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

    // Calcular o status com base na data de vencimento
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    let calculatedStatus = TrainingStatus.VALID
    if (daysUntilDeadline < 0) {
      calculatedStatus = TrainingStatus.EXPIRED
    } else if (daysUntilDeadline <= 30) {
      calculatedStatus = TrainingStatus.PENDING
    }

    const newTraining = await db.training.create({
      data: {
        title: training,
        collaboratorId: collaborator,
        sectorId: sector || null,
        deadline: deadlineDate,
        status: calculatedStatus
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

    return NextResponse.json(newTraining, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar treinamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar treinamento' },
      { status: 500 }
    )
  }
}