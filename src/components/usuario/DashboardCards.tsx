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
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 hover:-translate-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm" onClick={() => onTabChange("qualidade")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Qualidade</CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{filteredProcedures.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredProcedures.length === 1 ? 'documento disponível' : 'documentos disponíveis'}
          </p>
        </CardContent>
      </Card>

      {/* Vagas Ativas Card */}
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-green-500 hover:-translate-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm" onClick={() => onTabChange("vagas")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Vagas Ativas</CardTitle>
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{filteredJobs.filter(job => job.status === 'ACTIVE').length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredJobs.filter(job => job.status === 'ACTIVE').length === 1 ? 'vaga ativa' : 'vagas ativas'}
          </p>
        </CardContent>
      </Card>

      {/* Eventos Ativos Card */}
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-orange-500 hover:-translate-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm" onClick={() => onTabChange("eventos")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Eventos Ativos</CardTitle>
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{filteredEvents.filter(event => event.status === 'UPCOMING' || event.status === 'ONGOING').length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredEvents.filter(event => event.status === 'UPCOMING' || event.status === 'ONGOING').length === 1 ? 'evento ativo' : 'eventos ativos'}
          </p>
        </CardContent>
      </Card>


    </div>
  )
}