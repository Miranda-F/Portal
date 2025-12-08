'use client'

import React, { useState, useEffect } from 'react'
import { Document } from '@/types/document'
import { Search, Plus, Eye, Edit, Download, Calendar, History, Trash2, FileText, ArrowUpDown, ArrowUp, ArrowDown, Move, Ban, Folder, ChevronLeft, Upload, Code, List, Settings, Copy, Info, Share2, Paperclip, Link, QrCode, MoreVertical, File } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FolderCreateModal } from './folder-create-modal'
import { FolderRenameModal } from './folder-rename-modal'
import { FolderDeleteModal } from './folder-delete-modal'
import { FoldersTree } from './folders-tree'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CommonHeader } from './common-header'

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  getFileIcon,
  getStatusBadge,
  getTypeLabel,
  formatFileSize,
  getDirectoryFromType,
  getDirectoryFromFolderPath,
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
import { getDocumentsInFolder, getDocumentsByType } from '../utils/folder-structure'
import { useFolderActions } from '@/hooks/folders/use-folder-actions'
import { useDragDrop } from '@/hooks/folders/use-drag-drop'
import { FoldersDragIndicator } from './folders-drag-indicator'

interface FoldersSectionProps {
  allDocuments: Document[]
  loading: boolean
  selectedDocument: Document | null
  setSelectedDocument: (document: Document | null) => void
  onCreateDocument: (initialFolderPath?: string) => void
  onEditDocument: (document: Document) => void
  onViewDocument: (document: Document) => void
  onDownloadDocument?: (document: Document) => void
  onRescheduleDocument?: (document: Document) => void
  onDeleteDocument?: (document: Document) => void
  onViewHistory?: (document: Document) => void
  onRefreshDocuments?: () => void
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | null
  logout: () => void

  // Props recebidas do pai
  selectedFolderPath: string | null
  selectedFolderType: string | null
  setSelectedFolderPath: (path: string | null) => void
  setSelectedFolderType: (type: string | null) => void
  emptyCreatedFolders: Set<string>
  folderActions: any
  dragDrop: any
  handleSelectFolder: (folderPath: string | null, type?: string) => void
  onManagePermissions?: (folderPath: string, folderName: string) => void
}

type SortField = 'code' | 'title' | 'responsibleSector' | 'description' | 'type' | 'version' | 'directory' | 'nextReviewDate' | 'status'
type SortDirection = 'asc' | 'desc' | null

