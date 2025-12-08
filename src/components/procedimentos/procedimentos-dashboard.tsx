'use client'

import { useState } from 'react'
import { Document } from '@/types/document'
import { QualidadeSidebar } from './qualidade-sidebar'
import { QualidadeMainContent } from './qualidade-main-content'
import { QualidadeFileDetails } from './qualidade-file-details'
import { useFolderActions } from '@/hooks/folders/use-folder-actions'
import { useDragDrop } from '@/hooks/folders/use-drag-drop'

interface QualidadeDashboardProps {
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
  onManagePermissions?: (folderPath: string, folderName: string) => void
}

export function QualidadeDashboard({
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
  onRescheduleDocument,
  selectedDocument,
  setSelectedDocument,
  onRefreshDocuments,
  onManagePermissions
}: QualidadeDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard')

  // Estados para pastas (lifted from FoldersSection)
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null)
  const [selectedFolderType, setSelectedFolderType] = useState<string | null>(null)
  const [emptyCreatedFolders, setEmptyCreatedFolders] = useState<Set<string>>(new Set())

  // Hook para ações de pastas
  const folderActions = useFolderActions(
    selectedFolderPath,
    setSelectedFolderPath,
    setSelectedFolderType,
    emptyCreatedFolders,
    setEmptyCreatedFolders
  )

  // Hook para drag and drop
  const dragDrop = useDragDrop(
    selectedFolderPath,
    setSelectedFolderPath,
    setSelectedFolderType,
    emptyCreatedFolders,
    setEmptyCreatedFolders,
    onRefreshDocuments
  )

  // Handler para seleção de pasta
  const handleSelectFolder = (folderPath: string | null, type?: string) => {
    if (type) {
      setSelectedFolderType(type)
      setSelectedFolderPath(null)
    } else if (folderPath) {
      setSelectedFolderPath(folderPath)
      setSelectedFolderType(null)
    } else {
      setSelectedFolderPath(null)
      setSelectedFolderType(null)
    }
  }

  return (
    <div className="flex h-screen bg-transparent">
      {/* Sidebar */}
      <QualidadeSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        <QualidadeMainContent
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          allDocuments={allDocuments}
          documents={documents}
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          sectorFilter={sectorFilter}
          setSectorFilter={setSectorFilter}
          sectors={sectors}
          onCreateDocument={onCreateDocument}
          onEditDocument={onEditDocument}
          onDeleteDocument={onDeleteDocument}
          onViewDocument={onViewDocument}
          onViewHistory={onViewHistory}
          onDownloadDocument={onDownloadDocument}
          onRescheduleDocument={onRescheduleDocument}
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
          onRefreshDocuments={onRefreshDocuments}
          // Props de pastas
          selectedFolderPath={selectedFolderPath}
          selectedFolderType={selectedFolderType}
          setSelectedFolderPath={setSelectedFolderPath}
          setSelectedFolderType={setSelectedFolderType}
          emptyCreatedFolders={emptyCreatedFolders}
          folderActions={folderActions}
          dragDrop={dragDrop}
          handleSelectFolder={handleSelectFolder}
          onManagePermissions={onManagePermissions}
        />

        {/* File Details Panel */}
        <div className={`transition-all duration-300 ease-in-out ${selectedDocument ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}>
          {selectedDocument && (
            <QualidadeFileDetails
              document={selectedDocument}
              onClose={() => setSelectedDocument(null)}
              onEdit={onEditDocument}
              onDelete={onDeleteDocument}
              onDownload={onDownloadDocument}
              onViewHistory={onViewHistory}
              onReschedule={onRescheduleDocument}
            />
          )}
        </div>
      </div>
    </div>
  )
}
