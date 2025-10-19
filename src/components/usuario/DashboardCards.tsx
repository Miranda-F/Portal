"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Briefcase, Calendar } from "lucide-react"
import { Procedure, Job, Event } from "@/types/usuario"

interface DashboardCardsProps {
  procedures: Procedure[]
  jobs: Job[]
  events: Event[]
  filteredProcedures: Procedure[]
  filteredJobs: Job[]
  filteredEvents: Event[]
  onTabChange: (tab: string) => void
}

export function DashboardCards({
  procedures,
  jobs,
  events,
  filteredProcedures,
  filteredJobs,
  filteredEvents,
  onTabChange
}: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Procedimentos Card */}
      <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500" onClick={() => onTabChange("procedimentos")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Procedimentos</CardTitle>
          <FileText className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{filteredProcedures.length}</div>
          <p className="text-xs text-muted-foreground">
            {filteredProcedures.length === 1 ? 'procedimento disponível' : 'procedimentos disponíveis'}
          </p>
        </CardContent>
      </Card>

      {/* Vagas Ativas Card */}
      <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-green-500" onClick={() => onTabChange("vagas")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vagas Ativas</CardTitle>
          <Briefcase className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{filteredJobs.filter(job => job.status === 'ACTIVE').length}</div>
          <p className="text-xs text-muted-foreground">
            {filteredJobs.filter(job => job.status === 'ACTIVE').length === 1 ? 'vaga ativa' : 'vagas ativas'}
          </p>
        </CardContent>
      </Card>

      {/* Eventos Ativos Card */}
      <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-orange-500" onClick={() => onTabChange("eventos")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
          <Calendar className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{filteredEvents.filter(event => event.status === 'UPCOMING' || event.status === 'ONGOING').length}</div>
          <p className="text-xs text-muted-foreground">
            {filteredEvents.filter(event => event.status === 'UPCOMING' || event.status === 'ONGOING').length === 1 ? 'evento ativo' : 'eventos ativos'}
          </p>
        </CardContent>
      </Card>


    </div>
  )
}