'use client'

import { useState, useEffect, useMemo } from 'react'
import { Document } from '@/types/document'
import { statusOptions, documentTypes } from '@/constants/document'
import { Search, Plus, Eye, Edit, Download, ArrowUpDown, ArrowUp, ArrowDown, X, Calendar, History, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CommonHeader } from './common-header'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  getStatusBadge,
  getTypeLabel,
  getDirectoryFromType,
  getDirectoryFromFolderPath,
  getExpirationStatus,
  formatDate,
  truncateText
} from '../utils/document-utils'
import { exportDocuments } from '../utils/export-utils'

interface DocumentsSectionProps {
  allDocuments: Document[]
  loading: boolean
  sectors: string[]
  selectedDocument: Document | null
  setSelectedDocument: (document: Document | null) => void
  onCreateDocument: (initialFolderPath?: string) => void
  onEditDocument: (document: Document) => void
  onViewDocument: (document: Document) => void
  onDownloadDocument: (document: Document) => void
  onRescheduleDocument?: (document: Document) => void
  onDeleteDocument?: (document: Document) => void
  onViewHistory?: (document: Document) => void
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | null
  logout: () => void
}

type SortField = 'code' | 'title' | 'responsibleSector' | 'description' | 'type' | 'version' | 'directory' | 'nextReviewDate' | 'status'
type SortDirection = 'asc' | 'desc' | null

