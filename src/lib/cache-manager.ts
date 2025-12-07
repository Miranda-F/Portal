/**
 * Cache Manager - Sistema de cache persistente e escalável
 * Alternativa ao Redis para ambientes de produção
 */

interface CacheEntry<T> {
  data: T
  expires: number
  createdAt: number
}

interface CacheConfig {
  defaultTTL: number // Tempo de vida padrão em milissegundos
  cleanupInterval: number // Intervalo de limpeza em milissegundos
  maxSize: number // Número máximo de entradas no cache
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private cleanupTimer: NodeJS.Timeout | null = null
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: config.defaultTTL || 15 * 60 * 1000, // 15 minutos padrão
      cleanupInterval: config.cleanupInterval || 60 * 1000, // 1 minuto
      maxSize: config.maxSize || 1000, // 1000 entradas máximas
    }

    this.startCleanupTimer()
  }

  /**
   * Define um valor no cache com TTL opcional
   */
  set<T>(key: string, data: T, ttl: number = this.config.defaultTTL): void {
    // Se o cache estiver cheio, remover a entrada mais antiga
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.findOldestEntry()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    const entry: CacheEntry<T> = {
      data,
      expires: Date.now() + ttl,
      createdAt: Date.now(),
    }

    this.cache.set(key, entry)
  }

  /**
   * Obtém um valor do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Verificar se expirou
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Verifica se uma chave existe no cache e não expirou
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Remove uma entrada específica do cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Remove entradas expiradas
   */
  cleanup(): number {
    const now = Date.now()
    let deletedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
        deletedCount++
      }
    }

    return deletedCount
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const now = Date.now()
    let expiredCount = 0
    let validCount = 0

    for (const entry of this.cache.values()) {
      if (now > entry.expires) {
        expiredCount++
      } else {
        validCount++
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      maxSize: this.config.maxSize,
      usage: `${((this.cache.size / this.config.maxSize) * 100).toFixed(1)}%`,
    }
  }

  /**
   * Encontra a entrada mais antiga no cache
   */
  private findOldestEntry(): string | null {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt
        oldestKey = key
      }
    }

    return oldestKey
  }

  /**
   * Inicia o timer de limpeza automática
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Para o timer de limpeza
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }
}

// Instância global do cache manager
const globalCacheManager = new CacheManager({
  defaultTTL: 15 * 60 * 1000, // 15 minutos
  cleanupInterval: 60 * 1000, // 1 minuto
  maxSize: 1000,
})

export default globalCacheManager

// Exportar a classe para permitir múltiplas instâncias se necessário
export { CacheManager, type CacheConfig }