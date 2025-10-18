import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateAuth } from '@/lib/session'

export async function middleware(request: NextRequest) {
  // Verificar se o usuário está tentando acessar rotas protegidas
  const protectedPaths = ['/admin', '/usuario', '/rh', '/eventos', '/procedimentos', '/treinamentos']
  
  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    // Usar função centralizada de validação
    const authResult = await validateAuth(request)
    
    if (!authResult.success) {
      // Se precisa de refresh, redirecionar para refresh endpoint
      if (authResult.needsRefresh && authResult.payload) {
        const refreshUrl = new URL('/api/auth/refresh', request.url)
        refreshUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(refreshUrl)
      }
      
      // Redirecionar para a página inicial com parâmetro de login
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('auth', 'login')
      return NextResponse.redirect(loginUrl)
    }
    
    // Verificar se é rota de admin, eventos, procedimentos ou treinamentos e se o usuário tem permissão
    if ((request.nextUrl.pathname.startsWith('/admin') || 
         request.nextUrl.pathname.startsWith('/eventos') || 
         request.nextUrl.pathname.startsWith('/procedimentos') || 
         request.nextUrl.pathname.startsWith('/treinamentos')) && authResult.payload?.role !== 'ADMIN') {
      // Redirecionar para a página inicial se não for admin
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Para rotas de API, adicionar headers de autenticação
    if (request.nextUrl.pathname.startsWith('/api/') && authResult.payload) {
      const response = NextResponse.next()
      response.headers.set('x-user-id', authResult.payload.userId)
      response.headers.set('x-user-role', authResult.payload.role)
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}