export function FoldersSection({
  allDocuments,
  loading,
  selectedDocument,
  setSelectedDocument,
  onCreateDocument,
  onEditDocument,
  onViewDocument,
  onDownloadDocument,
  onRescheduleDocument,
  onDeleteDocument,
  onViewHistory,
  onRefreshDocuments,
  user,
  logout,
  selectedFolderPath,
  selectedFolderType,
  setSelectedFolderPath,
  setSelectedFolderType,
  emptyCreatedFolders,
  folderActions,
  dragDrop,
  handleSelectFolder,
  onManagePermissions
}: FoldersSectionProps) {
  const itemsPerPage = 50

  // Função auxiliar para obter o folderPath padrão de um tipo
  const getDefaultFolderPathForType = (type: string): string | undefined => {
    const typeToDefaultFolderPath: Record<string, string> = {
      'form': 'Root/Gestão da Qualidade/Formulários',
      'instruction': 'Root/Gestão da Qualidade/Instrução Técnica',
      'procedure': 'Root/Gestão da Qualidade/Procedimentos',
      'policy': 'Root/Políticas',
      'manual': 'Root/Manuais',
      'record': 'Root/Registros',
    }
    return typeToDefaultFolderPath[type]
  }

  const [folderSearch, setFolderSearch] = useState('')
  const [folderDateFrom, setFolderDateFrom] = useState<string>('')
  const [folderDateTo, setFolderDateTo] = useState<string>('')
  const [folderAuthorFilter, setFolderAuthorFilter] = useState('')
  const [folderPage, setFolderPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  useEffect(() => { setFolderPage(1) }, [selectedFolderPath, selectedFolderType, folderSearch, folderDateFrom, folderDateTo, folderAuthorFilter])

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
  const { toast } = useToast()




  const handleExportFolders = async () => {
    try {
      if (!selectedFolderPath && !selectedFolderType) {
        alert('Selecione uma pasta primeiro.')
        return
      }

      // Aplicar todos os filtros da seção folders
      let filteredDocs = allDocuments

      // Priorizar tipo de documento sobre folderPath
      if (selectedFolderType) {
        filteredDocs = getDocumentsByType(filteredDocs, selectedFolderType)
      } else if (selectedFolderPath) {
        filteredDocs = getDocumentsInFolder(filteredDocs, selectedFolderPath)
      }

      filteredDocs = filteredDocs
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
            to.setHours(23, 59, 59, 999)
            if (created > to) return false
          }
          return true
        })
        .filter(d => !folderAuthorFilter || (d.createdBy || '') === folderAuthorFilter)

      const folderName = selectedFolderPath
        ? selectedFolderPath.split('/').pop()?.replace(/\s+/g, '_').toLowerCase() || 'documentos'
        : getTypeLabel(selectedFolderType as any).replace(/\s+/g, '_').toLowerCase()
      await exportDocuments(filteredDocs, `documentos_${folderName}`)
    } catch (e) {
      console.error('Erro ao exportar arquivos', e)
      alert('Erro ao exportar arquivos. Tente novamente.')
    }
  }

  // Obter documentos filtrados por pasta
  const getFilteredDocuments = () => {
    let base: Document[] = []

    // Priorizar tipo de documento sobre folderPath
    // Se tem tipo, filtrar por tipo (todos os documentos desse tipo, independente do folderPath)
    if (selectedFolderType) {
      base = getDocumentsByType(allDocuments, selectedFolderType)
    } else if (selectedFolderPath) {
      // Se tem apenas folderPath (sem type), filtrar por caminho
      base = getDocumentsInFolder(allDocuments, selectedFolderPath)
    } else {
      return []
    }

    // Aplicar outros filtros
    base = base
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
          to.setHours(23, 59, 59, 999)
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
          aVal = getDirectoryFromFolderPath(a)
          bVal = getDirectoryFromFolderPath(b)
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

    return base
  }

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Sidebar removida - agora está no menu principal */}

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-shrink-0 p-6 pb-0">
          {/* Header Section */}
          <div className="flex-shrink-0 px-6 pt-6 pb-2">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {selectedFolderType ? getTypeLabel(selectedFolderType as any) : (selectedFolderPath ? selectedFolderPath.split('/').pop() : 'Pastas')}
              </h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <Breadcrumb>
                  <BreadcrumbList>
                    {(() => {
                      const path = selectedFolderPath || (selectedFolderType ? getDefaultFolderPathForType(selectedFolderType) : '')
                      if (!path) return <BreadcrumbItem><BreadcrumbPage>Root</BreadcrumbPage></BreadcrumbItem>

                      const pathParts = path.split('/').filter(Boolean)
                      return pathParts.map((part, index) => {
                        const isLast = index === pathParts.length - 1
                        const pathToHere = pathParts.slice(0, index + 1).join('/')

                        return (
                          <React.Fragment key={pathToHere}>
                            <BreadcrumbItem>
                              {isLast ? (
                                <BreadcrumbPage className="font-medium text-gray-900 dark:text-gray-100">{part}</BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink
                                  onClick={() => {
                                    if (pathToHere.startsWith('Root/')) {
                                      setSelectedFolderPath(pathToHere)
                                      setSelectedFolderType(null)
                                    }
                                  }}
                                  className="cursor-pointer hover:text-blue-600 transition-colors"
                                >
                                  {part}
                                </BreadcrumbLink>
                              )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                          </React.Fragment>
                        )
                      })
                    })()}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de documentos filtrada pela pasta selecionada */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {(selectedFolderPath || selectedFolderType) ? (
            <div className="space-y-3">
              {/* Breadcrumb */}
              {/* Breadcrumb removed - moved to header */}

              {/* Toolbar */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      className="bg-[#00A3E0] hover:bg-[#008bc0] text-white gap-2"
                      onClick={() => {
                        setSelectedFolderPath(null)
                        setSelectedFolderType(null)
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-r-none border-r-0 gap-2 font-medium"
                        onClick={() => {
                          const folderPath = selectedFolderPath || (selectedFolderType ? getDefaultFolderPathForType(selectedFolderType) : undefined)
                          onCreateDocument(folderPath || undefined)
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Novo
                      </Button>
                      <Button
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-l-none px-2"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-2 font-medium">
                      <Upload className="h-4 w-4" />
                      Carregar
                    </Button>



                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-2 font-medium">
                      <Code className="h-4 w-4" />
                      Código
                    </Button>

                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-2 font-medium">
                      <Search className="h-4 w-4" />
                      Pesquisar
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="default" className="bg-[#00A3E0] hover:bg-[#008bc0] text-white gap-2">
                      <List className="h-4 w-4" />
                      Lista
                      <ArrowDown className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Status Filter Bar */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span>Criação</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    <span>Público</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span>Revisão</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span>Aprovação</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Rejeitado</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span>Vencido</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span>Vencendo em 30 dias</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-red-500 ml-auto font-medium">
                    <span className="text-lg leading-none">×</span>
                    <span>Remover filtros</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 dark:text-gray-100">100</span>
                    <span>resultados por página</span>
                    <ArrowDown className="h-3 w-3 ml-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Pesquisar</span>
                    <Input
                      className="w-48 h-8 border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <Card className="bg-white dark:bg-[#171717] border-gray-200 dark:border-gray-600">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (() => {
                    const base = getFilteredDocuments()
                    const total = base.length
                    const totalPagesFolder = Math.ceil(total / itemsPerPage) || 1
                    const start = (folderPage - 1) * itemsPerPage
                    const end = start + itemsPerPage
                    const pageDocs = base.slice(start, end)

                    if (pageDocs.length === 0) {
                      return (
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400 cursor-context-menu">
                              Nenhum documento nesta pasta
                            </div>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-48">
                            <ContextMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                // Passar a pasta selecionada para pré-selecionar no formulário
                                const folderPath = selectedFolderPath || (selectedFolderType ? getDefaultFolderPathForType(selectedFolderType) : undefined)
                                onCreateDocument(folderPath || undefined)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Novo Documento
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      )
                    }

                    return (
                      <div className="w-full">
                        <table className="w-full border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50" style={{ width: '35%' }} onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-1">
                                  NOME
                                  {getSortIcon('title')}
                                </div>
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50" style={{ width: '12%' }} onClick={() => handleSort('nextReviewDate')}>
                                <div className="flex items-center gap-1">
                                  DATA
                                  {getSortIcon('nextReviewDate')}
                                </div>
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50" style={{ width: '8%' }} onClick={() => handleSort('type')}>
                                <div className="flex items-center gap-1">
                                  TIPO
                                  {getSortIcon('type')}
                                </div>
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ width: '10%' }}>
                                TAMANHO
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50" style={{ width: '8%' }} onClick={() => handleSort('version')}>
                                <div className="flex items-center gap-1">
                                  VERSÃO
                                  {getSortIcon('version')}
                                </div>
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ width: '12%' }}>
                                AUTOR
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50" style={{ width: '10%' }} onClick={() => handleSort('status')}>
                                <div className="flex items-center gap-1">
                                  STATUS
                                  {getSortIcon('status')}
                                </div>
                              </th>
                              <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ width: '5%' }}>

                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageDocs.map((document) => {
                              const expirationStatus = getExpirationStatus(document.nextReviewDate || null)
                              const isSelected = selectedDocument?.id === document.id

                              return (
                                <ContextMenu key={document.id}>
                                  <ContextMenuTrigger asChild>
                                    <tr
                                      className={`cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                      onClick={(e) => {
                                        // Selecionar apenas com clique esquerdo
                                        if (e.button === 0) {
                                          setSelectedDocument(document)
                                        }
                                      }}
                                    >
                                      <td className="px-3 py-3">
                                        <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-lg ${(document.fileType || '').toLowerCase().includes('doc') ? 'bg-blue-100 text-blue-600' :
                                            (document.fileType || '').toLowerCase().includes('pdf') ? 'bg-red-100 text-red-600' :
                                              (document.fileType || '').toLowerCase().includes('xls') ? 'bg-green-100 text-green-600' :
                                                (document.fileType || '').toLowerCase().includes('ppt') ? 'bg-orange-100 text-orange-600' :
                                                  'bg-gray-100 text-gray-600'
                                            }`}>
                                            <FileText className="h-5 w-5" />
                                          </div>
                                          <span className="text-sm font-medium text-gray-900 truncate" title={document.title || '—'}>
                                            {document.title || '—'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-3 text-sm text-gray-600">
                                        {document.updatedAt ? formatDate(document.updatedAt) : (document.createdAt ? formatDate(document.createdAt) : '—')}
                                      </td>
                                      <td className="px-3 py-3 text-sm text-gray-600 uppercase">
                                        {document.fileType || document.type || 'DOC'}
                                      </td>
                                      <td className="px-3 py-3 text-sm text-gray-600">
                                        {formatFileSize(document.fileSize || 0)}
                                      </td>
                                      <td className="px-3 py-3 text-sm text-gray-600">
                                        {document.version || '1.0'}
                                      </td>
                                      <td className="px-3 py-3 text-sm text-gray-600 truncate" title={document.createdBy || 'Sistema'}>
                                        {document.createdBy || 'Jorge Jardim Jr.'}
                                      </td>
                                      <td className="px-3 py-3">
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium text-white w-full justify-center ${document.status === 'active' ? 'bg-green-600' :
                                          document.status === 'pending' ? 'bg-cyan-500' :
                                            document.status === 'inactive' ? 'bg-gray-400' :
                                              document.status === 'expired' ? 'bg-red-500' :
                                                document.status === 'archived' ? 'bg-gray-500' :
                                                  'bg-gray-400'
                                          }`}>
                                          {document.status === 'active' ? 'Público' :
                                            document.status === 'pending' ? 'Revisão' :
                                              document.status === 'inactive' ? 'Criação' :
                                                document.status === 'expired' ? 'Vencido' :
                                                  document.status === 'archived' ? 'Arquivado' :
                                                    'Rascunho'}
                                        </div>
                                      </td>
                                      <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                                        >
                                          <Settings className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  </ContextMenuTrigger>
                                  <ContextMenuContent className="w-56">
                                    <ContextMenuItem onClick={(e) => { e.stopPropagation(); onDownloadDocument && onDownloadDocument(document) }}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Baixar
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={(e) => { e.stopPropagation() }}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Cópia controlada
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={(e) => { e.stopPropagation(); onEditDocument(document) }}>
                                      <Settings className="h-4 w-4 mr-2" />
                                      Propriedades
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onClick={(e) => { e.stopPropagation(); onDeleteDocument && onDeleteDocument(document) }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remover
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem onClick={(e) => { e.stopPropagation(); onViewDocument(document) }}>
                                      <Info className="h-4 w-4 mr-2" />
                                      Detalhes
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={(e) => { e.stopPropagation() }}>
                                      <Share2 className="h-4 w-4 mr-2" />
                                      Difusão
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={(e) => { e.stopPropagation() }}>
                                      <Paperclip className="h-4 w-4 mr-2" />
                                      Anexar arquivos
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={(e) => { e.stopPropagation() }}>
                                      <Link className="h-4 w-4 mr-2" />
                                      Relacionados
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={(e) => { e.stopPropagation() }}>
                                      <QrCode className="h-4 w-4 mr-2" />
                                      QR Code
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                </ContextMenu>
                              )
                            })}
                          </tbody>
                        </table>

                        {/* Paginação */}
                        {totalPagesFolder > 1 && (
                          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                              {`Mostrando ${Math.min(total, start + 1)} a ${Math.min(end, total)} de ${total} documentos`}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFolderPage(prev => Math.max(1, prev - 1))
                                }}
                                disabled={folderPage === 1}
                              >
                                Anterior
                              </Button>
                              <span className="text-sm text-gray-700">
                                Página {folderPage} de {totalPagesFolder}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFolderPage(prev => Math.min(totalPagesFolder, prev + 1))
                                }}
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
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar de pastas */}
              <div className="w-80 border-r border-border/40 bg-white dark:bg-slate-900">
                <div className="p-4 border-b border-border/40">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Árvore de Documentos</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Clique em uma pasta para visualizar os documentos ou clique com o botão direito para gerenciar pastas
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => folderActions.handleCreateFolder('Root')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Pasta Pai
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <FoldersTree
                    allDocuments={allDocuments}
                    selectedFolderPath={selectedFolderPath}
                    selectedFolderType={selectedFolderType}
                    onSelectFolder={handleSelectFolder}
                    onCreateFolder={folderActions.handleCreateFolder}
                    onRenameFolder={folderActions.handleRenameFolder}
                    onDeleteFolder={folderActions.handleDeleteFolder}
                    onMoveFolder={dragDrop.handleMoveFolder}
                    emptyCreatedFolders={emptyCreatedFolders}
                    draggingItem={dragDrop.draggingItem}
                    dragOverFolder={dragDrop.dragOverFolder}
                    setDragOverFolder={dragDrop.setDragOverFolder}
                    onDropOnFolder={dragDrop.handleDropOnFolder}
                    onManagePermissions={onManagePermissions}
                  />
                </div>
              </div>

              {/* Conteúdo principal */}
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center space-y-4">
                  <Folder className="w-16 h-16 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Gerenciamento de Documentos
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                    Selecione uma pasta na árvore à esquerda para visualizar e gerenciar os documentos. 
                    Você pode criar novas pastas, renomear, mover ou excluir pastas existentes.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <Button
                      onClick={() => onCreateDocument()}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Novo Documento</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => folderActions.handleCreateFolder('Root')}
                      className="flex items-center space-x-2"
                    >
                      <Folder className="h-4 w-4" />
                      <span>Nova Pasta</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modais de gerenciamento de pastas */}
      <FolderCreateModal
        isOpen={folderActions.isCreateFolderModalOpen}
        onClose={() => {
          folderActions.setIsCreateFolderModalOpen(false)
          folderActions.setFolderActionData({})
        }}
        parentPath={folderActions.folderActionData.parentPath || ''}
        onConfirm={folderActions.handleConfirmCreateFolder}
        isCreating={folderActions.isFolderActionLoading}
      />

      <FolderRenameModal
        isOpen={folderActions.isRenameFolderModalOpen}
        onClose={() => {
          folderActions.setIsRenameFolderModalOpen(false)
          folderActions.setFolderActionData({})
        }}
        currentPath={folderActions.folderActionData.folderPath || ''}
        currentName={folderActions.folderActionData.folderName || ''}
        onConfirm={folderActions.handleConfirmRenameFolder}
        isRenaming={folderActions.isFolderActionLoading}
      />

      <FolderDeleteModal
        isOpen={folderActions.isDeleteFolderModalOpen}
        onClose={() => {
          folderActions.setIsDeleteFolderModalOpen(false)
          folderActions.setFolderActionData({})
        }}
        folderPath={folderActions.folderActionData.folderPath || ''}
        folderName={folderActions.folderActionData.folderName || ''}
        documentCount={folderActions.folderActionData.documentCount || 0}
        onConfirm={folderActions.handleConfirmDeleteFolder}
        isDeleting={folderActions.isFolderActionLoading}
      />

      <FoldersDragIndicator
        draggingItem={dragDrop.draggingItem}
        dragIconPosition={dragDrop.dragIconPosition}
        onCancel={() => {
          dragDrop.setDraggingItem(null)
          dragDrop.setDragOverFolder(null)
          dragDrop.setDragIconPosition(null)
        }}
      />
    </div>
  )
}

