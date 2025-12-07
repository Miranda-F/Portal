import { Document } from '@/types/document'
import { useToast } from '@/hooks/use-toast'
import { DocumentService } from '@/services/document-service'

export interface DocumentActionHandlers {
  handleViewDocument: (document: Document) => void
  handleDownloadDocument: (document: Document) => void
  handleViewHistory: (document: Document) => void
}

export function useDocumentActions(
  setSelectedDocument: (document: Document | null) => void,
  setIsHistoryModalOpen: (open: boolean) => void,
  setIsPreviewModalOpen?: (open: boolean) => void
): DocumentActionHandlers {
  const { toast } = useToast()

  const handleViewDocument = (document: Document) => {
    // Log de acesso (visualização)
    DocumentService.logAccess(document.id, 'VIEWED')
    if (document.fileUrl) {
      // valida url antes de abrir por segurança
      try {
        const url = new URL(document.fileUrl, window.location.origin)
        
        // so aceita urls do mesmo dominio ou localhost
        if (url.origin === window.location.origin || 
            url.hostname === 'localhost' || 
            url.hostname.match(/^[\w.-]+\.?$/)) {
          
          // usa modal se disponivel, senao abre nova aba
          if (setIsPreviewModalOpen) {
            setSelectedDocument(document)
            setIsPreviewModalOpen(true)
          } else {
            window.open(document.fileUrl, '_blank', 'noopener,noreferrer')
          }
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

  const handleDownloadDocument = (doc: Document) => {
    // Log de acesso (download)
    DocumentService.logAccess(doc.id, 'DOWNLOADED')
    if (doc.fileUrl) {
      try {
        // valida url antes do download
        const url = new URL(doc.fileUrl, window.location.origin)
        
        if (url.origin === window.location.origin || 
            url.hostname === 'localhost' || 
            url.hostname.match(/^[\w.-]+\.?$/)) {
          
          // limpa nome do arquivo pro download
          const sanitizeFilename = (filename: string): string => {
            return filename
              .replace(/[^a-z0-9\s\-_\.]/gi, '_') // remove caracteres especiais
              .replace(/\s+/g, '_') // substitui espacos por underscore
              .toLowerCase()
          }

          const safeCode = sanitizeFilename(doc.code)
          const safeTitle = sanitizeFilename(doc.title)
          const extension = doc.fileType ? `.${doc.fileType}` : '.pdf'
          
          const downloadLink = document.createElement('a')
          downloadLink.href = doc.fileUrl
          downloadLink.download = `${safeCode}_${safeTitle}${extension}`
          downloadLink.target = '_blank'
          downloadLink.rel = 'noopener noreferrer'
          
          // adiciona no dom, clica e remove
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