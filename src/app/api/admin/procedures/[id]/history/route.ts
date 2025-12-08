import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'
import { getProcedureHistory } from '@/lib/procedure-history'
import { formatDateBR } from '@/lib/date-utils'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if procedure exists
    const procedure = await db.procedure.findUnique({
      where: { id }
    })

    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
    }

    // Filtrar documentos mockados - não retornar histórico para documentos mockados
    if (procedure.title && /^mock\s+doc/i.test(procedure.title)) {
      return NextResponse.json({
        versions: [],
        approvals: [],
        access: [],
      })
    }

    const history = await getProcedureHistory(id)

    // Transformar o histórico para o formato esperado pelo frontend
    // Ordenar por data de criação (mais recente primeiro)
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const filteredHistory = sortedHistory.filter(h => ['CREATED', 'UPDATED', 'RESCHEDULED', 'DELETED'].includes(h.action))
    
    // Calcular versões: CREATED = 1.0, cada UPDATED incrementa minor, RESCHEDULED mantém versão
    // Processar do mais antigo para o mais recente
    const reversedHistory = [...filteredHistory].reverse()
    let currentVersion = '1.0'
    const versionMap = new Map<string, string>()
    
    reversedHistory.forEach((h) => {
      if (h.action === 'CREATED') {
        currentVersion = '1.0'
        versionMap.set(h.id, currentVersion)
      } else if (h.action === 'UPDATED') {
        // Incrementar versão minor
        const [major, minor] = currentVersion.split('.').map(Number)
        const newMinor = minor + 1
        // Se minor chega a 10, incrementar major e zerar minor
        if (newMinor >= 10) {
          currentVersion = `${major + 1}.0`
        } else {
          currentVersion = `${major}.${newMinor}`
        }
        versionMap.set(h.id, currentVersion)
      } else if (h.action === 'RESCHEDULED') {
        // RESCHEDULED mantém a versão atual (não incrementa)
        versionMap.set(h.id, currentVersion)
      } else if (h.action === 'DELETED') {
        // DELETED mantém a versão atual
        versionMap.set(h.id, currentVersion)
      }
    })
    
    const versions = filteredHistory.map((h) => {
        const version = versionMap.get(h.id) || '1.0'

        // Melhorar descrição baseada na ação e nos valores
        let changes = h.description || ''
        if (!changes || changes === 'Nenhuma alteração significativa') {
          try {
            if (h.oldValues && h.newValues) {
              const oldVals = typeof h.oldValues === 'string' ? JSON.parse(h.oldValues) : h.oldValues
              const newVals = typeof h.newValues === 'string' ? JSON.parse(h.newValues) : h.newValues
              
              const changeList: string[] = []
              
              if (oldVals.title !== newVals.title) {
                changeList.push(`Título: "${oldVals.title}" → "${newVals.title}"`)
              }
              if (oldVals.status !== newVals.status) {
                changeList.push(`Status: "${oldVals.status}" → "${newVals.status}"`)
              }
              if (oldVals.type !== newVals.type) {
                changeList.push(`Tipo: "${oldVals.type}" → "${newVals.type}"`)
              }
              if (oldVals.sectorId !== newVals.sectorId) {
                changeList.push(`Setor alterado`)
              }
              // Comparar datas normalizando para ISO string
              const oldExpiryDate = oldVals.expiryDate ? (typeof oldVals.expiryDate === 'string' ? oldVals.expiryDate : new Date(oldVals.expiryDate).toISOString()) : null
              const newExpiryDate = newVals.expiryDate ? (typeof newVals.expiryDate === 'string' ? newVals.expiryDate : new Date(newVals.expiryDate).toISOString()) : null
              
              if (oldExpiryDate !== newExpiryDate) {
                // Formatar datas diretamente das strings ISO, evitando problemas de timezone
                // As datas já estão em formato ISO string nos oldValues/newValues
                const oldDate = oldExpiryDate ? formatDateBR(oldExpiryDate) : 'N/A'
                const newDate = newExpiryDate ? formatDateBR(newExpiryDate) : 'N/A'
                changeList.push(`Data de vencimento: ${oldDate} → ${newDate}`)
              }
              if (oldVals.fileUrl !== newVals.fileUrl) {
                changeList.push('Arquivo atualizado')
              }
              if (oldVals.content !== newVals.content) {
                changeList.push('Conteúdo atualizado')
              }
              
              if (changeList.length > 0) {
                changes = changeList.join('; ')
              } else {
                changes = h.action === 'CREATED' ? 'Documento criado' : 
                         h.action === 'UPDATED' ? 'Documento atualizado' :
                         h.action === 'RESCHEDULED' ? 'Data de vencimento reaprazada' :
                         h.action === 'DELETED' ? 'Documento deletado' : h.action
              }
            } else if (h.action === 'CREATED') {
              changes = 'Documento criado'
            } else if (h.action === 'RESCHEDULED') {
              changes = 'Data de vencimento reaprazada'
            } else if (h.action === 'DELETED') {
              changes = 'Documento deletado'
            }
          } catch (e) {
            // Se falhar ao parsear, usar descrição padrão
            changes = h.action === 'CREATED' ? 'Documento criado' : 
                     h.action === 'UPDATED' ? 'Documento atualizado' :
                     h.action === 'RESCHEDULED' ? 'Data de vencimento reaprazada' :
                     h.action === 'DELETED' ? 'Documento deletado' : h.action
          }
        }

        // Mapear ação para status apropriado
        let status: 'draft' | 'approved' | 'rejected' = 'approved'
        if (h.action === 'DELETED') {
          status = 'rejected'
        } else if (h.action === 'CREATED') {
          status = 'approved'
        } else {
          status = 'approved' // UPDATED, RESCHEDULED são considerados aprovados
        }

        return {
          id: h.id,
          documentId: h.procedureId,
          version: version,
          changes: changes,
          changedBy: h.user?.name || 'Desconhecido',
          changedAt: h.createdAt.toISOString(),
          status: status,
        }
      })

    // Aprovações - por enquanto vazio, mas pode ser expandido no futuro
    const approvals: any[] = []

    // Acessos - ações de visualização, download, etc.
    const access = history
      .filter(h => ['VIEWED', 'DOWNLOADED', 'EDITED'].includes(h.action))
      .map(h => ({
        id: h.id,
        documentId: h.procedureId,
        userId: h.userId,
        userName: h.user?.name || 'Desconhecido',
        action: h.action.toLowerCase() as 'viewed' | 'downloaded' | 'edited',
        timestamp: h.createdAt.toISOString(),
      }))

    return NextResponse.json({
      versions,
      approvals,
      access,
    })
  } catch (error) {
    console.error('Error fetching procedure history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}