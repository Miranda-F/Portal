'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@prisma/client'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

interface AuthUser {
  id: string
  email: string
  name: string
  sectorId?: string  // Campo opcional
  sector?: {
    name: string
  }
  showIdentityCard: boolean
  approved: boolean
  role: 'USER' | 'ADMIN'
  photoUrl?: string  // Campo opcional
}

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  authChecked: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  checkAuth: (forceRefresh?: boolean) => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
}

// Cache configuration
const AUTH_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const LOCAL_STORAGE_KEY = 'auth-cache'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Local storage cache interface com versionamento para evitar problemas de compatibilidade
interface AuthCache {
  user: AuthUser | null
  timestamp: number
  version: string
}

/**
 * Função helper genérica para fetch com timeout
 * Reduz repetição de código e centraliza lógica de timeout
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 5000
): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      throw new Error(`Timeout após ${timeoutMs}ms`)
    }
    
    throw error
  }
}

/**
 * Função helper para retry com backoff exponencial
 * Evita retry em falhas 401 (Unauthorized) mas mantém para falhas de rede/transientes
 */
const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY,
  skipRetryForStatuses: number[] = [401] // Não retry em 401
): Promise<T> => {
  let lastError: Error
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // Verifica se é um erro HTTP e se o status deve pular retry
      if (error.response?.status && skipRetryForStatuses.includes(error.response.status)) {
        throw lastError
      }
      
      // Verifica se é erro de rede (não tem response)
      if (!error.response && i === maxRetries - 1) {
        throw lastError
      }
      
      if (i === maxRetries - 1) {
        throw lastError
      }
      
      // Backoff exponencial: 1s, 2s, 4s...
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw lastError!
}

/**
 * Funções de gerenciamento de localStorage com tratamento robusto de erros
 * Segurança: não armazena informações sensíveis, apenas dados básicos do usuário
 */
const getAuthCache = (): AuthCache | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!cached) return null
    
    const cache: AuthCache = JSON.parse(cached)
    const now = Date.now()
    
    // Verifica expiração do cache
    if (now - cache.timestamp > AUTH_CACHE_DURATION) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      return null
    }
    
    // Valida estrutura e versão para evitar problemas de compatibilidade
    if (!cache.version || cache.version !== '1.0') {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      return null
    }
    
    return cache
  } catch (error) {
    console.warn('Erro ao ler cache de autenticação:', error)
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    return null
  }
}

const setAuthCache = (user: AuthUser | null): void => {
  if (typeof window === 'undefined') return
  
  try {
    const cache: AuthCache = {
      user,
      timestamp: Date.now(),
      version: '1.0'
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn('Erro ao escrever cache de autenticação:', error)
  }
}

const clearAuthCache = (): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  } catch (error) {
    console.warn('Erro ao limpar cache de autenticação:', error)
  }
}

/**
 * Validação de dados do usuário com tratamento melhorado para campos opcionais
 * Não lança erro se campos opcionais como sectorId ou photoUrl estiverem ausentes
 */
