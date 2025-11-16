'use client'

import { useState} from 'react'
import { Document } from '@/types/document'
import { useAuth } from '@/hooks/use-auth'
import { DocumentsSection } from './components/documents-section'
import { FoldersSection } from './components/folders-section'
import { AnalyticsSection } from './components/analytics-section'
import { getInitials } from '@/lib/utils'
import { 
  FileText,
  Eye,
  Edit,
  LogOut,
  Settings,
  UserCircle,
  Calendar,
  History,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent} from '@/components/ui/card'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { getStatusBadge, getTypeLabel, formatFileSize, getExpirationStatus, formatDate, getDirectoryFromType, getDirectoryFromFolderPath, truncateText } from './utils/document-utils'
import { calculateFolderData } from './utils/folder-utils'

interface ProcedimentosMainContentProps {
  activeSection: string
  setActiveSection: (section: string) => void
  allDocuments: Document[]
  documents: Document[]
  loading: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  typeFilter: string
  setTypeFilter: (type: string) => void
  sectorFilter: string
  setSectorFilter: (sector: string) => void
  sectors: string[]
  onCreateDocument: (initialFolderPath?: string) => void
  onEditDocument: (document: Document) => void
  onDeleteDocument: (document: Document) => void
  onViewDocument: (document: Document) => void
  onViewHistory: (document: Document) => void
  onDownloadDocument: (document: Document) => void
  onRescheduleDocument?: (document: Document) => void
  selectedDocument: Document | null
  setSelectedDocument: (document: Document | null) => void
  onRefreshDocuments?: () => void
}

