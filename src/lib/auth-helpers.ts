import { NextRequest } from 'next/server'
import { verifySession } from '@/lib/session'
import { parse } from 'cookie'

export async function getAdminSession(request: NextRequest) {
  try {
    // pega cookie da sessão
    const cookieHeader = request.headers.get('cookie')
    
    if (!cookieHeader) {
      return { error: 'No session cookie found', status: 401 }
    }
    
    const cookies = parse(cookieHeader)
    const token = cookies.access_token
    
    if (!token) {
      return { error: 'No session token found', status: 401 }
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return { error: 'Unauthorized', status: 401 }
    }

    return { session, error: null, status: 200 }
  } catch (error) {
    console.error('Auth error:', error)
    return { error: 'Authentication failed', status: 500 }
  }
}

export function createAuthErrorResponse(error: string, status: number) {
  return Response.json({ error }, { status })
}
