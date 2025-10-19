'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface AdminData {
  users: any[]
  pendingUsers: any[]
  events: any[]
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
    sectors: [],
    groups: [],
    trainings: [],
    employees: []
  })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [
        usersRes,
        pendingUsersRes,
        eventsRes,
        sectorsRes,
        groupsRes,
        trainingsRes,
        employeesRes
      ] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/users?pending=true', { credentials: 'include' }),
        fetch('/api/admin/events', { credentials: 'include' }),
        fetch('/api/admin/sectors', { credentials: 'include' }),
        fetch('/api/admin/groups', { credentials: 'include' }),
        fetch('/api/admin/trainings', { credentials: 'include' }),
        fetch('/api/rh/employees', { credentials: 'include' })
      ])

      // Parse all responses
      const [
        usersData,
        pendingUsersData,
        eventsData,
        sectorsData,
        groupsData,
        trainingsData,
        employeesData
      ] = await Promise.all([
        usersRes.json(),
        pendingUsersRes.json(),
        eventsRes.json(),
        sectorsRes.json(),
        groupsRes.json(),
        trainingsRes.json(),
        employeesRes.json()
      ])

      setData({
        users: usersData.users || [],
        pendingUsers: pendingUsersData.users || [],
        events: eventsData.events || [],
        sectors: sectorsData.sectors || [],
        groups: groupsData.groups || [],
        trainings: trainingsData.trainings || [],
        employees: employeesData || []
      })
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

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    fetchData,
    updateUsers,
    updatePendingUsers,
    updateEvents,
    updateSectors,
    updateGroups,
    updateTrainings,
    updateEmployees
  }
}