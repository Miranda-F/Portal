import { useState, useEffect } from 'react'
import { Sector } from '@/types/document'

export function useSectors() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSectors = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/sectors?status=active')
      
      if (response.ok) {
        const sectorsData = await response.json()
        setSectors(sectorsData)
      } else {
        throw new Error('Failed to fetch sectors')
      }
    } catch (err) {
      console.error('Error fetching sectors:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSectors()
  }, [])

  return {
    sectors,
    loading,
    error,
    fetchSectors
  }
}