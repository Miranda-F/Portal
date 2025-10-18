"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function useRegistration() {
  const { toast } = useToast()
  const [loadingActions, setLoadingActions] = useState<{[key: string]: 'registering' | 'unregistering' | null}>({})

  const registerForJob = async (jobId: string, onSuccess: () => void) => {
    try {
      setLoadingActions(prev => ({ ...prev, [jobId]: 'registering' }))
      
      const response = await fetch('/api/user/register-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao se inscrever na vaga')
      }

      onSuccess()
      toast({
        title: "Inscrição realizada!",
        description: "Você se inscreveu na vaga com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível realizar a inscrição",
        variant: "destructive",
      })
    } finally {
      setLoadingActions(prev => ({ ...prev, [jobId]: null }))
    }
  }

  const unregisterFromJob = async (jobId: string, onSuccess: () => void) => {
    try {
      setLoadingActions(prev => ({ ...prev, [jobId]: 'unregistering' }))
      
      const response = await fetch('/api/user/unregister-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao cancelar inscrição')
      }

      onSuccess()
      toast({
        title: "Inscrição cancelada!",
        description: "Você cancelou sua inscrição na vaga.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível cancelar a inscrição",
        variant: "destructive",
      })
    } finally {
      setLoadingActions(prev => ({ ...prev, [jobId]: null }))
    }
  }

  const registerForEvent = async (eventId: string, onSuccess: () => void) => {
    try {
      setLoadingActions(prev => ({ ...prev, [eventId]: 'registering' }))
      
      const response = await fetch('/api/user/register-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao se inscrever no evento')
      }

      onSuccess()
      toast({
        title: "Inscrição realizada!",
        description: "Você se inscreveu no evento com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível realizar a inscrição",
        variant: "destructive",
      })
    } finally {
      setLoadingActions(prev => ({ ...prev, [eventId]: null }))
    }
  }

  const unregisterFromEvent = async (eventId: string, onSuccess: () => void) => {
    try {
      setLoadingActions(prev => ({ ...prev, [eventId]: 'unregistering' }))
      
      const response = await fetch('/api/user/unregister-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao cancelar inscrição')
      }

      onSuccess()
      toast({
        title: "Inscrição cancelada!",
        description: "Você cancelou sua inscrição no evento.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível cancelar a inscrição",
        variant: "destructive",
      })
    } finally {
      setLoadingActions(prev => ({ ...prev, [eventId]: null }))
    }
  }

  return {
    loadingActions,
    registerForJob,
    unregisterFromJob,
    registerForEvent,
    unregisterFromEvent
  }
}