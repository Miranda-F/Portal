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

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { oldPath, newName } = await request.json()

    if (!oldPath || typeof oldPath !== 'string') {
      return NextResponse.json({ error: 'Invalid oldPath provided' }, { status: 400 })
    }

    if (!newName || typeof newName !== 'string' || !newName.trim()) {
      return NextResponse.json({ error: 'Invalid newName provided' }, { status: 400 })
    }

    // Pastas de tipo padrão da qualidade que não podem ser renomeadas
    const PROTECTED_TYPE_FOLDERS = [
      'Root/Gestão da Qualidade/Formulários',
      'Root/Gestão da Qualidade/Instrução Técnica',
      'Root/Gestão da Qualidade/Procedimentos',
      'Root/Políticas',
      'Root/Manuais',
      'Root/Registros',
    ]

    // Verificar se está tentando renomear uma pasta de tipo protegida
    if (PROTECTED_TYPE_FOLDERS.includes(oldPath)) {
      return NextResponse.json({ 
        error: 'Não é possível renomear pastas de tipo padrão da qualidade. Essas pastas são fixas e não podem ser criadas, renomeadas ou excluídas.' 
      }, { status: 400 })
    }

    // Extrair o caminho do pai e construir o novo caminho
    const pathParts = oldPath.split('/').filter(Boolean)
    const oldFolderName = pathParts.pop()
    const parentPath = pathParts.join('/')
    const newPath = parentPath ? `${parentPath}/${newName.trim()}` : newName.trim()

    // Verificar se já existe uma pasta com o novo nome no mesmo nível
    const existingFolder = await db.procedure.findFirst({
      where: {
        folderPath: {
          startsWith: newPath
        }
      }
    })

    if (existingFolder) {
      return NextResponse.json({ error: 'Já existe uma pasta com este nome' }, { status: 400 })
    }

    // Atualizar todos os documentos que estão nesta pasta ou em subpastas
    const documentsToUpdate = await db.procedure.findMany({
      where: {
        folderPath: {
          startsWith: oldPath
        }
      },
      select: {
        id: true,
        folderPath: true
      }
    })

    // Atualizar cada documento
    for (const doc of documentsToUpdate) {
      if (doc.folderPath) {
        // Substituir o caminho antigo pelo novo
        const newDocPath = doc.folderPath.replace(oldPath, newPath)
        await db.procedure.update({
          where: { id: doc.id },
          data: { folderPath: newDocPath }
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      newPath,
      updatedCount: documentsToUpdate.length 
    })
  } catch (error) {
    console.error('Error renaming folder:', error)
    return NextResponse.json(
      { error: 'Failed to rename folder', details: (error as Error).message },
      { status: 500 }
    )
  }
}






