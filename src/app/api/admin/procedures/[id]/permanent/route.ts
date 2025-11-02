import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'
import { join } from 'path'
import { unlink } from 'fs/promises'
import { createProcedureHistory } from '@/lib/procedure-history'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Buscar procedure antes de deletar para poder deletar o arquivo
    const procedure = await db.procedure.findUnique({
      where: { id }
    })

    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
    }

    // Deletar arquivo físico se existir
    if (procedure.fileUrl) {
      try {
        const path = join(process.cwd(), 'public', procedure.fileUrl)
        await unlink(path)
      } catch (error) {
        console.error('Error deleting file:', error)
        // Não falha se o arquivo já não existir
      }
    }

    // Criar histórico antes de deletar permanentemente
    try {
      await createProcedureHistory({
        procedureId: procedure.id,
        userId: session.userId,
        action: 'PERMANENTLY_DELETED',
        description: 'Documento deletado permanentemente da lixeira',
        oldValues: {
          id: procedure.id,
          title: procedure.title,
        },
        newValues: null,
      })
    } catch (historyError) {
      console.error('Error creating procedure history:', historyError)
    }

    // Deletar permanentemente do banco
    await db.procedure.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Procedure permanently deleted successfully' })
  } catch (error) {
    console.error('Error permanently deleting procedure:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