export function DocumentsSection({
  allDocuments,
  loading,
  sectors,
  selectedDocument,
  setSelectedDocument,
  onCreateDocument,
  onEditDocument,
  onViewDocument,
  onDownloadDocument,
  onRescheduleDocument,
  onDeleteDocument,
  onViewHistory,
  user,
  logout
}: DocumentsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [sortField, setSortField] = useState<SortField>('code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Estados locais de filtros para a seção "documents" (isolados de outras seções)
  const [documentsSearchTerm, setDocumentsSearchTerm] = useState('')
  const [documentsStatusFilter, setDocumentsStatusFilter] = useState('all')
  const [documentsTypeFilter, setDocumentsTypeFilter] = useState('all')
  const [documentsSectorFilter, setDocumentsSectorFilter] = useState('all')
  const [authorFilter, setAuthorFilter] = useState('')

  useEffect(() => { setCurrentPage(1) }, [documentsSearchTerm, documentsStatusFilter, documentsTypeFilter, documentsSectorFilter, authorFilter])

  const authorOptions = Array.from(new Set(allDocuments.map(d => d.createdBy).filter(Boolean))) as string[]

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortField('code')
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 text-gray-700 dark:text-gray-300" />
    }
    return <ArrowDown className="h-4 w-4 text-gray-700 dark:text-gray-300" />
  }

  const handleClearFilters = () => {
    setDocumentsSearchTerm('')
    setDocumentsStatusFilter('all')
    setDocumentsTypeFilter('all')
    setDocumentsSectorFilter('all')
    setAuthorFilter('')
    setCurrentPage(1)
  }

  const hasActiveFilters = documentsSearchTerm || documentsStatusFilter !== 'all' || documentsTypeFilter !== 'all' || documentsSectorFilter !== 'all' || authorFilter

  const handleExportPDF = async () => {
    try {
      // Aplicar todos os filtros locais da seção documents
      let filteredDocs = allDocuments

      // Filtro de busca
      if (documentsSearchTerm.trim()) {
        const term = documentsSearchTerm.trim().toLowerCase()
        filteredDocs = filteredDocs.filter(d =>
          d.title.toLowerCase().includes(term) ||
          d.description.toLowerCase().includes(term) ||
          d.code.toLowerCase().includes(term) ||
          d.responsibleSector.toLowerCase().includes(term)
        )
      }

      // Filtro de status
      if (documentsStatusFilter !== 'all') {
        filteredDocs = filteredDocs.filter(d => d.status === documentsStatusFilter)
      }

      // Filtro de tipo
      if (documentsTypeFilter !== 'all') {
        filteredDocs = filteredDocs.filter(d => d.type === documentsTypeFilter)
      }

      // Filtro de setor
      if (documentsSectorFilter !== 'all') {
        filteredDocs = filteredDocs.filter(d => d.responsibleSector === documentsSectorFilter)
      }

      // Filtro de autor
      filteredDocs = filteredDocs.filter(d => !authorFilter || (d.createdBy || '') === authorFilter)

      await exportDocuments(filteredDocs, 'documentos_exportados')
    } catch (e) {
      console.error('Erro ao exportar arquivos', e)
      alert('Erro ao exportar arquivos. Tente novamente.')
    }
  }

  // Aplicar filtros e ordenação
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = allDocuments

    // Filtro de busca
    if (documentsSearchTerm.trim()) {
      const term = documentsSearchTerm.trim().toLowerCase()
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(term) ||
        d.description.toLowerCase().includes(term) ||
        d.code.toLowerCase().includes(term) ||
        d.responsibleSector.toLowerCase().includes(term)
      )
    }

    // Filtro de status
    if (documentsStatusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === documentsStatusFilter)
    }

    // Filtro de tipo
    if (documentsTypeFilter !== 'all') {
      filtered = filtered.filter(d => d.type === documentsTypeFilter)
    }

    // Filtro de setor
    if (documentsSectorFilter !== 'all') {
      filtered = filtered.filter(d => d.responsibleSector === documentsSectorFilter)
    }

    // Filtro de autor
    if (authorFilter) {
      filtered = filtered.filter(d => (d.createdBy || '') === authorFilter)
    }

    // Ordenação
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'code':
          aValue = a.code || ''
          bValue = b.code || ''
          break
        case 'title':
          aValue = a.title || ''
          bValue = b.title || ''
          break
        case 'responsibleSector':
          aValue = a.responsibleSector || ''
          bValue = b.responsibleSector || ''
          break
        case 'description':
          aValue = a.description || ''
          bValue = b.description || ''
          break
        case 'type':
          aValue = getTypeLabel(a.type)
          bValue = getTypeLabel(b.type)
          break
        case 'version':
          aValue = a.version || ''
          bValue = b.version || ''
          break
        case 'directory':
          aValue = getDirectoryFromFolderPath(a)
          bValue = getDirectoryFromFolderPath(b)
          break
        case 'nextReviewDate':
          aValue = a.nextReviewDate ? new Date(a.nextReviewDate).getTime() : 0
          bValue = b.nextReviewDate ? new Date(b.nextReviewDate).getTime() : 0
          break
        case 'status':
          aValue = a.status || ''
          bValue = b.status || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [allDocuments, documentsSearchTerm, documentsStatusFilter, documentsTypeFilter, documentsSectorFilter, authorFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedDocuments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const pageDocuments = filteredAndSortedDocuments.slice(startIndex, endIndex)

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <CommonHeader
        title="Documentos"
        description="Lista mestra de documentos"
        user={user}
        logout={logout}
      />

      {/* Controls Header */}
      <div className="flex flex-col gap-4">
        {/* Top Row: Export, Results per Page, Legend, Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              className="bg-black hover:bg-black/90 text-white"
              onClick={handleExportPDF}
            >
              Exportar
            </Button>

            <div className="flex items-center gap-2">
              <Select value={itemsPerPage.toString()} onValueChange={(v) => {
                setItemsPerPage(Number(v))
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[220px] min-w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 resultados por página</SelectItem>
                  <SelectItem value="50">50 resultados por página</SelectItem>
                  <SelectItem value="100">100 resultados por página</SelectItem>
                  <SelectItem value="200">200 resultados por página</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Legend */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Vencimento acima de 30 dias</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Vencendo em 30 dias</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Vencido</span>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Remover filtros
              </Button>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar"
                value={documentsSearchTerm}
                onChange={(e) => setDocumentsSearchTerm(e.target.value)}
                className="pl-10 w-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2">
          <Select value={documentsStatusFilter} onValueChange={setDocumentsStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={documentsTypeFilter} onValueChange={setDocumentsTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              {documentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={documentsSectorFilter} onValueChange={setDocumentsSectorFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Setores</SelectItem>
              {sectors.map(sector => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={authorFilter || 'all'} onValueChange={(v) => setAuthorFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Autor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos autores</SelectItem>
              {authorOptions.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => onCreateDocument()} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Novo</span>
          </Button>
        </div>
      </div>

      {/* Master List Table */}
      <Card className="bg-white dark:bg-[#171717] border-slate-200 dark:border-gray-600 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pageDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum documento encontrado
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full border-collapse" style={{ tableLayout: 'auto', width: '100%' }}>
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10" style={{ width: '9%' }} onClick={() => handleSort('code')}>
                      <div className="flex items-center gap-1">
                        CÓDIGO
                        {getSortIcon('code')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10" style={{ width: '14%' }} onClick={() => handleSort('title')}>
                      <div className="flex items-center gap-1">
                        NOME
                        {getSortIcon('title')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10" style={{ width: '9%' }} onClick={() => handleSort('responsibleSector')}>
                      <div className="flex items-center gap-1">
                        AREA
                        {getSortIcon('responsibleSector')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10" style={{ width: '11%' }} onClick={() => handleSort('description')}>
                      <div className="flex items-center gap-1">
                        DESCRIÇÃO
                        {getSortIcon('description')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10" style={{ width: '10%' }} onClick={() => handleSort('type')}>
                      <div className="flex items-center gap-1">
                        CLASSIFICAÇÃO
                        {getSortIcon('type')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10" style={{ width: '6%' }} onClick={() => handleSort('version')}>
                      <div className="flex items-center justify-center gap-1">
                        VERSÃO
                        {getSortIcon('version')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10" style={{ width: '12%' }} onClick={() => handleSort('directory')}>
                      <div className="flex items-center gap-1">
                        DIRETÓRIO
                        {getSortIcon('directory')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10" style={{ width: '9%' }} onClick={() => handleSort('nextReviewDate')}>
                      <div className="flex items-center justify-center gap-1">
                        VENCIMENTO
                        {getSortIcon('nextReviewDate')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10" style={{ width: '8%' }} onClick={() => handleSort('status')}>
                      <div className="flex items-center justify-center gap-1">
                        STATUS
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300" style={{ width: '12%' }}>
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageDocuments.map((document) => {
                    const expirationStatus = getExpirationStatus(document.nextReviewDate || null)
                    return (
                      <ContextMenu key={document.id}>
                        <ContextMenuTrigger asChild>
                          <tr
                            className={`cursor-pointer border-b border-slate-200 dark:border-slate-800 last:border-b-0 transition-colors hover:bg-slate-50 dark:hover:bg-primary/10 ${selectedDocument?.id === document.id ? 'bg-primary/10 dark:bg-primary/20' : ''
                              }`}
                            onClick={() => setSelectedDocument(document)}
                          >
                            <td className="font-mono text-xs px-3 py-2 truncate" title={document.code || '—'}>
                              {document.code || '—'}
                            </td>
                            <td className="text-xs px-3 py-2 truncate" title={document.title || '—'}>
                              {document.title || '—'}
                            </td>
                            <td className="text-xs px-3 py-2 truncate" title={document.responsibleSector || '—'}>
                              {document.responsibleSector || '—'}
                            </td>
                            <td className="text-xs px-3 py-2" title={document.description || '—'}>
                              {truncateText(document.description, 40)}
                            </td>
                            <td className="text-xs px-3 py-2 truncate" title={getTypeLabel(document.type)}>
                              {getTypeLabel(document.type)}
                            </td>
                            <td className="text-xs px-3 py-2 text-center">{document.version || '1.0'}</td>
                            <td className="text-xs px-3 py-2 truncate" title={getDirectoryFromFolderPath(document)}>
                              {getDirectoryFromFolderPath(document)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className={`px-2 py-1 rounded ${expirationStatus.bgColor} text-center font-medium text-xs whitespace-nowrap inline-block`}>
                                {document.nextReviewDate ? formatDate(document.nextReviewDate) : '—'}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex justify-center">
                                {getStatusBadge(document.status)}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => onViewDocument(document)}
                                  title="Visualizar"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => onEditDocument(document)}
                                  title="Editar"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => onDownloadDocument(document)}
                                  title="Download"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDocument(document)
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Detalhes
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          {onRescheduleDocument && (
                            <ContextMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onRescheduleDocument(document)
                              }}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Reaprazar
                            </ContextMenuItem>
                          )}
                          <ContextMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditDocument(document)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </ContextMenuItem>
                          {onViewHistory && (
                            <ContextMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewHistory(document)
                              }}
                            >
                              <History className="h-4 w-4 mr-2" />
                              Histórico
                            </ContextMenuItem>
                          )}
                          <ContextMenuSeparator />
                          {onDeleteDocument && (
                            <ContextMenuItem
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteDocument(document)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deletar
                            </ContextMenuItem>
                          )}
                        </ContextMenuContent>
                      </ContextMenu>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {`Mostrando ${Math.min(filteredAndSortedDocuments.length, startIndex + 1)} a ${Math.min(endIndex, filteredAndSortedDocuments.length)} de ${filteredAndSortedDocuments.length} documentos`}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
