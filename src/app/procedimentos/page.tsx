'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useDocumentFilters } from '@/hooks/document/use-document-filters'
import { useDocumentHistory } from '@/hooks/document/use-document-history'
import { useDocumentManagement } from '@/hooks/document/use-document-management'
import { useDocumentForm } from '@/hooks/document/use-document-form'
import { useDocumentActions } from '@/handlers/document-actions'
import { DocumentTable } from '@/components/document/document-table'
import { DocumentModal } from '@/components/document/document-modal'
import { DeleteDocumentModal } from '@/components/document/delete-document-modal'
import { DocumentHistoryModal } from '@/components/document/document-history-modal'
import { DocumentSecurity } from '@/lib/security/document-security'
import { Document } from '@/types/document'

export default function ProcedimentosPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  // Document management
  const {
    documents,
    sectors,
    uniqueSectors,
    loading: documentsLoading,
    handleDocumentCreated,
    handleDocumentUpdated,
    handleDocumentDeleted
  } = useDocumentManagement()
  
  // Filters
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    sectorFilter,
    setSectorFilter,
    filteredDocuments
  } = useDocumentFilters({ documents })
  
  // Document history
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const { versions, approvals, access, loading: historyLoading } = useDocumentHistory(selectedDocument?.id || '')
  
  // Document form handling
  const {
    documentForm,
    setDocumentForm,
    isSavingDocument,
    isDeletingDocument,
    isCreateDocumentModalOpen,
    isEditDocumentModalOpen,
    isDeleteDocumentModalOpen,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
    handleCreateDocument,
    handleUpdateDocument,
    handleDeleteDocument
  } = useDocumentForm({
    sectors,
    onDocumentCreated: handleDocumentCreated,
    onDocumentUpdated: handleDocumentUpdated,
    onDocumentDeleted: handleDocumentDeleted
  })
  
  // Document actions
  const { handleViewDocument, handleDownloadDocument, handleViewHistory } = useDocumentActions(
    setSelectedDocument,
    setIsHistoryModalOpen
  )
  
  // Security: Check rate limiting for document actions
  const canPerformAction = (action: string) => {
    return DocumentSecurity.checkRateLimit(`document_${action}`, 10, 60000) // 10 actions per minute
  }

  // Wrapped action handlers with security checks
  const handleEditDocument = (document: Document) => {
    if (!canPerformAction('edit')) {
      alert('Muitas tentativas. Por favor, aguarde um momento.')
      return
    }
    openEditModal(document)
  }

  const handleDeleteDocumentWrapper = (document: Document) => {
    if (!canPerformAction('delete')) {
      alert('Muitas tentativas. Por favor, aguarde um momento.')
      return
    }
    openDeleteModal(document)
  }

  const handleCreateNewDocument = () => {
    if (!canPerformAction('create')) {
      alert('Muitas tentativas. Por favor, aguarde um momento.')
      return
    }
    openCreateModal()
  }
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <DocumentTable
        documents={filteredDocuments}
        loading={documentsLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sectorFilter={sectorFilter}
        setSectorFilter={setSectorFilter}
        sectors={uniqueSectors}
        onCreateDocument={handleCreateNewDocument}
        onEditDocument={handleEditDocument}
        onDeleteDocument={handleDeleteDocumentWrapper}
        onViewDocument={handleViewDocument}
        onViewHistory={handleViewHistory}
        onDownloadDocument={handleDownloadDocument}
      />
      
      {/* Create Document Modal */}
      <DocumentModal
        isOpen={isCreateDocumentModalOpen}
        onClose={closeCreateModal}
        title="Criar Novo Documento"
        description="Preencha os dados para criar um novo documento no sistema."
        formData={documentForm}
        setFormData={setDocumentForm}
        sectors={sectors}
        onSubmit={handleCreateDocument}
        isSubmitting={isSavingDocument}
        isEditing={false}
      />
      
      {/* Edit Document Modal */}
      <DocumentModal
        isOpen={isEditDocumentModalOpen}
        onClose={closeEditModal}
        title="Editar Documento"
        description="Atualize os dados do documento."
        formData={documentForm}
        setFormData={setDocumentForm}
        sectors={sectors}
        onSubmit={handleUpdateDocument}
        isSubmitting={isSavingDocument}
        isEditing={true}
      />
      
      {/* Delete Document Modal */}
      <DeleteDocumentModal
        isOpen={isDeleteDocumentModalOpen}
        onClose={closeDeleteModal}
        document={selectedDocument}
        onConfirm={handleDeleteDocument}
        isDeleting={isDeletingDocument}
      />
      
      {/* Document History Modal */}
      <DocumentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
        versions={versions}
        approvals={approvals}
        access={access}
        loading={historyLoading}
      />
    </div>
  )
}