export function ProcedimentosMainContent({
  activeSection,
  setActiveSection,
  allDocuments,
  documents,
  loading,
  sectors,
  onCreateDocument,
  onEditDocument,
  onDeleteDocument,
  onViewDocument,
  onViewHistory,
  onDownloadDocument,
  onRescheduleDocument,
  selectedDocument,
  setSelectedDocument,
  onRefreshDocuments
}: ProcedimentosMainContentProps) {
  const { user, logout } = useAuth()
  const [currentPage] = useState(1)
  const itemsPerPage = 10
  
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  // Calculate real storage data from documents
  const calculateStorageData = () => {
    const activeDocs = documents.filter(doc => doc.status === 'active')
    const pendingDocs = documents.filter(doc => doc.status === 'pending')
    const inactiveDocs = documents.filter(doc => doc.status === 'inactive')
    
    // Se não há fileSize, estimar baseado no tipo de arquivo
    const estimateFileSize = (doc: any) => {
      if (doc.fileSize && doc.fileSize > 0) return doc.fileSize
      
      // Estimativa baseada no tipo de arquivo
      const fileType = doc.fileType?.toLowerCase() || doc.title?.split('.').pop()?.toLowerCase() || ''
      switch (fileType) {
        case 'pdf': return 2 * 1024 * 1024 // 2MB
        case 'doc':
        case 'docx': return 1.5 * 1024 * 1024 // 1.5MB
        case 'xls':
        case 'xlsx': return 1 * 1024 * 1024 // 1MB
        case 'ppt':
        case 'pptx': return 3 * 1024 * 1024 // 3MB
        case 'jpg':
        case 'jpeg':
        case 'png': return 2.5 * 1024 * 1024 // 2.5MB
        default: return 1 * 1024 * 1024 // 1MB padrão
      }
    }
    
    const activeSize = activeDocs.reduce((sum, doc) => sum + estimateFileSize(doc), 0)
    const pendingSize = pendingDocs.reduce((sum, doc) => sum + estimateFileSize(doc), 0)
    const inactiveSize = inactiveDocs.reduce((sum, doc) => sum + estimateFileSize(doc), 0)
    
    const formatSize = (bytes: number) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }
    
    return [
      {
        name: 'Documentos Ativos',
        email: `${activeDocs.length} documentos`,
        used: formatSize(activeSize),
        color: 'bg-red-500'
      },
      {
        name: 'Documentos Pendentes',
        email: `${pendingDocs.length} documentos`,
        used: formatSize(pendingSize),
        color: 'bg-yellow-500'
      },
      {
        name: 'Documentos Inativos',
        email: `${inactiveDocs.length} documentos`,
        used: formatSize(inactiveSize),
        color: 'bg-blue-500'
      }
    ]
  }

  const storageData = calculateStorageData()

  const folders = calculateFolderData(allDocuments)

  // Renderiza o layout baseado na seção ativa
  if (activeSection === 'documents') {
    return (
      <DocumentsSection
        allDocuments={allDocuments}
        loading={loading}
        sectors={sectors}
        selectedDocument={selectedDocument}
        setSelectedDocument={setSelectedDocument}
        onCreateDocument={onCreateDocument}
        onEditDocument={onEditDocument}
        onViewDocument={onViewDocument}
        onDownloadDocument={onDownloadDocument}
        onRescheduleDocument={onRescheduleDocument}
        onDeleteDocument={onDeleteDocument}
        onViewHistory={onViewHistory}
        user={user}
        logout={logout}
      />
    )
  }

  if (activeSection === 'folders') {
    return (
      <FoldersSection
        allDocuments={allDocuments}
        loading={loading}
        selectedDocument={selectedDocument}
        setSelectedDocument={setSelectedDocument}
        onCreateDocument={onCreateDocument}
        onEditDocument={onEditDocument}
        onViewDocument={onViewDocument}
        onDownloadDocument={onDownloadDocument}
        onRescheduleDocument={onRescheduleDocument}
        onDeleteDocument={onDeleteDocument}
        onViewHistory={onViewHistory}
        onRefreshDocuments={onRefreshDocuments}
        user={user}
        logout={logout}
      />
    )
  }

  if (activeSection === 'analytics') {
    return (
      <AnalyticsSection
        allDocuments={allDocuments}
        setActiveSection={setActiveSection}
        user={user}
        logout={logout}
      />
    )
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie seus documentos e procedimentos</p>
        </div>
<h1>        </h1>        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ThemeToggle />
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 flex items-center space-x-2 rounded-full p-1">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm border-2 border-primary/30 overflow-hidden">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              {user?.role === 'ADMIN' ? (
                <>
                  <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Painel administrativo</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Meu perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => {
                logout()
                window.location.href = '/'
              }}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Storage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {storageData.map((storage, index) => (
          <Card key={index} className="p-6 bg-white dark:bg-[#171717] border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${storage.color === 'bg-red-500' ? 'bg-black/10 dark:bg-white/10' : storage.color === 'bg-yellow-500' ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-zinc-100 dark:bg-zinc-900/40'} rounded-lg flex items-center justify-center`}>
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{storage.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{storage.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Usado:</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{storage.used}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Folders Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Pastas</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {folders.slice(0, 5).map((folder, index) => {
            const Icon = folder.icon
            return (
              <Card
                key={index}
                onClick={() => { setActiveSection('folders') }}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-[#171717] border-gray-200 dark:border-gray-600"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{folder.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{folder.count} Arquivos</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Documents Preview Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Documentos</h2>
          <Button 
            variant="outline" 
            onClick={() => setActiveSection('documents')}
            className="flex items-center gap-2"
          >
            Ver todos
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        <Card className="bg-white dark:bg-[#171717] border-gray-200 dark:border-gray-600">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Nenhum documento encontrado
                  </div>
                ) : (
              <div className="w-full">
                <table className="w-full border-collapse" style={{ tableLayout: 'auto', width: '100%' }}>
                  <thead>
                    <tr className="border-b border-border/20 bg-slate-100 dark:bg-slate-900/60">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300" style={{ width: '9%' }}>
                        CÓDIGO
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300" style={{ width: '14%' }}>
                        NOME
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300" style={{ width: '9%' }}>
                        AREA
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300" style={{ width: '11%' }}>
                        DESCRIÇÃO
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300" style={{ width: '10%' }}>
                        CLASSIFICAÇÃO
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300" style={{ width: '6%' }}>
                        VERSÃO
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300" style={{ width: '12%' }}>
                        DIRETÓRIO
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300" style={{ width: '9%' }}>
                        VENCIMENTO
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300" style={{ width: '8%' }}>
                        STATUS
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300" style={{ width: '12%' }}>
                        AÇÕES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.slice(0, 5).map((document) => {
                      const expirationStatus = getExpirationStatus(document.nextReviewDate || null)
                      return (
                        <ContextMenu key={document.id}>
                          <ContextMenuTrigger asChild>
                            <tr
                              className={`cursor-pointer border-b border-border/20 last:border-b-0 transition-colors hover:bg-primary/10 dark:hover:bg-primary/10 ${
                                selectedDocument?.id === document.id ? 'bg-primary/10 dark:bg-primary/20' : ''
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
      </div>
    </div>
  )
}
