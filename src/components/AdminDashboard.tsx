'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building, Calendar, FileText, UserCheck, UserX, AlertTriangle, CheckCircle } from "lucide-react"
import { useTrainingStats, type TrainingStats } from "./useTrainingStats"

interface AdminDashboardProps {
  users: any[]
  pendingUsers: any[]
  events: any[]
  sectors: any[]
  groups: any[]
  trainings: any[]
}

export default function AdminDashboard({
  users,
  pendingUsers,
  events,
  sectors,
  groups,
  trainings
}: AdminDashboardProps) {
  
  const trainingStats: TrainingStats = useTrainingStats(trainings)

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingUsers.length} pendentes de aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Setores</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sectors.length}</div>
            <p className="text-xs text-muted-foreground">
              {sectors.filter(s => s.active).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {events.filter(e => e.status === 'UPCOMING').length} próximos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treinamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingStats.totalCount}</div>
            <p className="text-xs text-muted-foreground">
              {trainingStats.expiredCount} vencidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Treinamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Treinamentos</CardTitle>
          <CardDescription>Visão geral do status dos treinamentos no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">{trainingStats.validCount}</p>
                <p className="text-sm text-muted-foreground">No Prazo</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium">{trainingStats.expiredCount}</p>
                <p className="text-sm text-muted-foreground">Vencidos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">{trainingStats.pendingCount}</p>
                <p className="text-sm text-muted-foreground">Vence no Mês</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuários Pendentes */}
      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usuários Pendentes de Aprovação</CardTitle>
            <CardDescription>Usuários aguardando aprovação de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <UserX className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    <Badge variant="secondary">{user.function}</Badge>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Pendente
                  </Badge>
                </div>
              ))}
              {pendingUsers.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  E mais {pendingUsers.length - 5} usuários...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>Eventos próximos no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events
              .filter(event => event.status === 'UPCOMING')
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
            {events.filter(event => event.status === 'UPCOMING').length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum evento próximo encontrado.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}