import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/auth'
import { getServerSession } from '@/lib/session'
import { db } from '@/lib/db'
import { ActionType, ActionResult, RequestSource } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se o usuário é administrador
    const user = await getUserById(session.userId)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit
    
    const actionType = searchParams.get('actionType') as ActionType | null
    const result = searchParams.get('result') as ActionResult | null
    const userId = searchParams.get('userId')
    const entityType = searchParams.get('entityType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search') || ''

    // Construir filtro where
    const where: any = {}
    
    if (actionType) {
      where.actionType = actionType
    }
    
    if (result) {
      where.result = result
    }
    
    if (userId) {
      where.userId = userId
    }
    
    if (entityType) {
      where.entityType = entityType
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }
    
    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { entityName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Buscar logs de auditoria com paginação
    const [auditLogs, totalCount] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              sector: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      db.auditLog.count({ where })
    ])

    // Formatar os logs para o formato ISO 8601 e adicionar informações extras
    const formattedLogs = auditLogs.map(log => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
      // Adicionar informações do usuário se disponível
      userInfo: log.user ? {
        name: log.user.name,
        email: log.user.email,
        role: log.user.role,
        sector: log.user.sector?.name || null
      } : null
    }))

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se o usuário é administrador
    const user = await getUserById(session.userId)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validar campos obrigatórios
    const { action, description, actionType, entityType, entityId, entityName } = body
    
    if (!action || !description || !actionType) {
      return NextResponse.json(
        { error: 'Action, description, and actionType are required' },
        { status: 400 }
      )
    }

    // Criar log de auditoria manual
    const auditLog = await db.auditLog.create({
      data: {
        userId: session.userId,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action,
        actionType,
        description,
        entityType: entityType || null,
        entityId: entityId || null,
        entityName: entityName || null,
        details: body.details || null,
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request.headers.get('user-agent') || null,
        requestSource: RequestSource.WEB_INTERFACE,
        result: ActionResult.SUCCESS
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            sector: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      ...auditLog,
      createdAt: auditLog.createdAt.toISOString()
    })

  } catch (error) {
    console.error('Error creating audit log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}