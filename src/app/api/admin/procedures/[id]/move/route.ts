import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'
import { createProcedureHistory } from '@/lib/procedure-history'

async function getAuthUser(request: NextRequest) {
  const token = getSessionCookie(request)
  if (!token) return null
  
  const session = await verifySession(token)
  if (!session) return null
  
  return { userId: session.userId, userRole: session.role }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { folderPath } = body

    // Verificar se o documento existe
    const existingProcedure = await db.procedure.findUnique({
      where: { id }
    })

    if (!existingProcedure) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
    }

    const oldFolderPath = existingProcedure.folderPath

    // Atualizar o folderPath do documento
    const updatedProcedure = await db.procedure.update({
      where: { id },
      data: {
        folderPath: folderPath || null
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

    // Registrar no histórico
    await createProcedureHistory({
      procedureId: id,
      userId: authUser.userId,
      action: 'MOVED',
      description: `Documento movido de "${oldFolderPath || 'Sem pasta'}" para "${folderPath || 'Sem pasta'}"`,
      oldValues: JSON.stringify({ folderPath: oldFolderPath }),
      newValues: JSON.stringify({ folderPath: folderPath || null }),
    })

    return NextResponse.json(updatedProcedure)
  } catch (error) {
    console.error('Error moving document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

