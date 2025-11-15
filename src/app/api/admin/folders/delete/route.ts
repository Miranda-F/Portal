import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'

async function getAuthUser(request: NextRequest) {
  const token = getSessionCookie(request)
  if (!token) return null
  
  const session = await verifySession(token)
  if (!session) return null
  
  return { userId: session.userId, userRole: session.role }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderPath = searchParams.get('path')

    if (!folderPath || typeof folderPath !== 'string') {
      return NextResponse.json({ error: 'Invalid folderPath provided' }, { status: 400 })
    }

    // Pastas de tipo padrão da qualidade que não podem ser excluídas
    const PROTECTED_TYPE_FOLDERS = [
      'Root/Gestão da Qualidade/Formulários',
      'Root/Gestão da Qualidade/Instrução Técnica',
      'Root/Gestão da Qualidade/Procedimentos',
      'Root/Políticas',
      'Root/Manuais',
      'Root/Registros',
    ]

    // Verificar se está tentando excluir uma pasta de tipo protegida
    if (PROTECTED_TYPE_FOLDERS.includes(folderPath)) {
      return NextResponse.json({ 
        error: 'Não é possível excluir pastas de tipo padrão da qualidade. Essas pastas são fixas e não podem ser criadas, renomeadas ou excluídas.' 
      }, { status: 400 })
    }

    // Extrair o caminho do pai
    const pathParts = folderPath.split('/').filter(Boolean)
    pathParts.pop()
    const parentPath = pathParts.join('/') || null

    // Mapeamento de pastas de tipo
    const typeFolders = {
      'Formulários': 'Root/Gestão da Qualidade/Formulários',
      'Instrução Técnica': 'Root/Gestão da Qualidade/Instrução Técnica',
      'Procedimentos': 'Root/Gestão da Qualidade/Procedimentos',
      'Políticas': 'Root/Políticas',
      'Manuais': 'Root/Manuais',
      'Registros': 'Root/Registros',
    }

    // Função para encontrar a pasta de tipo correspondente baseada no folderPath do documento
    // Se o documento está dentro de uma pasta de tipo (mesmo que em subpasta), retorna a pasta de tipo
    const findTypeFolderFromPath = (docFolderPath: string | null): string | null => {
      if (!docFolderPath) return null
      
      // Verificar se o documento está dentro de alguma pasta de tipo
      for (const [name, path] of Object.entries(typeFolders)) {
        if (docFolderPath.startsWith(path)) {
          return path
        }
      }
      return null
    }

    // Encontrar todos os documentos que estão nesta pasta ou em subpastas
    // Incluir o tipo do documento para determinar a pasta de certificado correspondente
    const documentsToUpdate = await db.procedure.findMany({
      where: {
        folderPath: {
          startsWith: folderPath
        }
      },
      select: {
        id: true,
        folderPath: true,
        type: true
      }
    })

    // Atualizar cada documento: mover para a pasta de tipo correspondente ao tipo/classificação
    for (const doc of documentsToUpdate) {
      // Primeiro, tentar encontrar a pasta de tipo baseada no folderPath atual
      let targetFolder: string | null = null
      
      if (doc.folderPath) {
        // Se o documento está dentro de uma pasta de tipo, usar essa pasta
        targetFolder = findTypeFolderFromPath(doc.folderPath)
      }
      
      // Se não encontrou pelo folderPath, usar a lógica antiga (mover para o pai)
      if (!targetFolder) {
        if (doc.folderPath === folderPath) {
          targetFolder = parentPath
        } else if (doc.folderPath) {
          // Se está em uma subpasta, remover a parte do caminho correspondente a esta pasta
          const remainingPath = doc.folderPath.replace(`${folderPath}/`, '')
          targetFolder = parentPath ? `${parentPath}/${remainingPath}` : remainingPath
        } else {
          targetFolder = parentPath
        }
      }
      
      // Atualizar o documento
      await db.procedure.update({
        where: { id: doc.id },
        data: { folderPath: targetFolder }
      })
    }

    return NextResponse.json({ 
      success: true, 
      updatedCount: documentsToUpdate.length 
    })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { error: 'Failed to delete folder', details: (error as Error).message },
      { status: 500 }
    )
  }
}






