import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie, verifySession } from '@/lib/session'
import { createProcedureHistory } from '@/lib/procedure-history'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getSessionCookie(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySession(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const action = (body?.action || '').toString().toUpperCase()

    if (!['VIEWED', 'DOWNLOADED', 'EDITED'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    await createProcedureHistory({
      procedureId: id,
      userId: session.userId,
      action,
      description: action === 'VIEWED'
        ? 'Documento visualizado'
        : action === 'DOWNLOADED'
          ? 'Documento baixado'
          : 'Documento editado',
      // Access logs do not need old/new values
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error logging access:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


