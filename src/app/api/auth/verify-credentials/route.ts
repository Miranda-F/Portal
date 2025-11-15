import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { verifySession, getSessionCookie } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    // Verificar se o email fornecido corresponde ao usuário logado
    if (email !== session.email) {
      return NextResponse.json({ error: 'Email não corresponde ao usuário logado' }, { status: 403 })
    }

    // Verificar credenciais
    const user = await authenticateUser(email, password)
    
    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error verifying credentials:', error)
    return NextResponse.json({ error: 'Erro ao verificar credenciais' }, { status: 500 })
  }
}


