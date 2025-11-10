'use client'

import { useState, useEffect } from 'react'
import { Document } from '@/types/document'
import { Search, Eye, Edit, Download, Calendar, History, Trash2, FileText, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CommonHeader } from './common-header'
import { 
  getFileIcon, 
  getStatusBadge, 
  getTypeLabel, 
  formatFileSize, 
  getDirectoryFromType, 
  getExpirationStatus, 
  formatDate,
  truncateText
} from '../utils/document-utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { calculateFolderData } from '../utils/folder-utils'
import { exportDocuments } from '../utils/export-utils'

interface FoldersSectionProps {
  allDocuments: Document[]
  loading: boolean
  selectedDocument: Document | null
  setSelectedDocument: (document: Document | null) => void
  onEditDocument: (document: Document) => void
  onViewDocument: (document: Document) => void
  onDownloadDocument?: (document: Document) => void
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

export function FoldersSection({
  allDocuments,
  loading,
  selectedDocument,
  setSelectedDocument,
  onEditDocument,
  onViewDocument,
  onDownloadDocument,
  onRescheduleDocument,
  onDeleteDocument,
  onViewHistory,
  user,
  logout
}: FoldersSectionProps) {
  const itemsPerPage = 50
  
  // Estados locais de filtros para a seção "folders"
  const [selectedFolderType, setSelectedFolderType] = useState<string | null>(null)
  const [folderSearch, setFolderSearch] = useState('')
  const [folderDateFrom, setFolderDateFrom] = useState<string>('')
  const [folderDateTo, setFolderDateTo] = useState<string>('')
  const [folderAuthorFilter, setFolderAuthorFilter] = useState('')
  const [folderPage, setFolderPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  useEffect(() => { setFolderPage(1) }, [selectedFolderType, folderSearch, folderDateFrom, folderDateTo, folderAuthorFilter])
  
  // Função de ordenação
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField('code')
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3 text-gray-600 dark:text-gray-300" />
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-3 w-3 text-gray-600 dark:text-gray-300" />
    }
    return <ArrowUpDown className="h-3 w-3 text-gray-400" />
  }
  
  const folders = calculateFolderData(allDocuments)
  const authorOptions = Array.from(new Set(allDocuments.map(d => d.createdBy).filter(Boolean))) as string[]

