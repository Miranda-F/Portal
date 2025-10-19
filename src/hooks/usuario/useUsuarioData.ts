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

      if (proceduresRes.ok) setProcedures(await proceduresRes.json())
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