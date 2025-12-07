'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface FetchDataOptions {
  showToast?: boolean
  loadingMessage?: string
  errorMessage?: string
  successMessage?: string
}

interface FetchDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  fetchData: (url: string, options?: RequestInit, fetchOptions?: FetchDataOptions) => Promise<T | null>
  reset: () => void
}

/**
 * Hook genérico para busca de dados com tratamento de loading, erro e toast
 * @param initialData Dados iniciais (opcional)
 * @returns Objeto com dados, loading, erro e função fetchData
 */
export function useFetchData<T>(initialData: T | null = null): FetchDataResult<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const reset = useCallback(() => {
    setData(initialData)
    setLoading(false)
    setError(null)
  }, [initialData])

  const fetchData = useCallback(async (
    url: string, 
    options?: RequestInit, 
    fetchOptions: FetchDataOptions = {}
  ): Promise<T | null> => {
    const {
      showToast = true,
      loadingMessage = 'Carregando...',
      errorMessage = 'Erro ao buscar dados',
      successMessage
    } = fetchOptions

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.message || errorMessage
        throw new Error(message)
      }

      const result = await response.json()
      
      setData(result)
      
      if (showToast && successMessage) {
        toast({
          title: 'Sucesso',
          description: successMessage,
        })
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage
      setError(message)
      
      if (showToast) {
        toast({
          title: 'Erro',
          description: message,
          variant: 'destructive',
        })
      }

      return null
    } finally {
      setLoading(false)
    }
  }, [toast, errorMessage])

  return {
    data,
    loading,
    error,
    fetchData,
    reset,
  }
}

/**
 * Hook para múltiplas requisições simultâneas
 */
interface FetchMultipleOptions {
  showToast?: boolean
  loadingMessage?: string
  errorMessage?: string
}

interface FetchMultipleResult<T> {
  data: T[]
  loading: boolean
  errors: string[]
  fetchMultiple: (urls: string[], options?: FetchMultipleOptions) => Promise<T[]>
  reset: () => void
}

export function useFetchMultiple<T>(initialData: T[] = []): FetchMultipleResult<T> {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const { toast } = useToast()

  const reset = useCallback(() => {
    setData(initialData)
    setLoading(false)
    setErrors([])
  }, [initialData])

  const fetchMultiple = useCallback(async (
    urls: string[], 
    options: FetchMultipleOptions = {}
  ): Promise<T[]> => {
    const {
      showToast = true,
      loadingMessage = 'Carregando dados...',
      errorMessage = 'Erro ao buscar dados'
    } = options

    setLoading(true)
    setErrors([])

    try {
      const promises = urls.map(url => 
        fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Erro ao buscar ${url}`)
          }
          return response.json()
        })
      )

      const results = await Promise.all(promises)
      setData(results)
      
      if (showToast) {
        toast({
          title: 'Sucesso',
          description: 'Dados carregados com sucesso',
        })
      }

      return results
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage
      setErrors([message])
      
      if (showToast) {
        toast({
          title: 'Erro',
          description: message,
          variant: 'destructive',
        })
      }

      return []
    } finally {
      setLoading(false)
    }
  }, [toast, errorMessage])

  return {
    data,
    loading,
    errors,
    fetchMultiple,
    reset,
  }
}

/**
 * Hook para ações (POST, PUT, DELETE)
 */
interface UseActionOptions {
  successMessage?: string
  errorMessage?: string
  showToast?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

interface UseActionResult<T> {
  loading: boolean
  error: string | null
  execute: (url: string, data?: any, method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH', options?: UseActionOptions) => Promise<T | null>
  reset: () => void
}

export function useAction<T>(): UseActionResult<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  const execute = useCallback(async (
    url: string,
    data?: any,
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
    options: UseActionOptions = {}
  ): Promise<T | null> => {
    const {
      successMessage = 'Operação realizada com sucesso',
      errorMessage = 'Erro ao realizar operação',
      showToast = true,
      onSuccess,
      onError
    } = options

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.message || errorMessage
        throw new Error(message)
      }

      const result = await response.json()
      
      if (showToast) {
        toast({
          title: 'Sucesso',
          description: successMessage,
        })
      }

      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage
      setError(message)
      
      if (showToast) {
        toast({
          title: 'Erro',
          description: message,
          variant: 'destructive',
        })
      }

      if (onError) {
        onError(message)
      }

      return null
    } finally {
      setLoading(false)
    }
  }, [toast, errorMessage, successMessage, showToast])

  return {
    loading,
    error,
    execute,
    reset,
  }
}