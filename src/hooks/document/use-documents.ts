import { useState, useEffect } from 'react'
import { Document, Sector } from '@/types/document'

interface UseDocumentsProps {
  initialDocuments?: Document[]
}

export function useDocuments({ initialDocuments = [] }: UseDocumentsProps = {}) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/procedures')
      
      if (response.ok) {
        const documentsData = await response.json()
        
        // Transform API data to match the Document interface
        const transformedDocuments = documentsData.map((doc: any) => {
          const isExpired = doc.expiryDate ? new Date(doc.expiryDate) < new Date() : false
          // Mapear status do banco para status da interface
          // IMPORTANTE: expirado tem prioridade sobre qualquer outro status
          let status: any = 'inactive' // padrão
          if (isExpired) {
            status = 'expired'
          } else if (doc.status === 'PUBLISHED') {
            status = 'active'
          } else if (doc.status === 'DRAFT') {
            status = 'pending'
          } else if (doc.status === 'ARCHIVED') {
            // ARCHIVED do backend é tratado como inactive no frontend
            status = 'inactive'
          }
          return ({
          id: doc.id,
          code: doc.title.substring(0, 10) || "DOC-" + doc.id.substring(0, 4),
          title: doc.title,
          version: "1.0",
          issueDate: doc.documentDate ? new Date(doc.documentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          reviewDate: doc.documentDate ? new Date(doc.documentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          nextReviewDate: doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          responsibleSector: doc.sector?.name || "",
          status,
          type: doc.type === 'MANAGEMENT_PROCEDURE' ? 'procedure' : 'instruction',
          description: doc.content || "",
          approver: "",
          createdBy: doc.createdBy?.name || "Unknown",
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize,
          fileType: doc.fileName?.split('.').pop() || "",
          accessLevel: "public"
        })})
        
        setDocuments(transformedDocuments)
      } else {
        throw new Error('Failed to fetch documents')
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Sem fallback de mocks — deixar vazio em caso de erro
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const createDocument = async (documentData: FormData) => {
    try {
      const response = await fetch('/api/admin/procedures', {
        method: 'POST',
        body: documentData
      })

      if (!response.ok) {
        throw new Error('Failed to create document')
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error creating document:', err)
      throw err
    }
  }

  const updateDocument = async (id: string, documentData: FormData) => {
    try {
      const response = await fetch(`/api/admin/procedures/${id}`, {
        method: 'PUT',
        body: documentData
      })

      if (!response.ok) {
        throw new Error('Failed to update document')
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error updating document:', err)
      throw err
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/procedures/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      return true
    } catch (err) {
      console.error('Error deleting document:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    setDocuments
  }
}