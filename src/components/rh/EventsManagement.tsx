"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar, Search, Plus, Edit, Trash2, MapPin, Clock, Loader2 } from "lucide-react"

interface EventsManagementProps {
  activeTab: string
}

export default function EventsManagement({ activeTab }: EventsManagementProps) {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal states
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false)
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false)
  const [isDeleteEventModalOpen, setIsDeleteEventModalOpen] = useState(false)
  const [isSavingEvent, setIsSavingEvent] = useState(false)
  const [isDeletingEvent, setIsDeletingEvent] = useState(false)
  
  // Form states
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [eventToDelete, setEventToDelete] = useState<any>(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: ''
  })

  useEffect(() => {
    if (activeTab === "eventos") {
      if (user && user.role !== 'ADMIN') {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar esta funcionalidade.",
          variant: "destructive",
        })
        return
      }

      if (user) {
        fetchEvents()
      }
    }
  }, [activeTab, user])

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

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      maxAttendees: ''
    })
    setIsCreateEventModalOpen(true)
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      maxAttendees: event.maxAttendees?.toString() || ''
    })
    setIsEditEventModalOpen(true)
  }

  const handleDeleteEvent = (event: any) => {
    setEventToDelete(event)
    setIsDeleteEventModalOpen(true)
  }

  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time || !eventForm.location) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsSavingEvent(true)
    try {
      const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events'
      const method = editingEvent ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...eventForm,
          maxAttendees: eventForm.maxAttendees ? parseInt(eventForm.maxAttendees) : null
        }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: editingEvent ? "Evento atualizado com sucesso." : "Evento criado com sucesso.",
        })
        setIsCreateEventModalOpen(false)
        setIsEditEventModalOpen(false)
        fetchEvents()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível salvar o evento.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error saving event:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o evento.",
        variant: "destructive",
      })
    } finally {
      setIsSavingEvent(false)
    }
  }

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return

    setIsDeletingEvent(true)
    try {
      const response = await fetch(`/api/admin/events/${eventToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Evento excluído com sucesso.",
        })
        setIsDeleteEventModalOpen(false)
        fetchEvents()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível excluir o evento.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingEvent(false)
    }
  }

  const getEventStatus = (eventDate: string, eventTime?: string) => {
    const today = new Date()
    const eventDateTime = new Date(`${eventDate} ${eventTime || '00:00'}`)
    
    if (eventDateTime < today) {
      return 'COMPLETED'
    } else if (eventDateTime.toDateString() === today.toDateString()) {
      return 'ONGOING'
    } else {
      return 'UPCOMING'
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
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta funcionalidade.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Eventos</h2>
          <p className="text-muted-foreground">
            Gerencie os eventos corporativos da empresa
          </p>
        </div>
        <Button onClick={handleCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os eventos corporativos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum evento encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => {
                const status = getEventStatus(event.date, event.time)
                return (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="font-medium">{event.title}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                              status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {status === 'UPCOMING' ? 'Próximo' :
                               status === 'ONGOING' ? 'Hoje' :
                               'Concluído'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-muted-foreground">{event.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{event.time || '00:00'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        
                        {event.maxAttendees && (
                          <div className="text-sm text-muted-foreground">
                            Máximo de participantes: {event.maxAttendees}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Event Modal */}
      <Dialog open={isCreateEventModalOpen || isEditEventModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateEventModalOpen(false)
          setIsEditEventModalOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Editar Evento" : "Novo Evento"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Atualize as informações do evento." : "Preencha as informações para criar um novo evento."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Hora
              </Label>
              <Input
                id="time"
                type="time"
                value={eventForm.time}
                onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Local
              </Label>
              <Input
                id="location"
                value={eventForm.location}
                onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxAttendees" className="text-right">
                Máx. Participantes
              </Label>
              <Input
                id="maxAttendees"
                type="number"
                value={eventForm.maxAttendees}
                onChange={(e) => setEventForm({...eventForm, maxAttendees: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEvent} disabled={isSavingEvent}>
              {isSavingEvent ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Modal */}
      <Dialog open={isDeleteEventModalOpen} onOpenChange={setIsDeleteEventModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Evento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteEventModalOpen(false)} disabled={isDeletingEvent}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteEvent} disabled={isDeletingEvent}>
              {isDeletingEvent ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir Evento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}