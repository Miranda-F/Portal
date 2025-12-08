'use client'

import { useState } from 'react'
import { Document } from '@/types/document'
import { useAuth } from '@/hooks/use-auth'
import { DocumentsSection } from './components/documents-section'
import { FoldersSection } from './components/folders-section'
import { AnalyticsSection } from './components/analytics-section'
import { AccessControlSection } from './components/access-control-section'

interface QualidadeMainContentProps {
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

  // Props de pastas
  selectedFolderPath?: string | null
  selectedFolderType?: string | null
  setSelectedFolderPath?: (path: string | null) => void
  setSelectedFolderType?: (type: string | null) => void
  emptyCreatedFolders?: Set<string>
  folderActions?: any
  dragDrop?: any

  handleSelectFolder?: (folderPath: string | null, type?: string) => void
  onManagePermissions?: (folderPath: string, folderName: string) => void
}

export function QualidadeMainContent({
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
  onRefreshDocuments,
  selectedFolderPath,
  selectedFolderType,
  setSelectedFolderPath,
  setSelectedFolderType,
  emptyCreatedFolders,
  folderActions,
  dragDrop,
  handleSelectFolder,
  onManagePermissions
}: QualidadeMainContentProps) {
  const { user, logout } = useAuth()

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
        // Props de pastas
        selectedFolderPath={selectedFolderPath || null}
        selectedFolderType={selectedFolderType || null}
        setSelectedFolderPath={setSelectedFolderPath || (() => { })}
        setSelectedFolderType={setSelectedFolderType || (() => { })}
        emptyCreatedFolders={emptyCreatedFolders || new Set()}
        folderActions={folderActions}
        dragDrop={dragDrop}
        handleSelectFolder={handleSelectFolder || (() => { })}
        onManagePermissions={onManagePermissions}
      />
    )
  }

  if (activeSection === 'access-control') {
    return (
      <AccessControlSection
        allDocuments={allDocuments}
        user={user}
        logout={logout}
      />
    )
  }

  // Default view (Dashboard) is now the Analytics view
  return (
    <AnalyticsSection
      allDocuments={allDocuments}
      setActiveSection={setActiveSection}
      user={user}
      logout={logout}
    />
  )
}
