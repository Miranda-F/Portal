'use client'

import { useState } from 'react'
import { Document } from '@/types/document'
import { ProcedimentosSidebar } from './procedimentos-sidebar'
import { ProcedimentosMainContent } from './procedimentos-main-content'
import { ProcedimentosFileDetails } from './procedimentos-file-details'

interface ProcedimentosDashboardProps {
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

export function ProcedimentosDashboard({
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
  onRefreshDocuments
}: ProcedimentosDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard')

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <ProcedimentosSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex">
        <ProcedimentosMainContent
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
        />
        
        {/* File Details Panel */}
        <div className={`transition-all duration-300 ease-in-out ${
          selectedDocument ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'
        }`}>
          {selectedDocument && (
            <ProcedimentosFileDetails
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
