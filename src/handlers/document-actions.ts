import { Document } from '@/types/document'
import { useToast } from '@/hooks/use-toast'

export interface DocumentActionHandlers {
  handleViewDocument: (document: Document) => void
  handleDownloadDocument: (document: Document) => void
  handleViewHistory: (document: Document) => void
}

export function useDocumentActions(
  setSelectedDocument: (document: Document | null) => void,
  setIsHistoryModalOpen: (open: boolean) => void
): DocumentActionHandlers {
  const { toast } = useToast()

  const handleViewDocument = (document: Document) => {
    if (document.fileUrl) {
      // Security: Validate URL before opening
      try {
        const url = new URL(document.fileUrl, window.location.origin)
        
        // Only allow same-origin or specific trusted domains
        if (url.origin === window.location.origin || 
            url.hostname === 'localhost' || 
            url.hostname.match(/^[\w.-]+\.?$/)) {
          window.open(document.fileUrl, '_blank', 'noopener,noreferrer')
        } else {
          throw new Error('Invalid URL origin')
        }
      } catch (error) {
        toast({
          title: "Erro de Segurança",
          description: "URL do documento inválido.",
          variant: "destructive"
        })
      }
    } else {
      toast({
        title: "Informação",
        description: "Arquivo não disponível para visualização.",
      })
    }
  }

  const handleDownloadDocument = (document: Document) => {
    if (document.fileUrl) {
      try {
        // Security: Validate URL before downloading
        const url = new URL(document.fileUrl, window.location.origin)
        
        if (url.origin === window.location.origin || 
            url.hostname === 'localhost' || 
            url.hostname.match(/^[\w.-]+\.?$/)) {
          
          // Sanitize filename for download
          const sanitizeFilename = (filename: string): string => {
            return filename
              .replace(/[^a-z0-9\s\-_\.]/gi, '_') // Remove special chars
              .replace(/\s+/g, '_') // Replace spaces with underscores
              .toLowerCase()
          }

          const safeCode = sanitizeFilename(document.code)
          const safeTitle = sanitizeFilename(document.title)
          const extension = document.fileType ? `.${document.fileType}` : '.pdf'
          
          const downloadLink = document.createElement('a')
          downloadLink.href = document.fileUrl
          downloadLink.download = `${safeCode}_${safeTitle}${extension}`
          downloadLink.target = '_blank'
          downloadLink.rel = 'noopener noreferrer'
          
          // Add to DOM, click, and remove
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
        } else {
          throw new Error('Invalid URL origin')
        }
      } catch (error) {
        toast({
          title: "Erro de Segurança",
          description: "URL do documento inválido para download.",
          variant: "destructive"
        })
      }
    } else {
      toast({
        title: "Informação",
        description: "Arquivo não disponível para download.",
      })
    }
  }

  const handleViewHistory = (document: Document) => {
    setSelectedDocument(document)
    setIsHistoryModalOpen(true)
  }

  return {
    handleViewDocument,
    handleDownloadDocument,
    handleViewHistory
  }
}