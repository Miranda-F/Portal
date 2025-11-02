'use client'

import { useState, useEffect } from 'react'
import { Document } from '@/types/document'
import { Search, Eye, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CommonHeader } from './common-header'
import { getFileIcon, getStatusBadge, getTypeLabel, formatFileSize } from '../utils/document-utils'
import { calculateFolderData } from '../utils/folder-utils'
import { exportDocuments } from '../utils/export-utils'

interface FoldersSectionProps {
  allDocuments: Document[]
  loading: boolean
  selectedDocument: Document | null
  setSelectedDocument: (document: Document | null) => void
  onEditDocument: (document: Document) => void
  onViewDocument: (document: Document) => void
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | null
  logout: () => void
}

export function FoldersSection({
  allDocuments,
  loading,
  selectedDocument,
  setSelectedDocument,
  onEditDocument,
  onViewDocument,
  user,
  logout
}: FoldersSectionProps) {
  const itemsPerPage = 10
  
  // Estados locais de filtros para a seção "folders"
  const [selectedFolderType, setSelectedFolderType] = useState<string | null>(null)
  const [folderSearch, setFolderSearch] = useState('')
  const [folderDateFrom, setFolderDateFrom] = useState<string>('')
  const [folderDateTo, setFolderDateTo] = useState<string>('')
  const [folderAuthorFilter, setFolderAuthorFilter] = useState('')
  const [folderPage, setFolderPage] = useState(1)
  
  useEffect(() => { setFolderPage(1) }, [selectedFolderType, folderSearch, folderDateFrom, folderDateTo, folderAuthorFilter])
  
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
              ) : (
                <div className="divide-y">
                  {(() => {
                    const base = allDocuments
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
                        ))}
                        {/* Paginação pasta */}
                        {totalPagesFolder > 1 && (
                          <div className="flex items-center justify-between mt-4 px-4 py-2">
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
                      </>
                    )
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

