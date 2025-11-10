'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface BatchOperation {
  userId: string
  [key: string]: any
}

interface BatchResult {
  total: number
  successful: number
  failed: number
  success: any[]
  errors: { userId: string; error: string }[]
}

interface UseBatchOperationsReturn {
  isProcessing: boolean
  progress: number
  currentOperation: string
  processBatch: (
    operations: BatchOperation[],
    action: 'approve' | 'delete' | 'update_role',
    onProgress?: (progress: number, current: string) => void
  ) => Promise<BatchResult>
  processBatchWithRetry: (
    operations: BatchOperation[],
    action: 'approve' | 'delete' | 'update_role',
    maxRetries?: number
  ) => Promise<BatchResult>
}

export function useBatchOperations(): UseBatchOperationsReturn {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentOperation, setCurrentOperation] = useState('')

  const processBatch = useCallback(async (
    operations: BatchOperation[],
    action: 'approve' | 'delete' | 'update_role',
    onProgress?: (progress: number, current: string) => void
  ): Promise<BatchResult> => {
    setIsProcessing(true)
    setProgress(0)
    setCurrentOperation('Iniciando operação em lote...')

    try {
      // simula progresso p/ ux
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 90))
      }, 100)

      const response = await fetch('/api/admin/users/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          operations,
          action,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)
      setCurrentOperation('Finalizando...')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha na operação em lote')
      }

      const result = await response.json()
      
      // mostra resultado
      if (result.results.failed === 0) {
        toast({
          title: "Sucesso",
          description: `${result.results.successful} operações concluídas com sucesso`,
          variant: "default",
        })
      } else if (result.results.successful > 0) {
        toast({
          title: "Sucesso Parcial",
          description: `${result.results.successful} sucessos, ${result.results.failed} falhas`,
          variant: "default",
        })
      } else {
        toast({
          title: "Erro",
          description: "Todas as operações falharam",
          variant: "destructive",
        })
      }

      return result.results

    } catch (error) {
      console.error('Error processing batch operations:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha na operação em lote",
        variant: "destructive",
      })
      
      return {
        total: operations.length,
        successful: 0,
        failed: operations.length,
        success: [],
        errors: operations.map(op => ({
          userId: op.userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      }
    } finally {
      setIsProcessing(false)
      setProgress(0)
      setCurrentOperation('')
    }
  }, [toast])

  const processBatchWithRetry = useCallback(async (
    operations: BatchOperation[],
    action: 'approve' | 'delete' | 'update_role',
    maxRetries = 3
  ): Promise<BatchResult> => {
    let lastResult: BatchResult | null = null
    let retryCount = 0

    while (retryCount <= maxRetries) {
      try {
        setCurrentOperation(`Tentativa ${retryCount + 1} de ${maxRetries + 1}...`)
        
        const result = await processBatch(operations, action)
        
        // se não há erros ou já tentamos o máximo, retorna resultado
        if (result.failed === 0 || retryCount === maxRetries) {
          return result
        }

        // filtra apenas operações que falharam p/ retry
        const failedOperations = operations.filter(op => 
          result.errors.some(error => error.userId === op.userId)
        )

        if (failedOperations.length === 0) {
          return result
        }

        operations = failedOperations
        lastResult = result
        retryCount++

        // aguarda antes da próxima tentativa (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))

      } catch (error) {
        console.error(`Retry ${retryCount + 1} failed:`, error)
        retryCount++
        
        if (retryCount > maxRetries) {
          return lastResult || {
            total: operations.length,
            successful: 0,
            failed: operations.length,
            success: [],
            errors: operations.map(op => ({
              userId: op.userId,
              error: error instanceof Error ? error.message : 'Unknown error'
            }))
          }
        }
      }
    }

    return lastResult!
  }, [processBatch])

  return {
    isProcessing,
    progress,
    currentOperation,
    processBatch,
    processBatchWithRetry
  }
}
