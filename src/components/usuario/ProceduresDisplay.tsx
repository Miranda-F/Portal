"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Eye, AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"
import { Procedure } from "@/types/usuario"

interface ProceduresDisplayProps {
  procedures: Procedure[]
  viewMode: "cards" | "list"
  onOpenContentModal: (procedure: Procedure) => void
}

export function ProceduresDisplay({
  procedures,
  viewMode,
  onOpenContentModal
}: ProceduresDisplayProps) {
  const getProcedureValidityStatus = (procedure: Procedure) => {
    // Por enquanto, não temos o campo validityDays no banco de dados
    // Retornamos null para não mostrar badges de validade
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (procedures.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum procedimento encontrado</h3>
          <p className="text-muted-foreground text-center">
            Não há procedimentos disponíveis no momento.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={viewMode === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
      {procedures.map((procedure) => (
        <div 
          key={procedure.id} 
          className={viewMode === "cards" 
            ? "p-4 border rounded-lg bg-muted/50 hover:shadow-lg transition-shadow" 
            : "flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 bg-muted/50"
          }
        >
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-medium text-sm sm:text-base">{procedure.title}</h3>
              
              {/* Não exibe o texto "Publicado" conforme solicitado */}
              
              {/* Alertas de validade - apenas para procedimentos publicados */}
              {procedure.status === 'PUBLISHED' && (() => {
                const validityStatus = getProcedureValidityStatus(procedure)
                if (!validityStatus) return null
                
                switch (validityStatus.status) {
                  case 'expired':
                    return (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Vencido há {validityStatus.days} dias
                      </Badge>
                    )
                  case 'warning':
                    return (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800 border-orange-300">
                        <AlertTriangle className="h-3 w-3" />
                        Vence em {validityStatus.days} dias
                      </Badge>
                    )
                  case 'valid':
                    return (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Válido por {validityStatus.days} dias
                      </Badge>
                    )
                  default:
                    return null
                }
              })()}
            </div>
            
            {procedure.content && (
              <p className="text-sm text-muted-foreground mb-2">
                {procedure.content.substring(0, 100)}{procedure.content.length > 100 ? '...' : ''}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline">
                {procedure.type === 'MANAGEMENT_PROCEDURE' ? 'Procedimento de Gestão' : 'Instrução de Trabalho'}
              </Badge>
              {procedure.fileName && (
                <Badge variant="outline" className="flex items-center gap-1">
                  📄 {procedure.fileName}
                </Badge>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                Criado por {procedure.createdBy.name} em {formatDate(procedure.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {procedure.content && (
              <Button
                size="sm"
                onClick={() => onOpenContentModal(procedure)}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>Detalhes</span>
              </Button>
            )}
            {procedure.fileUrl && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => window.open(procedure.fileUrl, '_blank')}
              >
                <FileText className="h-4 w-4 mr-1" />
                <span>Visualizar Pdf</span>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}