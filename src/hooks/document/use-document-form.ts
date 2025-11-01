import { useState, useCallback } from 'react'
import { DocumentFormData, Document, Sector } from '@/types/document'
import { DocumentService } from '@/services/document-service'
import { useToast } from '@/hooks/use-toast'
import { defaultDocumentForm } from '@/constants/document'

interface UseDocumentFormProps {
  sectors: Sector[]
  onDocumentCreated?: (document: Document) => void
  onDocumentUpdated?: (document: Document) => void
  onDocumentDeleted?: () => void
}

export function useDocumentForm({ 
  sectors, 
  onDocumentCreated, 
  onDocumentUpdated, 
  onDocumentDeleted 
}: UseDocumentFormProps) {
  const { toast } = useToast()
  
  // Form states
  const [documentForm, setDocumentForm] = useState<DocumentFormData>(defaultDocumentForm)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isSavingDocument, setIsSavingDocument] = useState(false)
  const [isDeletingDocument, setIsDeletingDocument] = useState(false)
  
  // Modal states
  const [isCreateDocumentModalOpen, setIsCreateDocumentModalOpen] = useState(false)
  const [isEditDocumentModalOpen, setIsEditDocumentModalOpen] = useState(false)
  const [isDeleteDocumentModalOpen, setIsDeleteDocumentModalOpen] = useState(false)

  const resetForm = useCallback(() => {
    setDocumentForm(defaultDocumentForm)
    setSelectedDocument(null)
  }, [])

  const openCreateModal = useCallback(() => {
    resetForm()
    setIsCreateDocumentModalOpen(true)
  }, [resetForm])

  const openEditModal = useCallback((document: Document) => {
    setSelectedDocument(document)
    setDocumentForm({
      code: document.code,
      title: document.title,
      version: document.version,
      issueDate: document.issueDate,
      responsibleSector: document.responsibleSector,
      type: document.type,
      description: document.description,
      file: null,
      status: document.status,
      classification: document.status === 'inactive' ? document.type : undefined
    })
    setIsEditDocumentModalOpen(true)
  }, [])

  const openDeleteModal = useCallback((document: Document) => {
    setSelectedDocument(document)
    setIsDeleteDocumentModalOpen(true)
  }, [])

  const closeCreateModal = useCallback(() => {
    setIsCreateDocumentModalOpen(false)
    resetForm()
  }, [resetForm])

  const closeEditModal = useCallback(() => {
    setIsEditDocumentModalOpen(false)
    resetForm()
  }, [resetForm])

  const closeDeleteModal = useCallback(() => {
    setIsDeleteDocumentModalOpen(false)
    resetForm()
  }, [resetForm])

  const handleCreateDocument = useCallback(async () => {
    setIsSavingDocument(true)
    
    try {
      const result = await DocumentService.createDocument(documentForm, sectors)
      
      if (result.success && result.data) {
        onDocumentCreated?.(result.data)
        closeCreateModal()
        
        toast({
          title: "Sucesso",
          description: "Documento criado com sucesso.",
        })
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao criar documento. Tente novamente.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar documento. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsSavingDocument(false)
    }
  }, [documentForm, sectors, onDocumentCreated, closeCreateModal, toast])

  const handleUpdateDocument = useCallback(async () => {
    if (!selectedDocument) return
    
    setIsSavingDocument(true)
    
    try {
      const result = await DocumentService.updateDocument(
        selectedDocument.id, 
        documentForm, 
        sectors
      )
      
      if (result.success && result.data) {
        onDocumentUpdated?.(result.data)
        closeEditModal()
        
        toast({
          title: "Sucesso",
          description: "Documento atualizado com sucesso.",
        })
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao atualizar documento. Tente novamente.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar documento. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsSavingDocument(false)
    }
  }, [selectedDocument, documentForm, sectors, onDocumentUpdated, closeEditModal, toast])

  const handleDeleteDocument = useCallback(async () => {
    if (!selectedDocument) return
    
    setIsDeletingDocument(true)
    
    try {
      const result = await DocumentService.deleteDocument(selectedDocument.id)
      
      if (result.success) {
        onDocumentDeleted?.()
        closeDeleteModal()
        
        toast({
          title: "Sucesso",
          description: "Documento excluído com sucesso.",
        })
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao excluir documento. Tente novamente.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir documento. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsDeletingDocument(false)
    }
  }, [selectedDocument, onDocumentDeleted, closeDeleteModal, toast])

  return {
    // Form state
    documentForm,
    setDocumentForm,
    selectedDocument,
    isSavingDocument,
    isDeletingDocument,
    
    // Modal state
    isCreateDocumentModalOpen,
    isEditDocumentModalOpen,
    isDeleteDocumentModalOpen,
    
    // Actions
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
    handleCreateDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    resetForm
  }
}