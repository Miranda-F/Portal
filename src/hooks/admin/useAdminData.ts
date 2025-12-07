'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface AdminData {
  users: any[]
  pendingUsers: any[]
  events: any[]
  publications: any[]
  sectors: any[]
  groups: any[]
  trainings: any[]
  employees: any[]
}

export function useAdminData() {
  const { toast } = useToast()
  const [data, setData] = useState<AdminData>({
    users: [],
    pendingUsers: [],
    events: [],
    publications: [],
    sectors: [],
    groups: [],
    trainings: [],
    employees: []
  })
  const [loading, setLoading] = useState(true)

  const fetchData = async (useCache = true) => {
    try {
      console.log('📊 Fetching admin data, useCache:', useCache)
      setLoading(true)
      
      // Verificar cache se habilitado
      if (useCache) {
        const cachedData = sessionStorage.getItem('admin-data-cache')
        const cacheTimestamp = sessionStorage.getItem('admin-data-cache-timestamp')
        const now = Date.now()
        const cacheExpiry = 5 * 60 * 1000 // 5 minutos

        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
          console.log('💾 Using cached data')
          const parsedData = JSON.parse(cachedData)
          setData(parsedData)
          setLoading(false)
          return
        }
      }
      
      // Fetch all data in parallel com timeouts individuais
      const fetchWithTimeout = (url: string, timeout = 10000) => 
        Promise.race([
          fetch(url, { credentials: 'include' }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ])

      const [
        usersRes,
        pendingUsersRes,
        eventsRes,
        publicationsRes,
        sectorsRes,
        groupsRes,
        trainingsRes,
        employeesRes
      ] = await Promise.allSettled([
        fetchWithTimeout('/api/admin/users?limit=100'),
        fetchWithTimeout('/api/admin/users?pending=true&limit=50'),
        fetchWithTimeout('/api/admin/events'),
        fetchWithTimeout('/api/admin/publications'),
        fetchWithTimeout('/api/admin/sectors'),
        fetchWithTimeout('/api/admin/groups'),
        fetchWithTimeout('/api/admin/trainings'),
        fetchWithTimeout('/api/rh/employees')
      ])

      // Processar respostas com fallback para dados vazios
      const processResponse = (result: PromiseSettledResult<Response>, fallback: any[] = []) => {
        if (result.status === 'fulfilled' && result.value.ok) {
          return result.value.json()
        }
        console.warn('Failed to fetch data, using fallback')
        return Promise.resolve({ users: fallback, events: fallback, sectors: fallback, groups: fallback, trainings: fallback, publications: { publications: fallback }, employees: fallback })
      }

      // Parse all responses em paralelo
      const [
        usersData,
        pendingUsersData,
        eventsData,
        publicationsData,
        sectorsData,
        groupsData,
        trainingsData,
        employeesData
      ] = await Promise.all([
        processResponse(usersRes),
        processResponse(pendingUsersRes),
        processResponse(eventsRes),
        processResponse(publicationsRes),
        processResponse(sectorsRes),
        processResponse(groupsRes),
        processResponse(trainingsRes),
        processResponse(employeesRes)
      ])

      const newData = {
        users: Array.isArray(usersData) ? usersData : (usersData.users || []),
        pendingUsers: Array.isArray(pendingUsersData) ? pendingUsersData : (pendingUsersData.users || []),
        events: Array.isArray(eventsData) ? eventsData : (eventsData.events || []),
        publications: publicationsData.publications || [],
        sectors: Array.isArray(sectorsData) ? sectorsData : (sectorsData.sectors || []),
        groups: Array.isArray(groupsData) ? groupsData : (groupsData.groups || []),
        trainings: Array.isArray(trainingsData) ? trainingsData : (trainingsData.trainings || []),
        employees: employeesData || []
      }

            console.log('✅ Admin data fetched successfully:', {
              users: newData.users.length,
              sectors: newData.sectors.length,
              events: newData.events.length
            })
            setData(newData)

            // Salvar no cache
            if (useCache) {
              sessionStorage.setItem('admin-data-cache', JSON.stringify(newData))
              sessionStorage.setItem('admin-data-cache-timestamp', Date.now().toString())
              console.log('💾 Data cached')
            }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do administrador",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUsers = (users: any[]) => {
    setData(prev => ({ ...prev, users }))
  }

  const updatePendingUsers = (pendingUsers: any[]) => {
    setData(prev => ({ ...prev, pendingUsers }))
  }

  const updateEvents = (events: any[]) => {
    setData(prev => ({ ...prev, events }))
  }

  const updatePublications = (publications: any[]) => {
    setData(prev => ({ ...prev, publications }))
  }

  const updateSectors = (sectors: any[]) => {
    setData(prev => ({ ...prev, sectors }))
  }

  const updateGroups = (groups: any[]) => {
    setData(prev => ({ ...prev, groups }))
  }

  const updateTrainings = (trainings: any[]) => {
    setData(prev => ({ ...prev, trainings }))
  }

  const updateEmployees = (employees: any[]) => {
    setData(prev => ({ ...prev, employees }))
  }

  const invalidateCache = () => {
    sessionStorage.removeItem('admin-data-cache')
    sessionStorage.removeItem('admin-data-cache-timestamp')
  }

  const refreshData = () => {
    console.log('🔄 Refreshing admin data...')
    invalidateCache()
    fetchData(false) // Forçar refresh sem cache
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    fetchData,
    refreshData,
    invalidateCache,
    updateUsers,
    updatePendingUsers,
    updateEvents,
    updatePublications,
    updateSectors,
    updateGroups,
    updateTrainings,
    updateEmployees
  }
}