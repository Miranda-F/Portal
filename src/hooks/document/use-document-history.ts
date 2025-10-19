import { useState, useEffect } from 'react'
import { DocumentVersion, DocumentApproval, DocumentAccess } from '@/types/document'
import { mockVersions, mockApprovals, mockAccess } from '@/constants/document-mock'

export function useDocumentHistory(documentId: string) {
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [approvals, setApprovals] = useState<DocumentApproval[]>([])
  const [access, setAccess] = useState<DocumentAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocumentHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // In a real implementation, these would be API calls
      // For now, we'll filter mock data by documentId
      const filteredVersions = mockVersions.filter(v => v.documentId === documentId)
      const filteredApprovals = mockApprovals.filter(a => a.documentId === documentId)
      const filteredAccess = mockAccess.filter(a => a.documentId === documentId)
      
      setVersions(filteredVersions)
      setApprovals(filteredApprovals)
      setAccess(filteredAccess)
    } catch (err) {
      console.error('Error fetching document history:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (documentId) {
      fetchDocumentHistory()
    }
  }, [documentId])

  return {
    versions,
    approvals,
    access,
    loading,
    error,
    refetch: fetchDocumentHistory
  }
}