const validateUserData = (data: any): AuthUser => {
  // Campos obrigatórios
  const requiredFields = ['id', 'email', 'name', 'role', 'showIdentityCard', 'approved']
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Dados de usuário inválidos: campo obrigatório ausente ${field}`)
    }
  }
  
  // Validação de valores específicos
  if (!['USER', 'ADMIN'].includes(data.role)) {
    throw new Error('Role de usuário inválido')
  }
  
  if (typeof data.approved !== 'boolean') {
    throw new Error('Campo approved deve ser um booleano')
  }
  
  // Validação de campos opcionais (não lança erro se ausentes)
  if (data.sectorId !== undefined && typeof data.sectorId !== 'string') {
    console.warn('Campo sectorId inválido, será removido')
    delete data.sectorId
  }
  
  if (data.photoUrl !== undefined && typeof data.photoUrl !== 'string') {
    console.warn('Campo photoUrl inválido, será removido')
    delete data.photoUrl
  }
  
  return data as AuthUser
}

/**
 * Função unificada para atualização de estado e cache
 * Reduz duplicação de código e garante consistência entre Zustand e localStorage
 */
const updateAuthState = (
  user: AuthUser | null,
  setUser: (user: AuthUser | null) => void,
  setLastAuthCheck: (timestamp: number) => void,
  clearCache: boolean = false
): void => {
  const timestamp = Date.now()
  
  // Atualiza estado global (Zustand)
  setUser(user)
  setLastAuthCheck(timestamp)
  
  // Atualiza cache local (localStorage)
  if (clearCache) {
    clearAuthCache()
  } else if (user) {
    setAuthCache(user)
  }
}

/**
 * Classificação de erros para feedback mais preciso ao usuário
 * Permite mensagens de toast mais claras e específicas
 */
enum ErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

const classifyError = (error: Error): ErrorType => {
  if (error.message.includes('Timeout')) {
    return ErrorType.TIMEOUT
  }
  
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return ErrorType.NETWORK
  }
  
  if (error.message.includes('inválido') || error.message.includes('required')) {
    return ErrorType.VALIDATION
  }
  
  if (error.message.includes('não autenticado') || error.message.includes('unauthorized')) {
    return ErrorType.AUTHENTICATION
  }
  
  if (error.message.includes('servidor') || error.message.includes('internal')) {
    return ErrorType.SERVER
  }
  
  return ErrorType.UNKNOWN
}

const getErrorMessage = (errorType: ErrorType, originalMessage: string): string => {
  switch (errorType) {
    case ErrorType.TIMEOUT:
      return 'Operação demorou muito tempo. Tente novamente.'
    case ErrorType.NETWORK:
      return 'Problema de conexão. Verifique sua internet.'
    case ErrorType.VALIDATION:
      return `Dados inválidos: ${originalMessage}`
    case ErrorType.AUTHENTICATION:
      return originalMessage // Mantém mensagem original para erros de auth
    case ErrorType.SERVER:
      return 'Erro no servidor. Tente novamente mais tarde.'
    default:
      return 'Erro inesperado. Tente novamente.'
  }
}

export function useAuth(): UseAuthReturn {
  const [localError, setLocalError] = useState<string | null>(null)
  
  // Use Zustand store para gerenciamento de estado global
  const {
    user,
    loading,
    authChecked,
    error: storeError,
    lastAuthCheck,
    setUser,
    setLoading,
    setAuthChecked,
    setError,
    setLastAuthCheck,
    clearAuth: clearStoreAuth
  } = useAuthStore()

  // Clear error function
  const clearError = useCallback(() => {
    setLocalError(null)
    setError(null)
  }, [setError])

  /**
   * checkAuth otimizado com cache hierárquico e melhor tratamento de erros
   * 1. Verifica localStorage cache (mais rápido)
   * 2. Verifica Zustand cache (fallback)
   * 3. Faz chamada à API (apenas se necessário)
   */
  const checkAuth = useCallback(async (forceRefresh = false) => {
    // Check localStorage cache primeiro (caminho mais rápido)
    if (!forceRefresh) {
      const localCache = getAuthCache()
      if (localCache && localCache.user) {
        updateAuthState(localCache.user, setUser, setLastAuthCheck)
        setLoading(false)
        setAuthChecked(true)
        return
      }
    }
    
    // Check Zustand cache segundo (fallback)
    const now = Date.now()
    if (!forceRefresh && lastAuthCheck && user && (now - lastAuthCheck < AUTH_CACHE_DURATION)) {
      setLoading(false)
      setAuthChecked(true)
      return
    }

    setLoading(true)
    setLocalError(null)

    try {
      await retryWithBackoff(async () => {
        const response = await fetchWithTimeout('/api/auth/me', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }, 5000)

        if (response.ok) {
          const userData = await response.json()
          const validatedUser = validateUserData(userData)
          updateAuthState(validatedUser, setUser, setLastAuthCheck)
        } else if (response.status === 401) {
          // Unauthorized é esperado para usuários não logados
          updateAuthState(null, setUser, setLastAuthCheck, true) // Limpa cache
        } else {
          throw new Error(`Verificação de autenticação falhou: ${response.status}`)
        }
      }, MAX_RETRIES, RETRY_DELAY, [401]) // Não retry em 401
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar autenticação'
      const errorType = classifyError(error as Error)
      const userMessage = getErrorMessage(errorType, errorMessage)
      
      setLocalError(userMessage)
      setError(userMessage)
      updateAuthState(null, setUser, setLastAuthCheck, true) // Limpa cache em erro
      
      // Toast apenas para erros que não são de autenticação normal
      if (errorType !== ErrorType.AUTHENTICATION) {
        toast.error(userMessage)
      }
    } finally {
      setLoading(false)
      setAuthChecked(true)
    }
  }, [lastAuthCheck, user, setUser, setLoading, setAuthChecked, setError, setLastAuthCheck])

  // Initialize auth check on mount
  useEffect(() => {
    if (!authChecked) {
      checkAuth()
    }
  }, [authChecked, checkAuth])

  /**
   * Login com tratamento de erros aprimorado e gerenciamento de cache unificado
   * Usa fetchWithTimeout e retry com backoff, exceto para falhas de autenticação
   */
  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setLoading(true)
    setLocalError(null)

    try {
      const response = await fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }, 10000)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao fazer login')
      }

      const data = await response.json()
      const validatedUser = validateUserData(data.user)
      
      updateAuthState(validatedUser, setUser, setLastAuthCheck)
      toast.success('Login realizado com sucesso!')
      return validatedUser
    } catch (error) {
      console.error('Erro no login:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login'
      const errorType = classifyError(error as Error)
      const userMessage = getErrorMessage(errorType, errorMessage)
      
      setLocalError(userMessage)
      setError(userMessage)
      updateAuthState(null, setUser, setLastAuthCheck, true) // Limpa cache em erro
      
      toast.error(userMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setUser, setLoading, setError, setLastAuthCheck])

  /**
   * Logout com limpeza completa de cache e tratamento robusto de falhas
   * Limpa ambos os caches (localStorage e Zustand) mesmo se falhar comunicação com servidor
   */
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true)
    setLocalError(null)

    try {
      await fetchWithTimeout('/api/auth/logout', {
        method: 'POST'
      }, 5000)
      
      clearStoreAuth()
      clearAuthCache()
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      console.error('Erro no logout:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer logout'
      const errorType = classifyError(error as Error)
      const userMessage = getErrorMessage(errorType, errorMessage)
      
      setLocalError(userMessage)
      
      // Mesmo se falhar comunicação com servidor, limpa estado local
      clearStoreAuth()
      clearAuthCache()
      
      if (errorType !== ErrorType.TIMEOUT && errorType !== ErrorType.NETWORK) {
        toast.warning('Erro ao comunicar com servidor, mas logout local foi realizado.')
      }
    } finally {
      setLoading(false)
    }
  }, [clearStoreAuth, setLoading])

  /**
   * Refresh auth function - agora usa o novo sistema de refresh tokens
   * Tenta renovar o access token usando refresh token se o access token expirou
   */
  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      const response = await fetchWithTimeout('/api/auth/refresh', {
        method: 'POST'
      }, 5000)

      if (response.ok) {
        // Refresh successful, atualizar dados do usuário
        await checkAuth(true)
        toast.success('Sessão renovada com sucesso!')
      } else {
        // Refresh failed, fazer logout
        await logout()
      }
    } catch (error) {
      console.error('Erro ao renovar sessão:', error)
      await logout()
    }
  }, [checkAuth, logout])

  // Auto-refresh token a cada 14 minutos (antes de expirar)
  useEffect(() => {
    if (!user) return

    // Configurar auto-refresh do token
    const interval = setInterval(async () => {
      try {
        await refreshAuth()
      } catch (error) {
        console.error('Auto-refresh failed:', error)
        // Se falhar, o refreshAuth já faz logout automaticamente
      }
    }, 14 * 60 * 1000) // 14 minutos (antes dos 15 minutos de expiração)

    return () => clearInterval(interval)
  }, [user, refreshAuth])

  return {
    user,
    loading,
    authChecked,
    error: localError || storeError,
    login,
    logout,
    checkAuth,
    refreshAuth,
    clearError
  }
}