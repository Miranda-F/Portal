/**
 * Utilitários de cache para rotas da API
 * Implementa estratégias de caching para diferentes tipos de dados
 */

import { NextResponse } from 'next/server'
import cacheManager from './cache-manager'

// Tipos de cache para diferentes dados
export enum CacheType {
  // Dados que raramente mudam (ex: configurações, categorias)
  STATIC = 'static',
  // Dados que mudam com frequência moderada (ex: publicações, usuários)
  DYNAMIC = 'dynamic',
  // Dados em tempo real (ex: sessões, status)
  REALTIME = 'realtime',
  // Dados que não devem ser cacheados
  NO_CACHE = 'no-cache'
}

// Configurações de TTL para cada tipo de cache
const CACHE_TTL: Record<CacheType, number> = {
  [CacheType.STATIC]: 60 * 60 * 1000, // 1 hora
  [CacheType.DYNAMIC]: 5 * 60 * 1000, // 5 minutos
  [CacheType.REALTIME]: 30 * 1000, // 30 segundos
  [CacheType.NO_CACHE]: 0 // sem cache
}

interface CacheOptions {
  type: CacheType
  key?: string
  tags?: string[]
  revalidate?: number
}

/**
 * Cria uma chave de cache baseada na URL e parâmetros
 */
export function createCacheKey(url: string, params?: Record<string, any>): string {
  const searchParams = params ? new URLSearchParams(params).toString() : ''
  return `api:${url}${searchParams ? `?${searchParams}` : ''}`
}

/**
 * Middleware de cache para rotas da API
 */
export async function withCache<T>(
  data: T | Promise<T>,
  options: CacheOptions
): Promise<T> {
  const { type, key, tags = [] } = options
  
  if (type === CacheType.NO_CACHE) {
    return data
  }

  const cacheKey = key || createCacheKey(
    typeof window !== 'undefined' ? window.location.pathname : '',
    typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search)) : undefined
  )

  // Tentar obter do cache primeiro
  const cached = cacheManager.get<T>(cacheKey)
  if (cached !== null) {
    return cached
  }

  // Se não estiver no cache, obter os dados
  const result = await Promise.resolve(data)
  
  // Armazenar no cache
  const ttl = CACHE_TTL[type]
  if (ttl > 0) {
    cacheManager.set(cacheKey, result, ttl)
    
    // Armazenar também por tags para invalidação em grupo
    tags.forEach(tag => {
      const tagKey = `tag:${tag}`
      const cachedTags = cacheManager.get<string[]>(tagKey) || []
      if (!cachedTags.includes(cacheKey)) {
        cacheManager.set(tagKey, [...cachedTags, cacheKey], ttl)
      }
    })
  }

  return result
}

/**
 * Invalida cache por chave
 */
export function invalidateCache(key: string): void {
  cacheManager.delete(key)
}

/**
 * Invalida cache por tag
 */
export function invalidateCacheByTag(tag: string): number {
  const tagKey = `tag:${tag}`
  const keys = cacheManager.get<string[]>(tagKey) || []
  
  keys.forEach(key => {
    cacheManager.delete(key)
  })
  
  cacheManager.delete(tagKey)
  return keys.length
}

/**
 * Adiciona headers de cache à resposta
 */
export function addCacheHeaders(
  response: NextResponse,
  type: CacheType,
  maxAge?: number
): NextResponse {
  const ttl = maxAge || CACHE_TTL[type]
  
  if (type === CacheType.NO_CACHE) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  } else {
    const maxAgeSeconds = Math.floor(ttl / 1000)
    response.headers.set('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=30`)
    response.headers.set('ETag', `"${Date.now()}"`)
  }
  
  return response
}

/**
 * Verifica se a requisição pode usar cache baseado nos headers
 */
export function canUseCache(request: Request): boolean {
  const cacheControl = request.headers.get('Cache-Control')
  const pragma = request.headers.get('Pragma')
  
  // Não usar cache se explicitamente solicitado
  if (cacheControl?.includes('no-cache') || pragma?.includes('no-cache')) {
    return false
  }
  
  return true
}

/**
 * Wrapper para rotas da API com cache automático
 */
export function createCachedRoute<T>(
  handler: (request: Request, context?: any) => Promise<T>,
  options: CacheOptions
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    try {
      // Verificar se pode usar cache
      const useCache = canUseCache(request)
      
      if (useCache) {
        const cacheKey = options.key || createCacheKey(request.url)
        const cached = cacheManager.get<T>(cacheKey)
        
        if (cached !== null) {
          const response = NextResponse.json(cached)
          return addCacheHeaders(response, options.type)
        }
      }
      
      // Executar o handler
      const data = await handler(request, context)
      
      // Criar resposta
      const response = NextResponse.json(data)
      
      // Adicionar headers de cache
      addCacheHeaders(response, options.type)
      
      // Armazenar no cache se aplicável
      if (useCache && options.type !== CacheType.NO_CACHE) {
        const cacheKey = options.key || createCacheKey(request.url)
        const ttl = CACHE_TTL[options.type]
        cacheManager.set(cacheKey, data, ttl)
      }
      
      return response
    } catch (error) {
      console.error('Cache route error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Exportar tipos e utilitários
export { type CacheOptions }