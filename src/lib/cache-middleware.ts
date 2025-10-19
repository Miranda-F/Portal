/**
 * Middleware de cache para gerenciamento global de caching
 * Fornece utilitários para invalidação de cache baseada em eventos
 */

import { NextRequest, NextResponse } from 'next/server'
import cacheManager from './cache-manager'
import { invalidateCacheByTag } from './api-cache'

// Eventos que podem invalidar cache
export enum CacheEvent {
  USER_CREATED = 'user:created',
  USER_UPDATED = 'user:updated',
  USER_DELETED = 'user:deleted',
  PUBLICATION_CREATED = 'publication:created',
  PUBLICATION_UPDATED = 'publication:updated',
  PUBLICATION_DELETED = 'publication:deleted',
  SECTOR_CREATED = 'sector:created',
  SECTOR_UPDATED = 'sector:updated',
  SECTOR_DELETED = 'sector:deleted',
  SETTINGS_UPDATED = 'settings:updated',
}

// Mapeamento de eventos para tags de cache
const EVENT_TO_TAGS: Record<CacheEvent, string[]> = {
  [CacheEvent.USER_CREATED]: ['users'],
  [CacheEvent.USER_UPDATED]: ['users'],
  [CacheEvent.USER_DELETED]: ['users'],
  [CacheEvent.PUBLICATION_CREATED]: ['publications'],
  [CacheEvent.PUBLICATION_UPDATED]: ['publications'],
  [CacheEvent.PUBLICATION_DELETED]: ['publications'],
  [CacheEvent.SECTOR_CREATED]: ['sectors', 'users'],
  [CacheEvent.SECTOR_UPDATED]: ['sectors', 'users'],
  [CacheEvent.SECTOR_DELETED]: ['sectors', 'users'],
  [CacheEvent.SETTINGS_UPDATED]: ['settings'],
}

/**
 * Dispara um evento de invalidação de cache
 */
export function triggerCacheEvent(event: CacheEvent): void {
  const tags = EVENT_TO_TAGS[event] || []
  
  tags.forEach(tag => {
    const invalidated = invalidateCacheByTag(tag)
    console.log(`Cache invalidated for tag "${tag}": ${invalidated} entries`)
  })
}

/**
 * Middleware para adicionar headers de cache baseado no tipo de conteúdo
 */
export function addCacheHeadersToResponse(
  response: NextResponse,
  type: 'static' | 'dynamic' | 'no-cache' = 'dynamic'
): NextResponse {
  switch (type) {
    case 'static':
      response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=60')
      break
    case 'dynamic':
      response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=30')
      break
    case 'no-cache':
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      break
  }
  
  return response
}

/**
 * Verifica se uma rota deve ser cacheada baseado no padrão da URL
 */
export function shouldCacheRoute(url: string): boolean {
  const noCachePatterns = [
    /\/api\/auth\//, // Rotas de autenticação
    /\/api\/user\/.*\/profile/, // Perfil de usuário
    /\/api\/admin\/.*\/toggle/, // Toggle operations
    /\/api\/.*\/export/, // Export operations
    /\/api\/.*\/upload/, // Upload operations
  ]
  
  return !noCachePatterns.some(pattern => pattern.test(url))
}

/**
 * Obtém o tipo de cache baseado na rota
 */
export function getCacheTypeForRoute(url: string): 'static' | 'dynamic' | 'no-cache' {
  if (!shouldCacheRoute(url)) {
    return 'no-cache'
  }
  
  const staticPatterns = [
    /\/api\/sectors/,
    /\/api\/categories/,
    /\/api\/settings/,
    /\/api\/health/,
  ]
  
  if (staticPatterns.some(pattern => pattern.test(url))) {
    return 'static'
  }
  
  return 'dynamic'
}

/**
 * Middleware global para caching de rotas da API
 */
export function cacheMiddleware(request: NextRequest): NextResponse | null {
  const url = new URL(request.url)
  
  // Aplicar apenas para rotas da API
  if (!url.pathname.startsWith('/api/')) {
    return null
  }
  
  const cacheType = getCacheTypeForRoute(url.pathname)
  
  // Para requisições que não devem ser cacheadas, apenas adicionar headers
  if (cacheType === 'no-cache') {
    const response = NextResponse.next()
    return addCacheHeadersToResponse(response, 'no-cache')
  }
  
  return null // Deixar o fluxo normal continuar
}

/**
 * Limpa todo o cache (útil para desenvolvimento e testes)
 */
export function clearAllCache(): void {
  cacheManager.clear()
  console.log('All cache cleared')
}

/**
 * Obtém estatísticas do cache
 */
export function getCacheStats() {
  return cacheManager.getStats()
}

/**
 * Verifica a saúde do cache
 */
export function checkCacheHealth(): { healthy: boolean; issues: string[] } {
  const stats = getCacheStats()
  const issues: string[] = []
  
  if (stats.total > stats.maxSize * 0.9) {
    issues.push('Cache usage is above 90% capacity')
  }
  
  if (stats.expired > stats.total * 0.1) {
    issues.push('High number of expired entries in cache')
  }
  
  return {
    healthy: issues.length === 0,
    issues,
  }
}

// Exportar tipos e enums
export { CacheEvent }