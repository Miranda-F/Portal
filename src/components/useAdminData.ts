'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface AdminData {
  users: any[]
  pendingUsers: any[]
  events: any[]
  sectors: any[]
  groups: any[]
  trainings: any[]
  employees: any[]
}

export function useAdminData() {
  const [data, setData] = useState<AdminData>({
    users: [],
    pendingUsers: [],
    events: [],
    sectors: [],
    groups: [],
    trainings: [],
    employees: []
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch users
      const usersResponse = await fetch('/api/admin/users', {
        credentials: 'include',
      })
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setData(prev => ({ ...prev, users: usersData }))
      }

      // Fetch pending users
      const pendingUsersResponse = await fetch('/api/admin/users/pending', {
        credentials: 'include',
      })
      if (pendingUsersResponse.ok) {
        const pendingUsersData = await pendingUsersResponse.json()
        setData(prev => ({ ...prev, pendingUsers: pendingUsersData }))
      }

      // Fetch events
      const eventsResponse = await fetch('/api/admin/events', {
        credentials: 'include',
      })
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setData(prev => ({ ...prev, events: eventsData }))
      }

      // Fetch sectors
      const sectorsResponse = await fetch('/api/admin/sectors', {
        credentials: 'include',
      })
      if (sectorsResponse.ok) {
        const sectorsData = await sectorsResponse.json()
        setData(prev => ({ ...prev, sectors: sectorsData }))
      }

      // Fetch groups
      const groupsResponse = await fetch('/api/admin/groups', {
        credentials: 'include',
      })
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        setData(prev => ({ ...prev, groups: groupsData }))
      }

      // Fetch trainings
      const trainingsResponse = await fetch('/api/admin/trainings', {
        credentials: 'include',
      })
      if (trainingsResponse.ok) {
        const trainingsData = await trainingsResponse.json()
        setData(prev => ({ ...prev, trainings: trainingsData }))
      }

      // Fetch employees from RH
      const employeesResponse = await fetch('/api/rh/employees', {
        credentials: 'include',
      })
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json()
        setData(prev => ({ ...prev, employees: employeesData }))
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do painel administrativo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  const updateUsers = (users: any[]) => {
    setData(prev => ({ ...prev, users }))
  }

  const updatePendingUsers = (pendingUsers: any[]) => {
    setData(prev => ({ ...prev, pendingUsers }))
  }

  const updateEvents = (events: any[]) => {
    setData(prev => ({ ...prev, events }))
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

  return {
    data,
    loading,
    refetch,
    updateUsers,
    updatePendingUsers,
    updateEvents,
    updateSectors,
    updateGroups,
    updateTrainings,
    updateEmployees
  }
}