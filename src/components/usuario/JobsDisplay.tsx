"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Mail, Phone, User, UserPlus, UserMinus } from "lucide-react"
import { Job } from "@/types/usuario"

interface JobsDisplayProps {
  jobs: Job[]
  viewMode: "cards" | "list"
  registeredJobs: string[]
  loadingActions: Record<string, 'registering' | 'unregistering' | null>
  onRegister: (jobId: string) => void
  onUnregister: (jobId: string) => void
}

export function JobsDisplay({
  jobs,
  viewMode,
  registeredJobs,
  loadingActions,
  onRegister,
  onUnregister
}: JobsDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'Tempo Integral'
      case 'PART_TIME': return 'Meio Período'
      case 'INTERNSHIP': return 'Estágio'
      case 'CONTRACT': return 'Contrato'
      case 'REMOTE': return 'Remoto'
      default: return type
    }
  }

  const getJobStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativa'
      case 'INACTIVE': return 'Desativada'
      case 'FILLED': return 'Concluída'
      default: return status
    }
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma vaga encontrada</h3>
          <p className="text-muted-foreground text-center">
            Não há vagas disponíveis no momento.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={viewMode === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
      {jobs.map((job) => {
        const isRegistered = registeredJobs.includes(job.id)
        const isLoading = loadingActions[job.id]

        return (
          <div 
            key={job.id} 
            className={viewMode === "cards" 
              ? "p-4 border rounded-lg bg-muted/50 hover:shadow-lg transition-shadow flex flex-col h-full" 
              : "flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 bg-muted/50"
            }
          >
            <div className={viewMode === "cards" ? "flex-1 min-w-0" : "flex-1"}>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{job.title}</h3>
                <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {getJobStatusLabel(job.status)}
                </Badge>
                {job.status === 'ACTIVE' && job.maxApplications && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {job.maxApplications} {job.maxApplications === 1 ? 'vaga' : 'vagas'}
                  </Badge>
                )}
              </div>
              
              {job.maxApplications && (
                <div className="mt-2 max-w-xs">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Inscrições</span>
                    <span>0 / {job.maxApplications}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((0 / job.maxApplications) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">
                  {getJobTypeLabel(job.type)}
                </Badge>
                {job.department && (
                  <Badge variant="secondary">
                    {job.department}
                  </Badge>
                )}
                {job.salary && (
                  <Badge variant="secondary">
                    {job.salary}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-2">
                {job.description}
              </p>
              
              {job.requirements && (
                <div className="mt-2">
                  <h4 className="font-semibold text-sm mb-1">Requisitos:</h4>
                  <p className="text-sm text-muted-foreground">{job.requirements}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
                {job.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{job.email}</span>
                </div>
                {job.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{job.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                Publicada em {formatDate(job.createdAt)}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {job.status === 'ACTIVE' && (
                <Button
                  size="sm"
                  variant={isRegistered ? "outline" : "default"}
                  onClick={() => isRegistered ? onUnregister(job.id) : onRegister(job.id)}
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