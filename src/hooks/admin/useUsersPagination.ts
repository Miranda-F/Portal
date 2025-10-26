'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface PaginationState {
  page: number
  limit: number
  search: string
  status: 'all' | 'active' | 'inactive'
  sector: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface UsersResponse {
  users: any[]
  pagination: PaginationMeta
}

export function useUsersPagination() {
  const { toast } = useToast()
  const [data, setData] = useState<UsersResponse>({
    users: [],
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
  })
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 50,
    search: '',
    status: 'all',
    sector: 'all'
  })

  const fetchUsers = useCallback(async (newPagination?: Partial<PaginationState>) => {
    try {
      setLoading(true)
      
      const currentPagination = { ...pagination, ...newPagination }
      
      // constrói query string
      const params = new URLSearchParams()
      params.set('page', currentPagination.page.toString())
      params.set('limit', currentPagination.limit.toString())
      
      if (currentPagination.search.trim()) {
        params.set('search', currentPagination.search.trim())
      }
      
      if (currentPagination.status === 'active') {
        params.set('pending', 'false')
      } else if (currentPagination.status === 'inactive') {
        params.set('pending', 'true')
      }
      
      if (currentPagination.sector !== 'all') {
        params.set('sector', currentPagination.sector)
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Falha ao carregar usuários')
      }

      const result = await response.json()
      setData(result)
      
      // atualiza estado de paginação se foi fornecido
      if (newPagination) {
        setPagination(currentPagination)
      }
      
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [pagination, toast])

  const updatePagination = useCallback((updates: Partial<PaginationState>) => {
    const newPagination = { ...pagination, ...updates }
    
    // reseta p/ página 1 quando mudar filtros
    if (updates.search !== undefined || updates.status !== undefined || updates.sector !== undefined) {
      newPagination.page = 1
    }
    
    fetchUsers(newPagination)
  }, [pagination, fetchUsers])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= data.pagination.totalPages) {
      updatePagination({ page })
    }
  }, [data.pagination.totalPages, updatePagination])

  const nextPage = useCallback(() => {
    if (data.pagination.hasNext) {
      goToPage(data.pagination.page + 1)
    }
  }, [data.pagination.hasNext, data.pagination.page, goToPage])

  const prevPage = useCallback(() => {
    if (data.pagination.hasPrev) {
      goToPage(data.pagination.page - 1)
    }
  }, [data.pagination.hasPrev, data.pagination.page, goToPage])

  const updateUsers = useCallback((updatedUsers: any[]) => {
    setData(prev => ({
      ...prev,
      users: updatedUsers
    }))
  }, [])

  const refresh = useCallback(() => {
    fetchUsers()
  }, [fetchUsers])

  // carrega dados iniciais
  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    data: data.users,
    pagination: data.pagination,
    paginationState: pagination,
    loading,
    updatePagination,
    goToPage,
    nextPage,
    prevPage,
    updateUsers,
    refresh
  }
}
