'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import AdminEvents from '@/components/AdminEvents'

export default function EventosPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      })
      router.push('/')
      return
    }

    if (user) {
      fetchEvents()
    }
  }, [user, router, toast])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const eventsData = await response.json()
        setEvents(eventsData)
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar os eventos.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <AdminEvents 
        events={events} 
        onEventUpdate={fetchEvents}
      />
    </div>
  )
}