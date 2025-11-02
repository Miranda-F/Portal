'use client'

import { useState, useEffect } from 'react'
import { Document } from '@/types/document'
import { statusOptions, documentTypes } from '@/constants/document'
import { useAuth } from '@/hooks/use-auth'
import { DocumentsSection } from './components/documents-section'
import { FoldersSection } from './components/folders-section'
import { AnalyticsSection } from './components/analytics-section'
import { getInitials } from '@/lib/utils'
import { 
  Search, 
  Plus,
  FileText,
  Eye,
  Edit,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  LogOut,
  Settings,
  UserCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { getFileIcon, getStatusBadge, getTypeLabel, formatFileSize } from './utils/document-utils'
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
  onCreateDocument: () => void
  onEditDocument: (document: Document) => void
  onDeleteDocument: (document: Document) => void
  onViewDocument: (document: Document) => void
  onViewHistory: (document: Document) => void
  onDownloadDocument: (document: Document) => void
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
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  sectorFilter,
  setSectorFilter,
  sectors,
  onCreateDocument,
  onEditDocument,
  onDeleteDocument,
  onViewDocument,
  onViewHistory,
  onDownloadDocument,
  selectedDocument,
  setSelectedDocument,
  onRefreshDocuments
}: ProcedimentosMainContentProps) {
  const { user, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  

  const totalPages = Math.ceil(documents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDocuments = documents.slice(startIndex, endIndex)

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
        onEditDocument={onEditDocument}
        onViewDocument={onViewDocument}
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
        <div className="flex items-center space-x-4">
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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
          
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
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
          
          <Button onClick={onCreateDocument} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Novo</span>
          </Button>
        </div>
      </div>

      {/* Recently Added Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Documentos Recentes</h2>
        <Card className="bg-white dark:bg-[#171717] border-gray-200 dark:border-gray-600">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="divide-y">
                {currentDocuments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Nenhum documento encontrado
                  </div>
                ) : (
                  currentDocuments.map((document, index) => (
                    <div
                      key={document.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        selectedDocument?.id === document.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                      onClick={() => setSelectedDocument(document)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getFileIcon(document)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {document.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(document.status)}
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatFileSize(document.fileSize || 0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {document.responsibleSector} • {getTypeLabel(document.type)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(document.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onViewDocument(document)
                            }}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditDocument(document)
                            }}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {startIndex + 1} a {Math.min(endIndex, documents.length)} de {documents.length} documentos
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
    </div>
  )
}
