'use client'

import { useState, useEffect } from 'react'
import { Document } from '@/types/document'
import { statusOptions, documentTypes } from '@/constants/document'
import { Search, Plus, Eye, Edit, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CommonHeader } from './common-header'
import { getFileIcon, getStatusBadge, getTypeLabel, formatFileSize } from '../utils/document-utils'
import { exportDocuments } from '../utils/export-utils'

interface DocumentsSectionProps {
  allDocuments: Document[]
  loading: boolean
  sectors: string[]
  selectedDocument: Document | null
  setSelectedDocument: (document: Document | null) => void
  onCreateDocument: () => void
  onEditDocument: (document: Document) => void
  onViewDocument: (document: Document) => void
  onDownloadDocument: (document: Document) => void
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | null
  logout: () => void
}

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
  user,
  logout
}: DocumentsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Estados locais de filtros para a seção "documents" (isolados de outras seções)
  const [documentsSearchTerm, setDocumentsSearchTerm] = useState('')
  const [documentsStatusFilter, setDocumentsStatusFilter] = useState('all')
  const [documentsTypeFilter, setDocumentsTypeFilter] = useState('all')
  const [documentsSectorFilter, setDocumentsSectorFilter] = useState('all')
  const [authorFilter, setAuthorFilter] = useState('')
  
  useEffect(() => { setCurrentPage(1) }, [authorFilter])
  
  const authorOptions = Array.from(new Set(allDocuments.map(d => d.createdBy).filter(Boolean))) as string[]

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

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <CommonHeader
        title="Documentos"
        description="Procure, filtre e gerencie documentos"
        user={user}
        logout={logout}
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar documentos..."
            value={documentsSearchTerm}
            onChange={(e) => setDocumentsSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
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
          <Button className="bg-black text-white hover:bg-black/90" onClick={handleExportPDF}>Exportar</Button>
        </div>
        <div className="flex gap-2">
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
        </div>
        <div className="flex items-center sm:ml-auto">
          <Button onClick={onCreateDocument} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Novo</span>
          </Button>
        </div>
      </div>

      {/* Documents List */}
      <Card className="bg-white dark:bg-[#171717] border-gray-200 dark:border-gray-600">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="divide-y">
              {(() => {
                // Aplicar filtros locais da seção documents
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
                const docsByAuthor = authorFilter ? filteredDocs.filter(d => (d.createdBy || '') === authorFilter) : filteredDocs
                const totalDocsFiltered = docsByAuthor.length
                const totalPagesDocs = Math.ceil(totalDocsFiltered / itemsPerPage)
                const startIndexDocs = (currentPage - 1) * itemsPerPage
                const endIndexDocs = startIndexDocs + itemsPerPage
                const pageDocs = docsByAuthor.slice(startIndexDocs, endIndexDocs)

                if (pageDocs.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Nenhum documento encontrado
                    </div>
                  )
                }
                return (
                  <>
                    {pageDocs.map((document) => (
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
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {document.responsibleSector} • {getTypeLabel(document.type)} • Autor: {document.createdBy || '—'}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDownloadDocument(document)
                              }}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Pagination */}
                    {totalPagesDocs > 1 && (
                      <div className="flex items-center justify-between mt-4 px-4 py-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {`Mostrando ${Math.min(totalDocsFiltered, startIndexDocs + 1)} a ${Math.min(endIndexDocs, totalDocsFiltered)} de ${totalDocsFiltered} documentos`}
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
                            Página {currentPage} de {totalPagesDocs}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPagesDocs, prev + 1))}
                            disabled={currentPage === totalPagesDocs}
                          >
                            Próxima
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

