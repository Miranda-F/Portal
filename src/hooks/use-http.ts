'use client'

import { useState, useCallback } from 'react'

interface HttpOptions {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onFinally?: () => void
}

interface HttpState {
  loading: boolean
  error: Error | null
  data: any
}

export const useHttp = () => {
  const [state, setState] = useState<HttpState>({
    loading: false,
    error: null,
    data: null
  })

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null
    })
  }, [])

  const request = useCallback(async (
    url: string,
    options: HttpOptions & { method?: string; body?: any } = {}
  ) => {
    const {
      timeout = 10000,
      retries = 3,
      headers = {},
      method = 'GET',
      body,
      onSuccess,
      onError,
      onFinally
    } = options

    setState(prev => ({ ...prev, loading: true, error: null }))

    const attemptRequest = async (attempt: number): Promise<any> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return data
      } catch (error) {
        clearTimeout(timeoutId)
        
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`)
        }
        
        if (attempt < retries - 1) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          return attemptRequest(attempt + 1)
        }
        
        throw error
      }
    }

    try {
      const data = await attemptRequest(0)
      setState({ loading: false, error: null, data })
      onSuccess?.(data)
      return data
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error')
      setState({ loading: false, error: errorObj, data: null })
      onError?.(errorObj)
      throw errorObj
    } finally {
      onFinally?.()
    }
  }, [])

  const get = useCallback((url: string, options: HttpOptions = {}) => {
    return request(url, { ...options, method: 'GET' })
  }, [request])

  const post = useCallback((url: string, body: any, options: HttpOptions = {}) => {
    return request(url, { ...options, method: 'POST', body })
  }, [request])

  const put = useCallback((url: string, body: any, options: HttpOptions = {}) => {
    return request(url, { ...options, method: 'PUT', body })
  }, [request])

  const del = useCallback((url: string, options: HttpOptions = {}) => {
    return request(url, { ...options, method: 'DELETE' })
  }, [request])

  return {
    ...state,
    request,
    get,
    post,
    put,
    delete: del,
    reset
  }
}