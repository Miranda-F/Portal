"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Calendar, UserPlus, UserMinus } from "lucide-react"
import { Event } from "@/types/usuario"

interface EventsDisplayProps {
  events: Event[]
  viewMode: "cards" | "list"
  registeredEvents: string[]
  loadingActions: Record<string, 'registering' | 'unregistering' | null>
  onRegister: (eventId: string) => void
  onUnregister: (eventId: string) => void
}

export function EventsDisplay({
  events,
  viewMode,
  registeredEvents,
  loadingActions,
  onRegister,
  onUnregister
}: EventsDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString)
    const [hours, minutes] = timeString.split(':')
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStatusLabel = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'Próximo'
      case 'ONGOING': return 'Em Andamento'
      case 'COMPLETED': return 'Concluído'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const getEventStatusVariant = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'default' as const
      case 'ONGOING': return 'secondary' as const
      case 'COMPLETED': return 'outline' as const
      case 'CANCELLED': return 'destructive' as const
      default: return 'outline' as const
    }
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
          <p className="text-muted-foreground text-center">
            Não há eventos disponíveis no momento.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={viewMode === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
      {events.map((event) => {
        const isRegistered = registeredEvents.includes(event.id)
        const isLoading = loadingActions[event.id]
        const canRegister = event.status === 'UPCOMING' || event.status === 'ONGOING'

        return (
          <div 
            key={event.id} 
            className={viewMode === "cards" 
              ? "p-4 border rounded-lg bg-muted/50 hover:shadow-lg transition-shadow flex flex-col h-full" 
              : "flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 bg-muted/50"
            }
          >
            <div className={viewMode === "cards" ? "flex-1 min-w-0" : "flex-1"}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">{event.title}</h3>
                <Badge variant={getEventStatusVariant(event.status)}>
                  {getEventStatusLabel(event.status)}
                </Badge>
                {event.maxAttendees && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    {event.maxAttendees} {event.maxAttendees === 1 ? 'vaga' : 'vagas'}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {event.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
              
              {event.maxAttendees && (
                <div className="mt-3 max-w-xs">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Inscritos</span>
                    <span>0 / {event.maxAttendees}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((0 / event.maxAttendees) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground mt-2">
                Criado por {event.createdBy.name} em {formatDate(event.createdAt)}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {canRegister && (
                <Button
                  size="sm"
                  variant={isRegistered ? "outline" : "default"}
                  onClick={() => isRegistered ? onUnregister(event.id) : onRegister(event.id)}
                  disabled={isLoading !== null}
                  className="flex items-center space-x-1"
                >
                  {isLoading === 'registering' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : isLoading === 'unregistering' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : isRegistered ? (
                    <UserMinus className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  <span>
                    {isLoading === 'registering' ? 'Inscrevendo...' :
                     isLoading === 'unregistering' ? 'Cancelando...' :
                     isRegistered ? 'Cancelar Inscrição' : 'Inscrever-se'}
                  </span>
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}