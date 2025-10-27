'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  X, Download, FileText, Loader2
} from "lucide-react"
import { Document } from '@/types/document'
import { useToast } from '@/hooks/use-toast'

interface DocumentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  onDownload?: (document: Document) => void
}

export function DocumentPreviewModal({ 
  isOpen, 
  onClose, 
  document, 
  onDownload 
}: DocumentPreviewModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [canPreview, setCanPreview] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    if (document && isOpen) {
      setIsLoading(true)
      setPreviewError(null)
      
      // valida se o doc pode ser previewado
      if (document.fileUrl) {
        try {
          const url = new URL(document.fileUrl, window.location.origin)
          
          // so aceita pdf e imagens pra preview, o resto vai pro download
          const fileType = document.fileType?.toLowerCase() || ''
          const isPreviewable = fileType === 'pdf' || 
                               ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)
          
          if (isPreviewable && 
              (url.origin === window.location.origin || 
               url.hostname === 'localhost' || 
               url.hostname.match(/^[\w.-]+\.?$/))) {
            setCanPreview(true)
          } else {
            setCanPreview(false)
            setPreviewError('Tipo de arquivo não suportado para visualização')
          }
        } catch (error) {
          setCanPreview(false)
          setPreviewError('URL do documento inválido')
        }
      } else {
        setCanPreview(false)
        setPreviewError('Arquivo não disponível')
      }
      
      setIsLoading(false)
    }
  }, [document, isOpen])

  // limpa cache e memoria quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      // reseta estados
      setIsLoading(false)
      setPreviewError(null)
      setCanPreview(false)
      
      // força remontagem do preview pra limpar cache
      setPreviewKey(prev => prev + 1)
      
      // força garbage collection se disponivel
      if (window.gc) {
        window.gc()
      }
    }
  }, [isOpen])


  const handleDownload = () => {
    if (document && onDownload) {
      onDownload(document)
    }
  }

  const handleClose = () => {
    // limpa estados antes de fechar
    setIsLoading(false)
    setPreviewError(null)
    setCanPreview(false)
    setPreviewKey(prev => prev + 1)
    
    // chama o onClose original
    onClose()
  }


  if (!document) return null

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={handleClose}
    >
      <div 
        className="w-screen h-screen bg-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
      >
        {/* header bem clean so com o essencial */}
        <div className="flex-shrink-0 bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h3 id="preview-title" className="font-semibold text-sm">{document.title}</h3>
              <p className="text-xs text-muted-foreground">
                {document.code} | v{document.version}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="flex items-center space-x-1 h-8"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* preview ocupa tudo que sobrar */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando documento...</p>
              </div>
            </div>
          ) : previewError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">{previewError}</p>
                <p className="text-xs text-muted-foreground">
                  Use os botões acima para acessar o documento
                </p>
              </div>
            </div>
          ) : canPreview && document.fileUrl ? (
            <div className="h-full w-full">
              {document.fileType?.toLowerCase() === 'pdf' ? (
                // iframe pra pdf sem borda pra ficar clean
                <iframe
                  key={previewKey}
                  src={document.fileUrl}
                  className="w-full h-full border-0"
                  title={`Preview de ${document.title}`}
                />
              ) : ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(document.fileType?.toLowerCase() || '') ? (
                // imagem centralizada com zoom automático
                <div className="h-full w-full flex items-center justify-center bg-gray-50">
                  <img
                    key={previewKey}
                    src={document.fileUrl}
                    alt={document.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Arquivo não disponível para visualização
                </p>
                <p className="text-xs text-muted-foreground">
                  Use o botão "Download" para baixar o documento
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