  const handleExportFolders = async () => {
    try {
      if (!selectedFolderType) {
        alert('Selecione uma pasta primeiro.')
        return
      }

      // Aplicar todos os filtros da seção folders
      let filteredDocs = allDocuments
        .filter(d => d.type === (selectedFolderType as any))
        .filter(d => {
          const term = folderSearch.trim().toLowerCase()
          if (!term) return true
          const hay = `${d.title || ''} ${d.responsibleSector || ''} ${d.description || ''}`.toLowerCase()
          return hay.includes(term)
        })
        .filter(d => {
          if (!folderDateFrom && !folderDateTo) return true
          const created = new Date(d.createdAt)
          if (folderDateFrom) {
            const from = new Date(folderDateFrom)
            if (created < from) return false
          }
          if (folderDateTo) {
            const to = new Date(folderDateTo)
            to.setHours(23,59,59,999)
            if (created > to) return false
          }
          return true
        })
        .filter(d => !folderAuthorFilter || (d.createdBy || '') === folderAuthorFilter)

      const folderName = getTypeLabel(selectedFolderType as any).replace(/\s+/g, '_').toLowerCase()
      await exportDocuments(filteredDocs, `documentos_${folderName}`)
    } catch (e) {
      console.error('Erro ao exportar arquivos', e)
      alert('Erro ao exportar arquivos. Tente novamente.')
    }
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <CommonHeader
        title="Pastas"
        description="Acesse os documentos por categoria"
        user={user}
        logout={logout}
      />

      {/* Folders List (estilo explorador) */}
      <Card className="bg-white dark:bg-[#171717] border-gray-200 dark:border-gray-700">
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {folders.map((folder, index) => {
              const Icon = folder.icon
              return (
                <div
                  key={index}
                  onClick={() => { setSelectedFolderType(folder.type as string) }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer"
                >
                  <div className={`w-10 h-10 ${folder.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${folder.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{folder.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Categoria</p>
                  </div>
                  <span className={"text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}>{folder.count} arquivos</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos filtrada pela pasta selecionada */}
      {selectedFolderType && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Documentos em "{getTypeLabel(selectedFolderType as any)}"
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSelectedFolderType(null) }}
            >
              Limpar filtro
            </Button>
          </div>

          {/* Controles de busca e data */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, setor, descrição..."
                value={folderSearch}
                onChange={(e) => setFolderSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">Autor</label>
                <Select value={folderAuthorFilter || 'all'} onValueChange={(v) => setFolderAuthorFilter(v === 'all' ? '' : v)}>
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
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">De</label>
                <Input
                  type="date"
                  aria-label="Data início"
                  value={folderDateFrom}
                  onChange={(e) => setFolderDateFrom(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">Até</label>
                <Input
                  type="date"
                  aria-label="Data fim"
                  value={folderDateTo}
                  onChange={(e) => setFolderDateTo(e.target.value)}
                />
              </div>
              <Button className="bg-black text-white hover:bg-black/90" onClick={handleExportFolders}>Exportar</Button>
            </div>
          </div>

          <Card className="bg-white dark:bg-[#171717] border-gray-200 dark:border-gray-600">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (() => {
                    let base = allDocuments
                      .filter(d => d.type === (selectedFolderType as any))
                      .filter(d => {
                        const term = folderSearch.trim().toLowerCase()
                        if (!term) return true
                        const hay = `${d.title || ''} ${d.responsibleSector || ''} ${d.description || ''}`.toLowerCase()
                        return hay.includes(term)
                      })
                      .filter(d => {
                        if (!folderDateFrom && !folderDateTo) return true
                        const created = new Date(d.createdAt)
                        if (folderDateFrom) {
                          const from = new Date(folderDateFrom)
                          if (created < from) return false
                        }
                        if (folderDateTo) {
                          const to = new Date(folderDateTo)
                          to.setHours(23,59,59,999)
                          if (created > to) return false
                        }
                        return true
                      })
                      .filter(d => !folderAuthorFilter || (d.createdBy || '') === folderAuthorFilter)

                    // Aplicar ordenação
                    if (sortField && sortDirection) {
                      base = [...base].sort((a, b) => {
                        let aVal: any = a[sortField]
                        let bVal: any = b[sortField]
                        
                        if (sortField === 'nextReviewDate') {
                          aVal = a.nextReviewDate ? new Date(a.nextReviewDate).getTime() : 0
                          bVal = b.nextReviewDate ? new Date(b.nextReviewDate).getTime() : 0
                        } else if (sortField === 'directory') {
                          aVal = getDirectoryFromType(a.type)
                          bVal = getDirectoryFromType(b.type)
                        } else if (sortField === 'type') {
                          aVal = getTypeLabel(a.type)
                          bVal = getTypeLabel(b.type)
                        }
                        
                        if (aVal === null || aVal === undefined) aVal = ''
                        if (bVal === null || bVal === undefined) bVal = ''
                        
                        if (typeof aVal === 'string') {
                          aVal = aVal.toLowerCase()
                          bVal = bVal.toLowerCase()
                        }
                        
                        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
                        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
                        return 0
                      })
                    }

                    const total = base.length
                    const totalPagesFolder = Math.ceil(total / itemsPerPage) || 1
                    const start = (folderPage - 1) * itemsPerPage
                    const end = start + itemsPerPage
                    const pageDocs = base.slice(start, end)

                    if (pageDocs.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Nenhum documento nesta pasta
                        </div>
                      )
                    }
                    
                    return (
                      <div className="w-full">
                        <table className="w-full border-collapse" style={{ tableLayout: 'auto', width: '100%' }}>
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                              <th className="px-2 py-2 text-left text-xs font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" style={{ width: '9%' }} onClick={() => handleSort('code')}>
                                <div className="flex items-center gap-1">
                                  CÓDIGO
                                  {getSortIcon('code')}
                                </div>
                              </th>
                              <th className="px-2 py-2 text-left text-xs font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" style={{ width: '14%' }} onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-1">
                                  NOME
                                  {getSortIcon('title')}
                                </div>
                              </th>
                              <th className="px-2 py-2 text-left text-xs font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" style={{ width: '9%' }} onClick={() => handleSort('responsibleSector')}>
                                <div className="flex items-center gap-1">
                                  AREA
                                  {getSortIcon('responsibleSector')}
                                </div>
                              </th>
                              <th className="px-2 py-2 text-left text-xs font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" style={{ width: '11%' }} onClick={() => handleSort('description')}>
                                <div className="flex items-center gap-1">
                                  DESCRIÇÃO
                                  {getSortIcon('description')}
                                </div>
                              </th>
                              <th className="px-2 py-2 text-left text-xs font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" style={{ width: '10%' }} onClick={() => handleSort('type')}>
                                <div className="flex items-center gap-1">
                                  CLASSIFICAÇÃO
                                  {getSortIcon('type')}
                                </div>
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" style={{ width: '6%' }} onClick={() => handleSort('version')}>
                                <div className="flex items-center justify-center gap-1">
                                  VERSÃO
                                  {getSortIcon('version')}
                                </div>
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" style={{ width: '12%' }} onClick={() => handleSort('directory')}>
                                <div className="flex items-center gap-1">
                                  DIRETÓRIO
                                  {getSortIcon('directory')}
                                </div>
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" style={{ width: '9%' }} onClick={() => handleSort('nextReviewDate')}>
                                <div className="flex items-center justify-center gap-1">
                                  VENCIMENTO
                                  {getSortIcon('nextReviewDate')}
                                </div>
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" style={{ width: '8%' }} onClick={() => handleSort('status')}>
                                <div className="flex items-center justify-center gap-1">
                                  STATUS
                                  {getSortIcon('status')}
                                </div>
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-medium" style={{ width: '12%' }}>
                                AÇÕES
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageDocs.map((document) => {
                              const expirationStatus = getExpirationStatus(document.nextReviewDate || null)
                              return (
                                <ContextMenu key={document.id}>
                                  <ContextMenuTrigger asChild>
                                    <tr
                                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b ${
                                        selectedDocument?.id === document.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                                      }`}
                                      onClick={() => setSelectedDocument(document)}
                                    >
                                      <td className="font-mono text-xs px-2 py-2 truncate" title={document.code || '—'}>
                                        {document.code || '—'}
                                      </td>
                                      <td className="text-xs px-2 py-2 truncate" title={document.title || '—'}>
                                        {document.title || '—'}
                                      </td>
                                      <td className="text-xs px-2 py-2 truncate" title={document.responsibleSector || '—'}>
                                        {document.responsibleSector || '—'}
                                      </td>
                                      <td className="text-xs px-2 py-2" title={document.description || '—'}>
                                        {truncateText(document.description, 40)}
                                      </td>
                                      <td className="text-xs px-2 py-2 truncate" title={getTypeLabel(document.type)}>
                                        {getTypeLabel(document.type)}
                                      </td>
                                      <td className="text-xs px-4 py-2 text-center">{document.version || '1.0'}</td>
                                      <td className="text-xs px-4 py-2 truncate" title={getDirectoryFromType(document.type)}>
                                        {getDirectoryFromType(document.type)}
                                      </td>
                                      <td className="px-2 py-2 text-center">
                                        <div className={`px-2 py-1 rounded ${expirationStatus.bgColor} text-center font-medium text-xs whitespace-nowrap inline-block`}>
                                          {document.nextReviewDate ? formatDate(document.nextReviewDate) : '—'}
                                        </div>
                                      </td>
                                      <td className="px-2 py-2 text-center">
                                        <div className="flex justify-center">
                                          {getStatusBadge(document.status)}
                                        </div>
                                      </td>
                                      <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
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
                                          {onDownloadDocument && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0"
                                              onClick={() => onDownloadDocument(document)}
                                              title="Download"
                                            >
                                              <Download className="h-3.5 w-3.5" />
                                            </Button>
                                          )}
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
                        
                        {/* Paginação */}
                        {totalPagesFolder > 1 && (
                          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {`Mostrando ${Math.min(total, start + 1)} a ${Math.min(end, total)} de ${total} documentos`}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFolderPage(prev => Math.max(1, prev - 1))}
                                disabled={folderPage === 1}
                              >
                                Anterior
                              </Button>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Página {folderPage} de {totalPagesFolder}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFolderPage(prev => Math.min(totalPagesFolder, prev + 1))}
                                disabled={folderPage === totalPagesFolder}
                              >
                                Próxima
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

