import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'

async function getAuthUser(request: NextRequest) {
  const token = getSessionCookie(request)
  if (!token) return null
  
  const session = await verifySession(token)
  if (!session) return null
  
  return { userId: session.userId, userRole: session.role }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { parentPath, folderName } = await request.json()

    if (!parentPath || typeof parentPath !== 'string') {
      return NextResponse.json({ error: 'Invalid parentPath provided' }, { status: 400 })
    }

    if (!folderName || typeof folderName !== 'string' || !folderName.trim()) {
      return NextResponse.json({ error: 'Invalid folderName provided' }, { status: 400 })
    }

    // Pastas de tipo padrão da qualidade que não podem ser criadas
    const PROTECTED_TYPE_FOLDER_NAMES = [
      'Formulários',
      'Instrução Técnica',
      'Procedimentos',
      'Políticas',
      'Manuais',
      'Registros',
    ]

    // Verificar se está tentando criar uma pasta de tipo diretamente dentro de Gestão da Qualidade
    if (parentPath === 'Root/Gestão da Qualidade') {
      if (PROTECTED_TYPE_FOLDER_NAMES.includes(folderName.trim())) {
        return NextResponse.json({ 
          error: 'Não é possível criar pastas de tipo padrão da qualidade. Essas pastas são fixas e não podem ser criadas, renomeadas ou excluídas.' 
        }, { status: 400 })
      }
    }

    // Construir o novo caminho
    const newPath = parentPath ? `${parentPath}/${folderName.trim()}` : folderName.trim()

    // A criação da pasta é apenas lógica - não há tabela de pastas
    // A pasta será criada quando um documento for atribuído a ela
    // Por enquanto, apenas retornar sucesso
    return NextResponse.json({ 
      success: true, 
      newPath,
      message: 'Pasta criada com sucesso. A pasta aparecerá quando um documento for atribuído a ela.'
    })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder', details: (error as Error).message },
      { status: 500 }
    )
  }
}






