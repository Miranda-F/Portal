"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Procedure, Job, Event } from "@/types/usuario"

export function useUsuarioData() {
  const { user, authChecked } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [events, setEvents] = useState<Event[]>([])

  const [registeredJobs, setRegisteredJobs] = useState<string[]>([])
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([])
  const [sectors, setSectors] = useState<any[]>([])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch all data in parallel without timeout for faster loading
      const [proceduresRes, jobsRes, eventsRes] = await Promise.all([
        fetch('/api/procedures'),
        fetch('/api/jobs'),
        fetch('/api/events')
      ])

      if (proceduresRes.ok) {
        const proceduresData = await proceduresRes.json()
        // Filtrar apenas documentos com status PUBLISHED e que não estão expirados
        // Na página do usuário, mostrar APENAS documentos "ativos" (status = 'active')
        // Não mostrar: pending, expired, inactive, archived
        // Usar a mesma lógica de comparação de datas que usamos em getExpirationStatus
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const activeProcedures = proceduresData.filter((procedure: any) => {
          // Apenas PUBLISHED (status do backend)
          if (procedure.status !== 'PUBLISHED') {
            return false
          }
          
          // Se tiver data de vencimento, verificar se não está expirado
          // Documentos expirados não devem aparecer
          // Documentos próximos do vencimento (30 dias ou menos) TAMBÉM devem aparecer
          // (A regra de 30 dias é apenas para alerta visual, não para ocultar)
          if (procedure.expiryDate) {
            // Parse da data como local para evitar problemas de timezone
            // Se expiryDate já é uma string ISO, extrair a parte da data
            let expiryDateStr: string
            if (typeof procedure.expiryDate === 'string') {
              expiryDateStr = procedure.expiryDate.split('T')[0] // "YYYY-MM-DD"
            } else {
              // Se for um objeto Date, converter para ISO string primeiro
              expiryDateStr = new Date(procedure.expiryDate).toISOString().split('T')[0]
            }
            
            // Parse como data local (meia-noite)
            const [year, month, day] = expiryDateStr.split('-').map(Number)
            const expiry = new Date(year, month - 1, day)
            expiry.setHours(0, 0, 0, 0)
            
            const diffTime = expiry.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            // Apenas não mostrar se expirado (diffDays < 0)
            // Documentos próximos do vencimento (diffDays <= 30) DEVEM aparecer
            if (diffDays < 0) {
              return false // Excluir apenas documentos expirados
            }
          }
          
          // Documentos PUBLISHED que não estão expirados devem aparecer
          return true
        })
        
        setProcedures(activeProcedures)
      }
      if (jobsRes.ok) setJobs(await jobsRes.json())
      if (eventsRes.ok) setEvents(await eventsRes.json())
    } catch (error) {
      console.error('Fetch data error:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserRegistrations = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 3000) // 3 second timeout
      })

      const dataPromise = Promise.all([
        fetch('/api/user/job-registrations'),
        fetch('/api/user/event-registrations')
      ])

      const [jobsRes, eventsRes] = await Promise.race([
        dataPromise,
        timeoutPromise
      ]) as any

      if (jobsRes.ok) {
        const jobs = await jobsRes.json()
        setRegisteredJobs(jobs.map((job: any) => job.id))
      }

      if (eventsRes.ok) {
        const events = await eventsRes.json()
        setRegisteredEvents(events.map((event: any) => event.id))
      }
    } catch (error) {
      console.error('Error loading user registrations:', error)
    }
  }

  const loadSectors = async () => {
    try {
      const response = await fetch('/api/sectors')
      if (response.ok) {
        setSectors(await response.json())
      }
    } catch (error) {
      console.error('Error loading sectors:', error)
    }
  }

  useEffect(() => {
    if (user && authChecked) {
      // Start loading data immediately without delays
      fetchData()
      loadUserRegistrations()
      loadSectors()
    }
  }, [user, authChecked])

  return {
    loading,
    procedures,
    jobs,
    events,
    registeredJobs,
    registeredEvents,
    sectors,
    setRegisteredJobs,
    setRegisteredEvents,
    refreshData: fetchData
  }
}