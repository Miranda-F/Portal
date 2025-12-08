import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Get user with sector
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        sectorId: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Build where clause based on user role and sector
    const whereClause: any = {}

    // If user is admin, show all procedures regardless of status
    if (user.role === 'ADMIN') {
      // Admin sees all procedures, no status filter
    } else {
      // Non-admin users only see published procedures
      whereClause.status = 'PUBLISHED'
      
      // If user is not admin and has a sector, filter by sector
      if (user.sectorId) {
        whereClause.sectorId = user.sectorId
      }
      // If user is not admin and has no sector, show no procedures
      else if (!user.sectorId) {
        whereClause.id = 'never-match' // This will return no results
      }
    }

    const procedures = await db.procedure.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        status: true,
        expiryDate: true, // Incluir expiryDate para filtro no frontend
        fileUrl: true,
        fileName: true,
        fileSize: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(procedures)
  } catch (error) {
    console.error('Get procedures error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar documentos' },
      { status: 500 }
    )
  }
}