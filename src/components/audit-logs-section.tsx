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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
        <p className="text-muted-foreground">
          Monitora todas as atividades dos usuários no sistema com detalhes completos.
        </p>
      </div>

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
                          <div className="truncate" title={log.description}>
                            {log.description}
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