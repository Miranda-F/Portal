import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'
import { createProcedureHistory } from '@/lib/procedure-history'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Restaurar documento (limpar deletedAt)
    const procedure = await db.procedure.update({
      where: { id },
      data: { deletedAt: null as any },
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

    // Criar histórico da ação
    try {
      await createProcedureHistory({
        procedureId: procedure.id,
        userId: session.userId,
        action: 'RESTORED',
        description: 'Documento restaurado da lixeira',
        oldValues: {
          deletedAt: procedure.updatedAt, // aproximação
        },
        newValues: {
          deletedAt: null,
        },
      })
    } catch (historyError) {
      console.error('Error creating procedure history:', historyError)
    }

    return NextResponse.json({ message: 'Procedure restored successfully', procedure })
  } catch (error) {
    console.error('Error restoring procedure:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

