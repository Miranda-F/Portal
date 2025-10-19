'use client'

import { useState, useCallback } from 'react'

interface LoadingState {
  isLoading: boolean
  error: string | null
  progress: number
}

export const useLoading = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    progress: 0
  })

  const startLoading = useCallback((message?: string) => {
    setLoadingState({
      isLoading: true,
      error: null,
      progress: 0
    })
  }, [])

  const updateProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }))
  }, [])

  const setError = useCallback((error: string) => {
    setLoadingState(prev => ({
      ...prev,
      error,
      isLoading: false
    }))
  }, [])

  const stopLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100
    }))
  }, [])

  const reset = useCallback(() => {
    setLoadingState({
      isLoading: false,
      error: null,
      progress: 0
    })
  }, [])

  const withLoading = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    loadingMessage?: string
  ): Promise<T> => {
    startLoading(loadingMessage)
    
    try {
      const result = await asyncFn()
      stopLoading()
      return result
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      throw error
    }
  }, [startLoading, setError, stopLoading])

  return {
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    progress: loadingState.progress,
    startLoading,
    updateProgress,
    setError,
    stopLoading,
    reset,
    withLoading
  }
}