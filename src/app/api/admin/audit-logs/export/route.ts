import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/auth'
import { getServerSession } from '@/lib/session'
import { db } from '@/lib/db'
import { ActionType, ActionResult } from '@prisma/client'

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

    // Buscar todos os logs de auditoria (sem paginação para exportação)
    const auditLogs = await db.auditLog.findMany({
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
      }
    })

    // Gerar CSV
    const headers = [
      'ID',
      'Data/Hora',
      'ID Usuário',
      'Nome Usuário',
      'Email Usuário',
      'Perfil Usuário',
      'Setor Usuário',
      'Tipo de Ação',
      'Ação',
      'Descrição',
      'Tipo Entidade',
      'ID Entidade',
      'Nome Entidade',
      'Resultado',
      'Código Erro',
      'Mensagem Erro',
      'IP',
      'User Agent',
      'Origem Solicitação',
      'Detalhes'
    ]

    const rows = auditLogs.map(log => [
      log.id,
      log.createdAt.toISOString(),
      log.userId || '',
      log.userName || (log.user?.name || ''),
      log.userEmail || (log.user?.email || ''),
      log.userRole || (log.user?.role || ''),
      log.user?.sector?.name || '',
      log.actionType,
      log.action,
      log.description,
      log.entityType || '',
      log.entityId || '',
      log.entityName || '',
      log.result,
      log.errorCode || '',
      log.errorMessage || '',
      log.ipAddress || '',
      log.userAgent || '',
      log.requestSource || '',
      log.details || ''
    ])

    // Criar conteúdo CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      )
    ].join('\n')

    // Adicionar BOM para Excel reconhecer UTF-8
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    // Retinar como CSV
    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting audit logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}