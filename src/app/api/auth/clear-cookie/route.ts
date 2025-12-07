import { NextRequest, NextResponse } from 'next/server'

// Este endpoint só deve estar disponível em desenvolvimento
export async function GET(request: NextRequest) {
  // Verificar se está em produção
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint não disponível em produção' },
      { status: 404 }
    )
  }
  
  try {
    // Limpar ambos os cookies
    const response = NextResponse.json({ message: 'Cookies limpos com sucesso' })
    
    response.headers.set('Set-Cookie', [
      'access_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
      'refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    ].join(', '))
    
    return response
  } catch (error) {
    console.error('Error clearing cookies:', error)
    return NextResponse.json(
      { error: 'Erro ao limpar cookies' },
      { status: 500 }
    )
  }
}