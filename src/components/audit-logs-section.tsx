'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  Activity, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileSearch,
  RefreshCw
} from "lucide-react"
import { ActionType, ActionResult, RequestSource } from '@prisma/client'

interface AuditLog {
  id: string
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: string
  action: string
  actionType: ActionType
  description: string
  details?: string
  ipAddress?: string
  userAgent?: string
  requestSource?: RequestSource
  entityType?: string
  entityId?: string
  entityName?: string
  result: ActionResult
  errorCode?: string
  errorMessage?: string
  createdAt: string
  userInfo?: {
    name: string
    email: string
    role: string
    sector?: string
  }
}

interface AuditLogsSectionProps {
  activeTab: string
}

export default function AuditLogsSection({ activeTab }: AuditLogsSectionProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("")
  const [resultFilter, setResultFilter] = useState<string>("")
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    if (activeTab === "audit-logs") {
      fetchAuditLogs()
    }
  }, [activeTab, currentPage, searchTerm, actionTypeFilter, resultFilter, entityTypeFilter, startDate, endDate])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50'
      })

      if (searchTerm) params.append('search', searchTerm)
      if (actionTypeFilter && actionTypeFilter !== "all") params.append('actionType', actionTypeFilter)
      if (resultFilter && resultFilter !== "all") params.append('result', resultFilter)
      if (entityTypeFilter) params.append('entityType', entityTypeFilter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs || [])
        setTotalPages(data.pagination?.pages || 1)
        setTotalCount(data.pagination?.total || 0)
      } else {
        console.error('Failed to fetch audit logs')
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionTypeLabel = (actionType: ActionType): string => {
    const labels = {
      [ActionType.LOGIN]: 'Login',
      [ActionType.LOGOUT]: 'Logout',
      [ActionType.CREATE]: 'Criação',
      [ActionType.UPDATE]: 'Atualização',
      [ActionType.DELETE]: 'Exclusão',
      [ActionType.VIEW]: 'Visualização',
      [ActionType.APPROVE]: 'Aprovação',
      [ActionType.REJECT]: 'Rejeição',
      [ActionType.EXPORT]: 'Exportação',
      [ActionType.IMPORT]: 'Importação',
      [ActionType.UPLOAD]: 'Upload',
      [ActionType.DOWNLOAD]: 'Download',
      [ActionType.SETTINGS_CHANGE]: 'Alteração de Configuração',
      [ActionType.PERMISSION_CHANGE]: 'Alteração de Permissão',
      [ActionType.PASSWORD_CHANGE]: 'Alteração de Senha',
      [ActionType.EMAIL_CHANGE]: 'Alteração de Email',
      [ActionType.PROFILE_UPDATE]: 'Atualização de Perfil',
      [ActionType.DOCUMENT_ACCESS]: 'Acesso a Documento',
      [ActionType.REPORT_ACCESS]: 'Acesso a Relatório',
      [ActionType.SYSTEM_ACTION]: 'Ação do Sistema',
      [ActionType.OTHER]: 'Outro'
    }
    return labels[actionType] || actionType
  }

  // Função para mapear ações para rotas específicas
  const getRouteFromAction = (log: AuditLog): string => {
    const { action, actionType, entityType, entityId } = log
    
    
    // === AUTENTICAÇÃO ===
    if (action.includes('LOGIN') || actionType === 'LOGIN') {
      return 'POST /api/auth/login'
    }
    if (action.includes('LOGOUT') || actionType === 'LOGOUT') {
      return 'POST /api/auth/logout'
    }
    if (action.includes('REFRESH')) {
      return 'POST /api/auth/refresh'
    }
    if (action.includes('FORGOT_PASSWORD') || actionType === 'PASSWORD_CHANGE') {
      return 'POST /api/auth/forgot-password'
    }
    if (action.includes('ME')) {
      return 'GET /api/auth/me'
    }
    
    // === USUÁRIOS ===
    if ((action.includes('CREATE') || actionType === 'CREATE') && entityType === 'USER') {
      return 'POST /api/rh/employees'
    }
    if ((action.includes('UPDATE') || actionType === 'UPDATE') && entityType === 'USER') {
      return `PUT /api/admin/users/${entityId}`
    }
    if ((action.includes('DELETE') || actionType === 'DELETE') && entityType === 'USER') {
      return `DELETE /api/admin/users/${entityId}`
    }
    if ((action.includes('APPROVE') || actionType === 'APPROVE') && entityType === 'USER') {
      return `PUT /api/admin/users/${entityId}/approve`
    }
    if (action.includes('GET') && entityType === 'USER') {
      return `GET /api/admin/users/${entityId}`
    }
    if (action.includes('LIST') && entityType === 'USER') {
      return 'GET /api/admin/users'
    }
    
    // === FUNCIONÁRIOS RH ===
    if (action.includes('CREATE') && entityType === 'EMPLOYEE') {
      return 'POST /api/rh/employees'
    }
    if (action.includes('UPDATE') && entityType === 'EMPLOYEE') {
      return `PUT /api/rh/employees/${entityId}`
    }
    if (action.includes('DELETE') && entityType === 'EMPLOYEE') {
      return `DELETE /api/rh/employees/${entityId}`
    }
    if (action.includes('GET') && entityType === 'EMPLOYEE') {
      return `GET /api/rh/employees/${entityId}`
    }
    if (action.includes('LIST') && entityType === 'EMPLOYEE') {
      return 'GET /api/rh/employees'
    }
    
    // === SETORES ===
    if (action.includes('CREATE') && entityType === 'SECTOR') {
      return 'POST /api/admin/sectors'
    }
    if (action.includes('UPDATE') && entityType === 'SECTOR') {
      return `PUT /api/admin/sectors/${entityId}`
    }
    if (action.includes('DELETE') && entityType === 'SECTOR') {
      return `DELETE /api/admin/sectors/${entityId}`
    }
    if (action.includes('TOGGLE') && entityType === 'SECTOR') {
      return `PUT /api/admin/sectors/${entityId}/toggle`
    }
    if (action.includes('GET') && entityType === 'SECTOR') {
      return `GET /api/admin/sectors/${entityId}`
    }
    if (action.includes('LIST') && entityType === 'SECTOR') {
      return 'GET /api/admin/sectors'
    }
    
    // === GRUPOS ===
    if (action.includes('CREATE') && entityType === 'GROUP') {
      return 'POST /api/admin/groups'
    }
    if (action.includes('UPDATE') && entityType === 'GROUP') {
      return `PUT /api/admin/groups/${entityId}`
    }
    if (action.includes('DELETE') && entityType === 'GROUP') {
      return `DELETE /api/admin/groups/${entityId}`
    }
    if (action.includes('USERS') && entityType === 'GROUP') {
      return `GET /api/admin/groups/${entityId}/users`
    }
    if (action.includes('GET') && entityType === 'GROUP') {
      return `GET /api/admin/groups/${entityId}`
    }
    if (action.includes('LIST') && entityType === 'GROUP') {
      return 'GET /api/admin/groups'
    }
    
    // === EVENTOS ===
    if (action.includes('CREATE') && entityType === 'EVENT') {
      return 'POST /api/admin/events'
    }
    if (action.includes('UPDATE') && entityType === 'EVENT') {
      return `PUT /api/admin/events/${entityId}`
    }
    if (action.includes('DELETE') && entityType === 'EVENT') {
      return `DELETE /api/admin/events/${entityId}`
    }
    if (action.includes('TOGGLE') && entityType === 'EVENT') {
      return `PUT /api/admin/events/${entityId}/toggle`
    }
    if (action.includes('GET') && entityType === 'EVENT') {
      return `GET /api/admin/events/${entityId}`
    }
    if (action.includes('LIST') && entityType === 'EVENT') {
      return 'GET /api/admin/events'
    }
    if (action.includes('REGISTER') && entityType === 'EVENT') {
      return 'POST /api/user/register-event'
    }
    if (action.includes('UNREGISTER') && entityType === 'EVENT') {
      return 'POST /api/user/unregister-event'
    }
    
    // === VAGAS DE EMPREGO ===
    if (action.includes('CREATE') && entityType === 'JOB') {
      return 'POST /api/admin/jobs'
    }
    if (action.includes('UPDATE') && entityType === 'JOB') {
      return `PUT /api/admin/jobs/${entityId}`
    }
    if (action.includes('DELETE') && entityType === 'JOB') {
      return `DELETE /api/admin/jobs/${entityId}`
    }
    if (action.includes('TOGGLE') && entityType === 'JOB') {
      return `PUT /api/admin/jobs/${entityId}/toggle`
    }
    if (action.includes('FILL') && entityType === 'JOB') {
      return `PUT /api/admin/jobs/${entityId}/fill`
    }
    if (action.includes('GET') && entityType === 'JOB') {
      return `GET /api/admin/jobs/${entityId}`
    }
    if (action.includes('LIST') && entityType === 'JOB') {
      return 'GET /api/admin/jobs'
    }
    if (action.includes('REGISTER') && entityType === 'JOB') {
      return 'POST /api/user/register-job'
    }
    if (action.includes('UNREGISTER') && entityType === 'JOB') {
      return 'POST /api/user/unregister-job'
    }
    
    // === PROCEDIMENTOS ===
    if (action.includes('CREATE') && entityType === 'PROCEDURE') {
      return 'POST /api/admin/procedures'
    }
    if (action.includes('UPDATE') && entityType === 'PROCEDURE') {
      return `PUT /api/admin/procedures/${entityId}`
    }
    if (action.includes('DELETE') && entityType === 'PROCEDURE') {
      return `DELETE /api/admin/procedures/${entityId}`
    }
    if (action.includes('HISTORY') && entityType === 'PROCEDURE') {
      return `GET /api/admin/procedures/${entityId}/history`
    }
    if (action.includes('MIGRATE') && entityType === 'PROCEDURE') {
      return 'POST /api/admin/procedures/migrate'
    }
    if (action.includes('GET') && entityType === 'PROCEDURE') {
      return `GET /api/admin/procedures/${entityId}`
    }
    if (action.includes('LIST') && entityType === 'PROCEDURE') {
      return 'GET /api/admin/procedures'
    }
    
    // === TREINAMENTOS ===
    if (action.includes('CREATE') && entityType === 'TRAINING') {
      return 'POST /api/admin/trainings'
    }
    if (action.includes('UPDATE') && entityType === 'TRAINING') {
      return `PUT /api/admin/trainings/${entityId}`
    }
    if (action.includes('DELETE') && entityType === 'TRAINING') {
      return `DELETE /api/admin/trainings/${entityId}`
    }
    if (action.includes('GET') && entityType === 'TRAINING') {
      return `GET /api/admin/trainings/${entityId}`
    }
    if (action.includes('LIST') && entityType === 'TRAINING') {
      return 'GET /api/admin/trainings'
    }
    
    // === PUBLICAÇÕES ===
    if (action.includes('CREATE') && entityType === 'PUBLICATION') {
      return 'POST /api/admin/publications'
    }
    if (action.includes('UPDATE') && entityType === 'PUBLICATION') {
      return `PUT /api/admin/publications/${entityId}`
    }
    if (action.includes('DELETE') && entityType === 'PUBLICATION') {
      return `DELETE /api/admin/publications/${entityId}`
    }
    if (action.includes('GET') && entityType === 'PUBLICATION') {
      return `GET /api/admin/publications/${entityId}`
    }
    if (action.includes('LIST') && entityType === 'PUBLICATION') {
      return 'GET /api/admin/publications'
    }
    
    // === LOGS DE AUDITORIA ===
    if (action.includes('EXPORT') && entityType === 'AUDIT_LOG') {
      return 'GET /api/admin/audit-logs/export'
    }
    if (action.includes('GET') && entityType === 'AUDIT_LOG') {
      return 'GET /api/admin/audit-logs'
    }
    
    // === CONFIGURAÇÕES ===
    if (action.includes('UPDATE') && entityType === 'SETTINGS') {
      return 'PUT /api/admin/settings'
    }
    if (action.includes('GET') && entityType === 'SETTINGS') {
      return 'GET /api/admin/settings'
    }
    
    // === PERFIL DO USUÁRIO ===
    if (action.includes('UPDATE') && entityType === 'PROFILE') {
      return 'PUT /api/user/profile'
    }
    if (action.includes('GET') && entityType === 'PROFILE') {
      return 'GET /api/user/profile'
    }
    
    // === CATEGORIAS ===
    if (action.includes('CREATE') && entityType === 'CATEGORY') {
      return 'POST /api/admin/categories'
    }
    if (action.includes('UPDATE') && entityType === 'CATEGORY') {
      return `PUT /api/admin/categories/${entityId}`
    }
    if (action.includes('DELETE') && entityType === 'CATEGORY') {
      return `DELETE /api/admin/categories/${entityId}`
    }
    if (action.includes('GET') && entityType === 'CATEGORY') {
      return `GET /api/admin/categories/${entityId}`
    }
    if (action.includes('LIST') && entityType === 'CATEGORY') {
      return 'GET /api/admin/categories'
    }
    
    // === TAGS ===
    if (action.includes('CREATE') && entityType === 'TAG') {
      return 'POST /api/admin/tags'
    }
    if (action.includes('UPDATE') && entityType === 'TAG') {
      return `PUT /api/admin/tags/${entityId}`
    }
    if (action.includes('DELETE') && entityType === 'TAG') {
      return `DELETE /api/admin/tags/${entityId}`
    }
    if (action.includes('GET') && entityType === 'TAG') {
      return `GET /api/admin/tags/${entityId}`
    }
    if (action.includes('LIST') && entityType === 'TAG') {
      return 'GET /api/admin/tags'
    }
    
    // Fallback inteligente baseado no actionType e entityType
    if (actionType === 'CREATE') {
      if (entityType === 'USER') return 'POST /api/rh/employees'
      if (entityType === 'SECTOR') return 'POST /api/admin/sectors'
      if (entityType === 'GROUP') return 'POST /api/admin/groups'
      if (entityType === 'EVENT') return 'POST /api/admin/events'
      if (entityType === 'JOB') return 'POST /api/admin/jobs'
      if (entityType === 'PROCEDURE') return 'POST /api/admin/procedures'
      if (entityType === 'TRAINING') return 'POST /api/admin/trainings'
      if (entityType === 'PUBLICATION') return 'POST /api/admin/publications'
      if (entityType === 'CATEGORY') return 'POST /api/admin/categories'
      if (entityType === 'TAG') return 'POST /api/admin/tags'
      return 'POST /api/admin/...'
    }
    
    if (actionType === 'UPDATE') {
      if (entityType === 'USER') return `PUT /api/admin/users/${entityId || '[id]'}`
      if (entityType === 'SECTOR') return `PUT /api/admin/sectors/${entityId || '[id]'}`
      if (entityType === 'GROUP') return `PUT /api/admin/groups/${entityId || '[id]'}`
      if (entityType === 'EVENT') return `PUT /api/admin/events/${entityId || '[id]'}`
      if (entityType === 'JOB') return `PUT /api/admin/jobs/${entityId || '[id]'}`
      if (entityType === 'PROCEDURE') return `PUT /api/admin/procedures/${entityId || '[id]'}`
      if (entityType === 'TRAINING') return `PUT /api/admin/trainings/${entityId || '[id]'}`
      if (entityType === 'PUBLICATION') return `PUT /api/admin/publications/${entityId || '[id]'}`
      if (entityType === 'CATEGORY') return `PUT /api/admin/categories/${entityId || '[id]'}`
      if (entityType === 'TAG') return `PUT /api/admin/tags/${entityId || '[id]'}`
      return `PUT /api/admin/${entityType?.toLowerCase() || '...'}/${entityId || '[id]'}`
    }
    
    if (actionType === 'DELETE') {
      if (entityType === 'USER') return `DELETE /api/admin/users/${entityId || '[id]'}`
      if (entityType === 'SECTOR') return `DELETE /api/admin/sectors/${entityId || '[id]'}`
      if (entityType === 'GROUP') return `DELETE /api/admin/groups/${entityId || '[id]'}`
      if (entityType === 'EVENT') return `DELETE /api/admin/events/${entityId || '[id]'}`
      if (entityType === 'JOB') return `DELETE /api/admin/jobs/${entityId || '[id]'}`
      if (entityType === 'PROCEDURE') return `DELETE /api/admin/procedures/${entityId || '[id]'}`
      if (entityType === 'TRAINING') return `DELETE /api/admin/trainings/${entityId || '[id]'}`
      if (entityType === 'PUBLICATION') return `DELETE /api/admin/publications/${entityId || '[id]'}`
      if (entityType === 'CATEGORY') return `DELETE /api/admin/categories/${entityId || '[id]'}`
      if (entityType === 'TAG') return `DELETE /api/admin/tags/${entityId || '[id]'}`
      return `DELETE /api/admin/${entityType?.toLowerCase() || '...'}/${entityId || '[id]'}`
    }
    
    if (actionType === 'VIEW' || action.includes('VIEW')) {
      if (entityType === 'USER') return `GET /api/admin/users/${entityId || ''}`
      if (entityType === 'SECTOR') return `GET /api/admin/sectors/${entityId || ''}`
      if (entityType === 'GROUP') return `GET /api/admin/groups/${entityId || ''}`
      if (entityType === 'EVENT') return `GET /api/admin/events/${entityId || ''}`
      if (entityType === 'JOB') return `GET /api/admin/jobs/${entityId || ''}`
      if (entityType === 'PROCEDURE') return `GET /api/admin/procedures/${entityId || ''}`
      if (entityType === 'TRAINING') return `GET /api/admin/trainings/${entityId || ''}`
      if (entityType === 'PUBLICATION') return `GET /api/admin/publications/${entityId || ''}`
      if (entityType === 'CATEGORY') return `GET /api/admin/categories/${entityId || ''}`
      if (entityType === 'TAG') return `GET /api/admin/tags/${entityId || ''}`
      return `GET /api/admin/${entityType?.toLowerCase() || '...'}/${entityId || ''}`
    }
    
    // Fallback final
    return `Rota não identificada (${actionType} ${entityType})`
  }

  // Função para obter descrição detalhada da ação
  const getDetailedDescription = (log: AuditLog): string => {
    const { action, actionType, entityType, entityName, userName, userEmail } = log
    
    const descriptions: Record<string, string> = {
      'CREATE': `Criou ${entityType?.toLowerCase() || 'entidade'} "${entityName || 'N/A'}"`,
      'UPDATE': `Atualizou ${entityType?.toLowerCase() || 'entidade'} "${entityName || 'N/A'}"`,
      'DELETE': `Excluiu ${entityType?.toLowerCase() || 'entidade'} "${entityName || 'N/A'}"`,
      'APPROVE': `Aprovou ${entityType?.toLowerCase() || 'entidade'} "${entityName || 'N/A'}"`,
      'REJECT': `Rejeitou ${entityType?.toLowerCase() || 'entidade'} "${entityName || 'N/A'}"`,
      'LOGIN': `Fez login no sistema`,
      'LOGOUT': `Fez logout do sistema`,
      'VIEW': `Visualizou ${entityType?.toLowerCase() || 'entidade'} "${entityName || 'N/A'}"`,
      'EXPORT': `Exportou dados`,
      'IMPORT': `Importou dados`,
      'UPLOAD': `Fez upload de arquivo`,
      'DOWNLOAD': `Fez download de arquivo`
    }
    
    return descriptions[actionType] || action
  }

  const getResultLabel = (result: ActionResult): string => {
    const labels = {
      [ActionResult.SUCCESS]: 'Sucesso',
      [ActionResult.FAILURE]: 'Falha',
      [ActionResult.PARTIAL_SUCCESS]: 'Sucesso Parcial',
      [ActionResult.TIMEOUT]: 'Timeout',
      [ActionResult.UNAUTHORIZED]: 'Não Autorizado',
      [ActionResult.FORBIDDEN]: 'Proibido',
      [ActionResult.NOT_FOUND]: 'Não Encontrado',
      [ActionResult.VALIDATION_ERROR]: 'Erro de Validação',
      [ActionResult.SERVER_ERROR]: 'Erro do Servidor'
    }
    return labels[result] || result
  }

  const getResultBadgeVariant = (result: ActionResult): "default" | "secondary" | "destructive" | "outline" => {
    switch (result) {
      case ActionResult.SUCCESS:
        return "default"
      case ActionResult.FAILURE:
      case ActionResult.UNAUTHORIZED:
      case ActionResult.FORBIDDEN:
      case ActionResult.SERVER_ERROR:
        return "destructive"
      case ActionResult.PARTIAL_SUCCESS:
      case ActionResult.TIMEOUT:
      case ActionResult.VALIDATION_ERROR:
        return "secondary"
      default:
        return "outline"
    }
  }

  const getActionTypeBadgeVariant = (actionType: ActionType): "default" | "secondary" | "destructive" | "outline" => {
    switch (actionType) {
      case ActionType.CREATE:
      case ActionType.UPDATE:
      case ActionType.APPROVE:
        return "default"
      case ActionType.DELETE:
      case ActionType.LOGIN:
      case ActionType.PERMISSION_CHANGE:
        return "destructive"
      case ActionType.VIEW:
      case ActionType.EXPORT:
      case ActionType.DOWNLOAD:
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatDateTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString)
    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setActionTypeFilter("")
    setResultFilter("")
    setEntityTypeFilter("")
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
  }


  const exportLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (actionTypeFilter && actionTypeFilter !== "all") params.append('actionType', actionTypeFilter)
      if (resultFilter && resultFilter !== "all") params.append('result', resultFilter)
      if (entityTypeFilter) params.append('entityType', entityTypeFilter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/admin/audit-logs/export?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error)
    }
  }

  if (activeTab !== "audit-logs") {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Usuário, ação, entidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Ação</label>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.values(ActionType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {getActionTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Resultado</label>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.values(ActionResult).map((result) => (
                    <SelectItem key={result} value={result}>
                      {getResultLabel(result)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Entidade</label>
              <Input
                placeholder="Ex: USER, POST, etc."
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Data Início</label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Data Fim</label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={clearFilters} variant="outline">
              <XCircle className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
            <Button onClick={exportLogs} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={fetchAuditLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Registros de Auditoria
            </span>
            <Badge variant="outline">
              {totalCount} registros encontrados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando logs...</span>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileSearch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou aguarde novas atividades no sistema.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(log.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{log.userName || log.userInfo?.name || 'Sistema'}</span>
                            <span className="text-xs text-muted-foreground">
                              {log.userEmail || log.userInfo?.email || ''}
                            </span>
                            {log.userInfo?.sector && (
                              <Badge variant="outline" className="text-xs mt-1 w-fit">
                                {log.userInfo.sector}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionTypeBadgeVariant(log.actionType)}>
                            {getActionTypeLabel(log.actionType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={getDetailedDescription(log)}>
                            {getDetailedDescription(log)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {log.entityType && (
                              <Badge variant="outline" className="text-xs w-fit">
                                {log.entityType}
                              </Badge>
                            )}
                            {log.entityName && (
                              <span className="text-xs text-muted-foreground mt-1">
                                {log.entityName}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getResultBadgeVariant(log.result)}>
                            {getResultLabel(log.result)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.ipAddress || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} ({totalCount} registros)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Anterior
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}