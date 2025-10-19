import { db } from './db'

export interface ProcedureHistoryData {
  procedureId: string
  userId: string
  action: string
  description?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
}

export async function createProcedureHistory(data: ProcedureHistoryData) {
  try {
    const history = await db.procedureHistory.create({
      data: {
        procedureId: data.procedureId,
        userId: data.userId,
        action: data.action,
        description: data.description,
        oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
        newValues: data.newValues ? JSON.stringify(data.newValues) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return history
  } catch (error) {
    console.error('Error creating procedure history:', error)
    throw error
  }
}

export async function getProcedureHistory(procedureId: string) {
  try {
    const history = await db.procedureHistory.findMany({
      where: { procedureId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return history
  } catch (error) {
    console.error('Error fetching procedure history:', error)
    throw error
  }
}

export function generateProcedureUpdateDescription(
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): string {
  const changes: string[] = []

  // Check for title changes
  if (oldValues.title !== newValues.title) {
    changes.push('título')
  }

  // Check for content changes
  if (oldValues.content !== newValues.content) {
    changes.push('conteúdo')
  }

  // Check for type changes
  if (oldValues.type !== newValues.type) {
    changes.push('tipo')
  }

  // Check for status changes
  if (oldValues.status !== newValues.status) {
    changes.push('status')
  }

  // Check for sector changes
  if (oldValues.sectorId !== newValues.sectorId) {
    changes.push('setor')
  }

  // Check for document date changes
  if (oldValues.documentDate !== newValues.documentDate) {
    changes.push('data do documento')
  }

  // Check for file changes
  if (oldValues.fileUrl !== newValues.fileUrl) {
    changes.push('arquivo')
  }

  if (changes.length === 0) {
    return 'Nenhuma alteração significativa'
  }

  if (changes.length === 1) {
    return `${changes[0]} atualizado`
  }

  if (changes.length <= 3) {
    return `${changes.join(', ')} atualizados`
  }

  return 'Múltiplos campos atualizados'
}