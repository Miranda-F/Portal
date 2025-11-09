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
  const [originalDocumentForm, setOriginalDocumentForm] = useState<DocumentFormData | null>(null) // Valores originais para comparação
  const [isSavingDocument, setIsSavingDocument] = useState(false)
  const [isDeletingDocument, setIsDeletingDocument] = useState(false)
  
  // Modal states
  const [isCreateDocumentModalOpen, setIsCreateDocumentModalOpen] = useState(false)
  const [isEditDocumentModalOpen, setIsEditDocumentModalOpen] = useState(false)
  const [isDeleteDocumentModalOpen, setIsDeleteDocumentModalOpen] = useState(false)
  const [isVerifyFileUploadModalOpen, setIsVerifyFileUploadModalOpen] = useState(false)
  const [pendingFileUpdate, setPendingFileUpdate] = useState<{ documentId: string; formData: DocumentFormData } | null>(null)

  const resetForm = useCallback(() => {
    // Sempre usar a data atual ao resetar o formulário
    const today = new Date().toISOString().split('T')[0]
    setDocumentForm({
      ...defaultDocumentForm,
      issueDate: today
    })
    setSelectedDocument(null)
    setOriginalDocumentForm(null) // Limpar valores originais
  }, [])

  const openCreateModal = useCallback(() => {
    resetForm()
    setIsCreateDocumentModalOpen(true)
  }, [resetForm])

  const openEditModal = useCallback((document: Document) => {
    setSelectedDocument(document)
    const initialFormData: DocumentFormData = {
      code: document.code,
      title: document.title,
      version: document.version,
      issueDate: document.issueDate,
      nextReviewDate: document.nextReviewDate,
      responsibleSector: document.responsibleSector,
      type: document.type,
      description: document.description,
      file: null, // Sempre começar sem arquivo na edição
      status: document.status,
      classification: document.status === 'inactive' ? document.type : undefined
    }
    setDocumentForm(initialFormData)
    setOriginalDocumentForm(initialFormData) // Guardar valores originais para comparação
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

  const performUpdate = useCallback(async (documentId: string, formData: DocumentFormData) => {
    setIsSavingDocument(true)
    
    try {
      const result = await DocumentService.updateDocument(
        documentId, 
        formData, 
        sectors
      )
      
      if (result.success && result.data) {
        onDocumentUpdated?.(result.data)
        closeEditModal()
        setIsVerifyFileUploadModalOpen(false)
        setPendingFileUpdate(null)
        
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
  }, [sectors, onDocumentUpdated, closeEditModal, toast])

  const handleUpdateDocument = useCallback(async () => {
    if (!selectedDocument) return
    
    // Se há um arquivo anexado na edição, solicitar dupla checagem
    if (documentForm.file) {
      setPendingFileUpdate({
        documentId: selectedDocument.id,
        formData: documentForm
      })
      setIsVerifyFileUploadModalOpen(true)
      return
    }
    
    // Se não há arquivo, atualizar diretamente
    await performUpdate(selectedDocument.id, documentForm)
  }, [selectedDocument, documentForm, performUpdate])

  const handleConfirmFileUpload = useCallback(async () => {
    if (!pendingFileUpdate) return
    
    await performUpdate(pendingFileUpdate.documentId, pendingFileUpdate.formData)
  }, [pendingFileUpdate, performUpdate])

  const closeVerifyFileUploadModal = useCallback(() => {
    setIsVerifyFileUploadModalOpen(false)
    setPendingFileUpdate(null)
  }, [])

  // Função para verificar se houve alterações no formulário
  const hasFormChanges = useCallback((): boolean => {
    if (!originalDocumentForm || !isEditDocumentModalOpen) {
      return true // Na criação, sempre permite salvar
    }

    // Normalizar strings para comparação (trim e case-insensitive onde necessário)
    const normalizeString = (str: string | undefined | null): string => {
      return (str || '').trim()
    }

    // Comparar campos editáveis (ignorar versão, data de criação, data de vencimento)
    const hasChanges = 
      normalizeString(documentForm.code) !== normalizeString(originalDocumentForm.code) ||
      normalizeString(documentForm.title) !== normalizeString(originalDocumentForm.title) ||
      documentForm.type !== originalDocumentForm.type ||
      normalizeString(documentForm.responsibleSector) !== normalizeString(originalDocumentForm.responsibleSector) ||
      normalizeString(documentForm.description) !== normalizeString(originalDocumentForm.description) ||
      documentForm.status !== originalDocumentForm.status ||
      documentForm.file !== null // Se há um novo arquivo, há mudança

    return hasChanges
  }, [documentForm, originalDocumentForm, isEditDocumentModalOpen])

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
    isVerifyFileUploadModalOpen,
    closeVerifyFileUploadModal,
    
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
    handleConfirmFileUpload,
    resetForm,
    pendingFileUpdate,
    hasFormChanges
  }
}