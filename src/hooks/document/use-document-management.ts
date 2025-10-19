import { useState, useEffect, useCallback } from 'react'
import { Document, Sector } from '@/types/document'
import { DocumentService } from '@/services/document-service'
import { useToast } from '@/hooks/use-toast'

interface UseDocumentManagementProps {
  initialDocuments?: Document[]
}

export function useDocumentManagement({ initialDocuments = [] }: UseDocumentManagementProps = {}) {
  const { toast } = useToast()
  
  // State
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await DocumentService.fetchDocuments()
      
      if (result.success && result.data) {
        setDocuments(result.data)
      } else {
        setError(result.error || 'Failed to fetch documents')
        toast({
          title: "Erro",
          description: result.error || "Erro ao carregar documentos.",
          variant: "destructive"
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast({
        title: "Erro",
        description: "Erro ao carregar documentos.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Fetch sectors
  const fetchSectors = useCallback(async () => {
    try {
      const result = await DocumentService.fetchSectors()
      
      if (result.success && result.data) {
        setSectors(result.data)
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao carregar setores.",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao carregar setores.",
        variant: "destructive"
      })
    }
  }, [toast])

  // Handle document created
  const handleDocumentCreated = useCallback((newDocument: Document) => {
    setDocuments(prev => [...prev, newDocument])
  }, [])

  // Handle document updated
  const handleDocumentUpdated = useCallback((updatedDocument: Document) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      )
    )
  }, [])

  // Handle document deleted
  const handleDocumentDeleted = useCallback(() => {
    // This will be handled by the parent component that knows which document was deleted
    // We'll trigger a refetch to ensure consistency
    fetchDocuments()
  }, [fetchDocuments])

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchDocuments(),
        fetchSectors()
      ])
    }
    
    initializeData()
  }, [fetchDocuments, fetchSectors])

  // Get unique sectors for filter
  const uniqueSectors = Array.from(new Set(documents.map(doc => doc.responsibleSector).filter(Boolean)))

  return {
    // Data
    documents,
    sectors,
    uniqueSectors,
    loading,
    error,
    
    // Actions
    fetchDocuments,
    fetchSectors,
    handleDocumentCreated,
    handleDocumentUpdated,
    handleDocumentDeleted,
    setDocuments
  }
}