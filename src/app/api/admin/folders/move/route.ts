import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie, verifyRefreshToken } from '@/lib/session'
import { db } from '@/lib/db'

async function getAuthUser(request: NextRequest) {
  const token = getSessionCookie(request)

  // 1. Tentar validar access token (mais rápido, sem DB)
  if (token) {
    const session = await verifySession(token)
    if (session) {
      return { userId: session.userId, userRole: session.role }
    }
  }

  // 2. Fallback: Se access token inválido/expirado, tentar refresh token
  const refreshToken = request.cookies.get('refresh_token')?.value
  if (refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken)
    if (refreshPayload) {
      // Buscar role atualizada do banco
      const user = await db.user.findUnique({
        where: { id: refreshPayload.userId },
        select: { id: true, role: true }
      })

      if (user) {
        return { userId: user.id, userRole: user.role }
      }
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { oldPath, newPath } = await request.json()

    if (!oldPath || typeof oldPath !== 'string') {
      return NextResponse.json({ error: 'Invalid oldPath provided' }, { status: 400 })
    }

    if (!newPath || typeof newPath !== 'string') {
      return NextResponse.json({ error: 'Invalid newPath provided' }, { status: 400 })
    }

    if (oldPath === newPath) {
      return NextResponse.json({ error: 'Old path and new path cannot be the same' }, { status: 400 })
    }

    // Verificar se não está tentando mover para dentro de si mesma
    if (newPath.startsWith(oldPath + '/')) {
      return NextResponse.json({ error: 'Não é possível mover uma pasta para dentro de si mesma' }, { status: 400 })
    }

    // Pastas protegidas não podem ser movidas
    const PROTECTED_ROOT_FOLDERS = [
      'Root',
      'Root/Área Técnica',
      'Root/Gestão da Qualidade',
      'Root/Gestão da Qualidade/Certificados',
      'Root/Meio Ambiente',
      'Root/Produção',
      'Root/Recursos Humanos',
      'Root/Segurança do Trabalho',
      'Root/SGI',
      'Root/Gestão da Qualidade/Modelo de Doc',
      'Root/Gestão da Qualidade/Normas',
      'Root/Gestão da Qualidade/Treinamento',
    ]

    const PROTECTED_TYPE_FOLDERS = [
      'Root/Gestão da Qualidade/Formulários',
      'Root/Gestão da Qualidade/Instrução Técnica',
      'Root/Gestão da Qualidade/Procedimentos',
      'Root/Políticas',
      'Root/Manuais',
      'Root/Registros',
    ]

    if (PROTECTED_ROOT_FOLDERS.includes(oldPath) || PROTECTED_TYPE_FOLDERS.includes(oldPath)) {
      return NextResponse.json({
        error: 'Não é possível mover pastas pré-definidas. Apenas pastas criadas pelo usuário podem ser movidas.'
      }, { status: 400 })
    }

    // Mover todos os documentos da pasta antiga para a nova
    const documents = await db.procedure.findMany({
      where: {
        folderPath: {
          startsWith: oldPath + '/'
        }
      }
    })

    let updatedCount = 0

    for (const doc of documents) {
      if (doc.folderPath) {
        // Substituir o caminho antigo pelo novo
        const newDocPath = doc.folderPath.replace(oldPath, newPath)

        await db.procedure.update({
          where: { id: doc.id },
          data: { folderPath: newDocPath }
        })

        updatedCount++
      }
    }

    // Também mover documentos que estão diretamente na pasta (sem subpasta)
    const directDocuments = await db.procedure.findMany({
      where: {
        folderPath: oldPath
      }
    })

    for (const doc of directDocuments) {
      await db.procedure.update({
        where: { id: doc.id },
        data: { folderPath: newPath }
      })

      updatedCount++
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `Pasta movida com sucesso. ${updatedCount} documento(s) atualizado(s).`
    })
  } catch (error) {
    console.error('Error moving folder:', error)
    return NextResponse.json(
      { error: 'Failed to move folder', details: (error as Error).message },
      { status: 500 }
    )
  }
}

