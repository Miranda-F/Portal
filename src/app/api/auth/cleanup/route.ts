import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredRefreshTokens } from '@/lib/auth-utils'

// Endpoint para limpeza de tokens expirados (deve ser chamado por um cron job)
export async function POST(request: NextRequest) {
  try {
    // Verificar se é um request interno (segurança)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    const deletedCount = await cleanupExpiredRefreshTokens()
    
    return NextResponse.json({
      message: 'Limpeza concluída',
      deletedTokens: deletedCount
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Erro ao limpar tokens expirados' },
      { status: 500 }
    )
  }
}