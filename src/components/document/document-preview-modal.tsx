'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  X, Download, FileText, Loader2
} from "lucide-react"
import { Document } from '@/types/document'
import { useToast } from '@/hooks/use-toast'
import mammoth from 'mammoth'

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
  const [docxHtml, setDocxHtml] = useState<string | null>(null)

  useEffect(() => {
    if (document && isOpen) {
      setIsLoading(true)
      setPreviewError(null)
      setDocxHtml(null)
      
      // valida se o doc pode ser previewado
      if (document.fileUrl) {
        try {
          const fileType = document.fileType?.toLowerCase() || ''
          const isPreviewable = fileType === 'pdf' || fileType === 'docx' ||
                               ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)
          
          if (isPreviewable) {
            setCanPreview(true)
            
            // Se for DOCX, carrega e converte usando mammoth
            if (fileType === 'docx') {
              const absoluteUrl = document.fileUrl.startsWith('http') 
                ? document.fileUrl 
                : `${window.location.origin}${document.fileUrl}`
              
              fetch(absoluteUrl)
                .then(response => {
                  if (!response.ok) {
                    throw new Error('Erro ao carregar arquivo DOCX')
                  }
                  return response.arrayBuffer()
                })
                .then(arrayBuffer => {
                  // Opções para preservar melhor a formatação do Word
                  return mammoth.convertToHtml(
                    { arrayBuffer },
                    {
                      styleMap: [
                        "p[style-name='Title'] => h1:fresh",
                        "p[style-name='Heading 1'] => h1:fresh",
                        "p[style-name='Heading 2'] => h2:fresh",
                        "p[style-name='Heading 3'] => h3:fresh",
                        "r[style-name='Strong'] => strong",
                        "p[style-name='List Paragraph'] => p",
                      ],
                      includeDefaultStyleMap: true,
                      convertImage: mammoth.images.imgElement(function(image) {
                        return image.read("base64").then(function(imageBuffer) {
                          return {
                            src: "data:" + image.contentType + ";base64," + imageBuffer
                          };
                        });
                      })
                    }
                  )
                })
                .then(result => {
                  setDocxHtml(result.value)
                  setIsLoading(false)
                })
                .catch(error => {
                  console.error('Erro ao converter DOCX:', error)
                  setPreviewError('Erro ao carregar documento DOCX. Tente fazer o download.')
                  setCanPreview(false)
                  setIsLoading(false)
                })
            } else {
              setIsLoading(false)
            }
          } else {
            setCanPreview(false)
            setPreviewError('Tipo de arquivo não suportado para visualização')
            setIsLoading(false)
          }
        } catch (error) {
          setCanPreview(false)
          setPreviewError('URL do documento inválido')
          setIsLoading(false)
        }
      } else {
        setCanPreview(false)
        setPreviewError('Arquivo não disponível')
        setIsLoading(false)
      }
    }
  }, [document, isOpen])

  // limpa cache e memoria quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      // reseta estados
      setIsLoading(false)
      setPreviewError(null)
      setCanPreview(false)
      setDocxHtml(null)
      
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
    setDocxHtml(null)
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
            {onDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="flex items-center space-x-1 h-8"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            )}
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
                {onDownload && (
                  <p className="text-xs text-muted-foreground">
                    Use o botão "Download" para baixar o documento
                  </p>
                )}
              </div>
            </div>
          ) : canPreview && document.fileUrl ? (
            <div className="h-full w-full">
              {document.fileType?.toLowerCase() === 'pdf' ? (
                // iframe pra pdf sem borda pra ficar clean
                <iframe
                  key={previewKey}
                  src={`${document.fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-full border-0"
                  title={`Preview de ${document.title}`}
                  style={{ pointerEvents: 'auto' }}
                />
              ) : document.fileType?.toLowerCase() === 'docx' ? (
                // usa mammoth.js para converter DOCX para HTML
                docxHtml ? (
                  <>
                    <style>{`
                      .docx-preview-container {
                        font-family: 'Calibri', 'Arial', sans-serif;
                        font-size: 11pt;
                        line-height: 1.15;
                        color: #000000;
                      }
                      .docx-preview-container p {
                        margin: 0;
                        margin-bottom: 6pt;
                        text-align: left;
                        line-height: 1.15;
                        font-size: 11pt;
                      }
                      .docx-preview-container h1 {
                        font-size: 16pt;
                        font-weight: bold;
                        margin-top: 12pt;
                        margin-bottom: 6pt;
                      }
                      .docx-preview-container h2 {
                        font-size: 14pt;
                        font-weight: bold;
                        margin-top: 10pt;
                        margin-bottom: 6pt;
                      }
                      .docx-preview-container h3 {
                        font-size: 12pt;
                        font-weight: bold;
                        margin-top: 8pt;
                        margin-bottom: 6pt;
                      }
                      .docx-preview-container ul,
                      .docx-preview-container ol {
                        margin: 6pt 0;
                        padding-left: 36pt;
                      }
                      .docx-preview-container li {
                        margin: 0;
                        padding: 0;
                        line-height: 1.15;
                      }
                      .docx-preview-container table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 6pt 0;
                      }
                      .docx-preview-container td,
                      .docx-preview-container th {
                        border: 1px solid #000000;
                        padding: 4pt;
                        text-align: left;
                        vertical-align: top;
                      }
                      .docx-preview-container strong,
                      .docx-preview-container b {
                        font-weight: bold;
                      }
                      .docx-preview-container em,
                      .docx-preview-container i {
                        font-style: italic;
                      }
                      .docx-preview-container u {
                        text-decoration: underline;
                      }
                    `}</style>
                    <div 
                      className="h-full w-full overflow-auto bg-gray-100"
                    >
                      <div 
                        dangerouslySetInnerHTML={{ __html: docxHtml }} 
                        className="docx-preview-container"
                        style={{
                          maxWidth: '210mm',
                          minHeight: '297mm',
                          margin: '20px auto',
                          padding: '2.54cm',
                          background: 'white',
                          boxShadow: '0 0 15px rgba(0,0,0,0.15)'
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Convertendo documento...</p>
                    </div>
                  </div>
                )
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
                {onDownload && (
                  <p className="text-xs text-muted-foreground">
                    Use o botão "Download" para baixar o documento
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
