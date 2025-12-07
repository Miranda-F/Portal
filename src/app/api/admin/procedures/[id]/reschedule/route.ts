import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'
import { createProcedureHistory, getProcedureHistory } from '@/lib/procedure-history'
import { parseLocalDate, formatDateBR } from '@/lib/date-utils'

// Função auxiliar para calcular a versão atual baseada no histórico
function calculateCurrentVersion(history: any[]): string {
  const filteredHistory = history.filter((h: any) => ['CREATED', 'UPDATED', 'RESCHEDULED', 'DELETED'].includes(h.action))
  const reversedHistory = [...filteredHistory].reverse()
  let currentVersion = '1.0'
  
  reversedHistory.forEach((h: any) => {
    if (h.action === 'CREATED') {
      currentVersion = '1.0'
    } else if (h.action === 'UPDATED') {
      const [major, minor] = currentVersion.split('.').map(Number)
      const newMinor = minor + 1
      if (newMinor >= 10) {
        currentVersion = `${major + 1}.0`
      } else {
        currentVersion = `${major}.${newMinor}`
      }
    }
    // RESCHEDULED e DELETED mantêm a versão atual
  })
  
  return currentVersion
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Buscar o procedimento existente
    const existingProcedure = await db.procedure.findUnique({
      where: { id },
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

    if (!existingProcedure) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
    }

    // Obter a nova data de vencimento do FormData
    const formData = await request.formData()
    const expiryDateStr = formData.get('expiryDate') as string | null

    if (!expiryDateStr) {
      return NextResponse.json({ error: 'Expiry date is required' }, { status: 400 })
    }

    // Criar data como meia-noite UTC para garantir consistência
    const expiryDate = parseLocalDate(expiryDateStr)

    // Validar que a data não é anterior à data atual (usando UTC para comparação)
    const now = new Date()
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
    
    if (expiryDate < todayUTC) {
      return NextResponse.json({ error: 'Expiry date cannot be in the past' }, { status: 400 })
    }

    // Atualizar apenas a data de vencimento
    const updatedProcedure = await db.procedure.update({
      where: { id },
      data: {
        expiryDate: expiryDate
      },
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

    // Criar registro de histórico para o reaprazamento
    try {
      await createProcedureHistory({
        procedureId: updatedProcedure.id,
        userId: session.userId,
        action: 'RESCHEDULED',
        description: `Data de vencimento reaprazada de ${formatDateBR(existingProcedure.expiryDate)} para ${formatDateBR(expiryDate)}`,
        oldValues: {
          expiryDate: existingProcedure.expiryDate ? existingProcedure.expiryDate.toISOString() : null
        },
        newValues: {
          expiryDate: updatedProcedure.expiryDate ? updatedProcedure.expiryDate.toISOString() : null
        }
      })
    } catch (historyError) {
      console.error('Error creating procedure history:', historyError)
      // Não falha a operação se o histórico falhar
    }

    // Calcular versão atual (RESCHEDULED não incrementa versão)
    try {
      const history = await getProcedureHistory(updatedProcedure.id)
      const currentVersion = calculateCurrentVersion(history)
      return NextResponse.json({
        ...updatedProcedure,
        version: currentVersion
      })
    } catch (versionError) {
      console.warn('Error calculating version:', versionError)
      return NextResponse.json(updatedProcedure)
    }
  } catch (error) {
    console.error('Error rescheduling procedure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


