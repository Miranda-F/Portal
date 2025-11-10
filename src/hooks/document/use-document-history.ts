import { useState, useEffect } from 'react'
import { DocumentVersion, DocumentApproval, DocumentAccess } from '@/types/document'

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
      
      const response = await fetch(`/api/admin/procedures/${documentId}/history`)
      if (response.ok) {
        const data = await response.json()
        // Tentar mapear estruturas comuns; fallback para arrays vazios
        setVersions((data.versions || []) as DocumentVersion[])
        setApprovals((data.approvals || []) as DocumentApproval[])
        setAccess((data.access || []) as DocumentAccess[])
      } else {
        setVersions([])
        setApprovals([])
        setAccess([])
        throw new Error('Failed to fetch document history')
      }
    } catch (err) {
      console.error('Error fetching document history:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setVersions([])
      setApprovals([])
      setAccess([])
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