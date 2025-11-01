import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar documentos deletados (na lixeira)
    // SQLite armazena como TEXT, então precisamos usar queryRaw ou verificar não-nulo
    const procedures = await db.procedure.findMany({
      where: { deletedAt: { not: null } as any },
      orderBy: { deletedAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(procedures)
  } catch (error) {
    console.error('Error fetching trash:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

