'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useDocumentFilters } from '@/hooks/document/use-document-filters'
import { useDocumentHistory } from '@/hooks/document/use-document-history'
import { useDocumentManagement } from '@/hooks/document/use-document-management'
import { useDocumentForm } from '@/hooks/document/use-document-form'
import { useDocumentActions } from '@/handlers/document-actions'
import { DocumentModal } from '@/components/document/document-modal'
import { DeleteDocumentModal } from '@/components/document/delete-document-modal'
import { DocumentHistoryModal } from '@/components/document/document-history-modal'
import { DocumentPreviewModal } from '@/components/document/document-preview-modal'
import { RescheduleDocumentModal } from '@/components/procedimentos/reschedule-document-modal'
import { VerifyFileUploadModal } from '@/components/procedimentos/verify-file-upload-modal'
import { DocumentSecurity } from '@/lib/security/document-security'
import { DocumentService } from '@/services/document-service'
import { Document } from '@/types/document'
import { ProcedimentosDashboard } from '@/components/procedimentos/procedimentos-dashboard'

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
    handleDocumentUpdated: baseHandleDocumentUpdated,
    handleDocumentDeleted,
    fetchDocuments
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
  
  // estados dos modais de documento
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const { versions, approvals, access, loading: historyLoading, refetch: refetchHistory } = useDocumentHistory(selectedDocument?.id || '')
  
  // Wrapper para atualizar também o selectedDocument quando o documento for atualizado
  const handleDocumentUpdated = useCallback((updatedDocument: Document) => {
    baseHandleDocumentUpdated(updatedDocument)
    // Atualizar selectedDocument se for o documento que foi atualizado
    setSelectedDocument(prev => {
      if (prev?.id === updatedDocument.id) {
        // Recarregar histórico após atualização
        setTimeout(() => {
          refetchHistory()
        }, 500)
        return updatedDocument
      }
      return prev
    })
  }, [baseHandleDocumentUpdated, refetchHistory])
  
  // Document form handling
  const {
    documentForm,
    setDocumentForm,
    isSavingDocument,
    isDeletingDocument,
    isCreateDocumentModalOpen,
    isEditDocumentModalOpen,
    isDeleteDocumentModalOpen,
    isVerifyFileUploadModalOpen,
    closeVerifyFileUploadModal,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
    handleCreateDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    handleConfirmFileUpload,
    pendingFileUpdate,
    hasFormChanges
  } = useDocumentForm({
    sectors,
    onDocumentCreated: handleDocumentCreated,
    onDocumentUpdated: handleDocumentUpdated,
    onDocumentDeleted: handleDocumentDeleted
  })
  
  // handlers de acoes dos documentos
  const { handleViewDocument, handleDownloadDocument, handleViewHistory } = useDocumentActions(
    setSelectedDocument,
    setIsHistoryModalOpen,
    setIsPreviewModalOpen
  )
  
  // verifica rate limiting pra acoes de documento
  const canPerformAction = (action: string) => {
    return DocumentSecurity.checkRateLimit(`document_${action}`, 10, 60000) // 10 acoes por minuto
  }

  // wrappers dos handlers com verificacao de seguranca
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

  const handleRescheduleDocument = (document: Document) => {
    if (!canPerformAction('reschedule')) {
      toast({
        title: "Atenção",
        description: "Muitas tentativas. Por favor, aguarde um momento.",
        variant: "destructive"
      })
      return
    }
    setSelectedDocument(document)
    setIsRescheduleModalOpen(true)
  }

  const handleConfirmReschedule = async (documentId: string, newDate: string) => {
    try {
      const result = await DocumentService.rescheduleDocument(documentId, newDate)
      
      if (result.success && result.data) {
        handleDocumentUpdated(result.data)
        // Garantir que a lista reflita a nova data/status
        await fetchDocuments()
        // Recarregar histórico após reaprazamento
        setTimeout(() => {
          refetchHistory()
        }, 500)
        setIsRescheduleModalOpen(false)
        
        toast({
          title: "Sucesso",
          description: "Data de vencimento reaprazada com sucesso.",
        })
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao reaprazar documento. Tente novamente.",
          variant: "destructive"
        })
        throw new Error(result.error || "Erro ao reaprazar documento")
      }
    } catch (error) {
      throw error
    }
  }
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <ProcedimentosDashboard
        allDocuments={documents}
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
        onRescheduleDocument={handleRescheduleDocument}
        selectedDocument={selectedDocument}
        setSelectedDocument={setSelectedDocument}
        onRefreshDocuments={fetchDocuments}
      />
      
      {/* modal de criacao de documento */}
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
      
      {/* modal de edicao de documento */}
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
        hasChanges={hasFormChanges()}
      />
      
      {/* modal de exclusao de documento */}
      <DeleteDocumentModal
        isOpen={isDeleteDocumentModalOpen}
        onClose={closeDeleteModal}
        document={selectedDocument}
        onConfirm={handleDeleteDocument}
        isDeleting={isDeletingDocument}
      />
      
      {/* modal de historico do documento */}
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
      
      {/* modal de preview do documento */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
        onDownload={handleDownloadDocument}
      />
      
      {/* modal de reaprazamento */}
      <RescheduleDocumentModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
        onConfirm={handleConfirmReschedule}
      />
      
      {/* modal de verificação de anexo de arquivo */}
      <VerifyFileUploadModal
        isOpen={isVerifyFileUploadModalOpen}
        onClose={closeVerifyFileUploadModal}
        fileName={pendingFileUpdate?.formData.file?.name || ''}
        onConfirm={handleConfirmFileUpload}
      />
    </div>
  )
}