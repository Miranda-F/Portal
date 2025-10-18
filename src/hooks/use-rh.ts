import { useState, useEffect, useCallback } from 'react'
import { Job, Sector, Employee, Training, Stats, Activity, Deadline } from '@/types/rh'

// Hook for managing jobs
export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/jobs', {
        credentials: 'include'
      })
      if (response.ok) {
        const jobsData = await response.json()
        setJobs(jobsData)
      } else {
        setError('Failed to fetch jobs')
      }
    } catch (error) {
      setError('Failed to fetch jobs')
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const createJob = async (jobData: Partial<Job>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        const newJob = await response.json()
        setJobs(prev => [...prev, newJob])
        return newJob
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create job')
      }
    } catch (error) {
      console.error('Failed to create job:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateJob = async (id: string, jobData: Partial<Job>) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        const updatedJob = await response.json()
        setJobs(prev => prev.map(job => job.id === id ? updatedJob : job))
        return updatedJob
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update job')
      }
    } catch (error) {
      console.error('Failed to update job:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/jobs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setJobs(prev => prev.filter(job => job.id !== id))
        return true
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete job')
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const toggleJobStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/jobs/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      })

      if (response.ok) {
        setJobs(prev => prev.map(job => 
          job.id === id 
            ? { ...job, status: job.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
            : job
        ))
        return true
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to toggle job status')
      }
    } catch (error) {
      console.error('Failed to toggle job status:', error)
      throw error
    }
  }

  return {
    jobs,
    loading,
    error,
    loadJobs,
    createJob,
    updateJob,
    deleteJob,
    toggleJobStatus
  }
}

// Hook for managing sectors
export function useSectors() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSectors = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/sectors', {
        credentials: 'include'
      })
      if (response.ok) {
        const sectorsData = await response.json()
        setSectors(sectorsData)
      } else {
        setError('Failed to fetch sectors')
      }
    } catch (error) {
      setError('Failed to fetch sectors')
      console.error('Failed to fetch sectors:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    sectors,
    loading,
    error,
    loadSectors
  }
}

// Hook for managing employees
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/rh/employees', {
        credentials: 'include'
      })
      if (response.ok) {
        const employeesData = await response.json()
        setEmployees(employeesData)
      } else {
        setError('Failed to fetch employees')
      }
    } catch (error) {
      setError('Failed to fetch employees')
      console.error('Failed to fetch employees:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const createEmployee = async (employeeData: Employee) => {
    try {
      setLoading(true)
      const response = await fetch('/api/rh/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(employeeData),
      })

      if (response.ok) {
        const newEmployee = await response.json()
        setEmployees(prev => [...prev, newEmployee])
        return newEmployee
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create employee')
      }
    } catch (error) {
      console.error('Failed to create employee:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    employees,
    loading,
    error,
    loadEmployees,
    createEmployee
  }
}

// Hook for managing trainings
export function useTrainings() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTrainings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/trainings', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setTrainings(data.trainings || [])
      } else {
        setError('Failed to fetch trainings')
        setTrainings([])
      }
    } catch (error) {
      setError('Failed to fetch trainings')
      setTrainings([])
      console.error('Failed to fetch trainings:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    trainings,
    loading,
    error,
    loadTrainings
  }
}

// Hook for dashboard data
export function useRHStats() {
  const [stats, setStats] = useState<Stats>({
    totalColaboradores: 0,
    admissõesMes: 0,
    desligamentosMes: 0,
    vagasAbertas: 0,
    treinamentosMes: 0,
    avaliacoesPendentes: 0
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Mock data for demonstration
    const mockStats: Stats = {
      totalColaboradores: 156,
      admissõesMes: 8,
      desligamentosMes: 2,
      vagasAbertas: 12,
      treinamentosMes: 15,
      avaliacoesPendentes: 23
    }

    const mockActivities: Activity[] = [
      { id: 1, type: "admissao", employee: "João Silva", date: "2024-01-15", description: "Novo colaborador admitido no setor de TI" },
      { id: 2, type: "promocao", employee: "Maria Santos", date: "2024-01-14", description: "Promovida para Analista Sênior" },
      { id: 3, type: "treinamento", employee: "Pedro Oliveira", date: "2024-01-13", description: "Concluiu treinamento de Liderança" },
      { id: 4, type: "avaliacao", employee: "Ana Costa", date: "2024-01-12", description: "Avaliação de desempenho concluída" },
    ]

    const mockDeadlines: Deadline[] = [
      { id: 1, type: "exame", employee: "Carlos Ferreira", deadline: "2024-01-20", description: "Exame periódico obrigatório" },
      { id: 2, type: "treinamento", employee: "Equipe TI", deadline: "2024-01-25", description: "Treinamento de Segurança da Informação" },
      { id: 3, type: "avaliacao", employee: "Setor Comercial", deadline: "2024-01-30", description: "Avaliação trimestral" },
    ]

    setStats(mockStats)
    setActivities(mockActivities)
    setDeadlines(mockDeadlines)
  }, [])

  return {
    stats,
    activities,
    deadlines,
    loading
  }
}