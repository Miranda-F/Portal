'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  X, Printer, PanelLeft, ChevronUp, ChevronDown, Minus, Plus, Maximize, FileText, Loader2, Download
} from "lucide-react"
import { Document as DocumentType } from '@/types/document'
import { useToast } from '@/hooks/use-toast'
import dynamic from 'next/dynamic'

// Dynamically import the preview content to avoid SSR issues with react-pdf
const DocumentPreviewContent = dynamic(
  () => import('./document-preview-content').then(mod => mod.DocumentPreviewContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[200px] text-white">
        <Loader2 className="animate-spin h-8 w-8 mb-2" />
      </div>
    )
  }
)

interface DocumentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  document: DocumentType | null
  onDownload?: (document: DocumentType) => void
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  document,
  onDownload
}: DocumentPreviewModalProps) {
  const { toast } = useToast()

  // State
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // PDF State
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && document?.fileUrl) {
      setIsLoading(true)
      setError(null)
      setZoomLevel(100)
      setPageNumber(1)
    }
  }, [isOpen, document])

  // Zoom Logic
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 50))
  const handleZoomReset = () => setZoomLevel(100)

  // Page Navigation
  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset
      if (numPages) {
        return Math.max(1, Math.min(newPage, numPages))
      }
      return prevPageNumber
    })
  }

  const previousPage = () => changePage(-1)
  const nextPage = () => changePage(1)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
    setIsLoading(false)
  }

  const handleDownload = () => {
    if (document?.fileUrl) {
      const link = window.document.createElement('a')
      link.href = document.fileUrl
      link.download = document.title || 'documento'
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    }
  }

  // Early return after all hooks
  if (!document || !isOpen) return null

  const handleClose = () => {
    setIsLoading(false)
    setError(null)
    setNumPages(null)
    setPageNumber(1)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[98vw] max-w-[98vw] sm:max-w-[98vw] h-[95vh] flex flex-col p-0 overflow-hidden select-none border-none text-white bg-[#525659] shadow-2xl rounded-sm">
        <DialogTitle className="sr-only">Visualização do Documento</DialogTitle>

        {/* HEADER */}
        <div className="flex-shrink-0 bg-[#0f4c81] text-white h-14 flex items-center justify-between px-2 shadow-md z-20 relative select-none">
          {/* Left */}
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className="flex-shrink-0 flex items-center pl-2">
              <img src="/Logo-p-pratagy.webp" alt="Qualiex" className="h-8 w-auto brightness-0 invert object-contain" />
            </div>
            <div className="h-6 w-px bg-white/30 mx-2"></div>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="bg-white/20 p-1 rounded-sm">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold truncate text-white/95 leading-none pt-0.5">
                {document.code ? `${document.code}: ` : ''}{document.title}
                {document.fileType && <span className="text-white/60 text-xs ml-1">.{document.fileType}</span>}
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 pr-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 w-9 h-9" title="Imprimir" onClick={() => window.print()}>
              <Printer className="h-5 w-5" />
            </Button>
            <Button
              className="bg-[#28a745] hover:bg-[#218838] text-white font-bold h-9 px-4 ml-2 rounded-sm shadow-sm transition-colors text-xs uppercase tracking-wide flex items-center gap-2"
              onClick={() => {
                toast({
                  title: "Leitura Registrada",
                  className: "bg-green-600 text-white border-none"
                })
                handleClose()
              }}
            >
              Confirmar Leitura
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-9 w-9 text-white hover:bg-white/10 rounded-full ml-2">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex-shrink-0 bg-[#333333] h-10 flex items-center justify-between px-3 border-b border-black/40 z-10 shadow-inner select-none">
          {/* Left Controls */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/10 rounded-sm">
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-gray-600 mx-1.5 opacity-50"></div>
            {/* Pagination Controls */}
            <Button
              variant="ghost"
              size="icon"
              onClick={previousPage}
              disabled={pageNumber <= 1}
              title="Página Anterior"
              className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/10 rounded-sm disabled:opacity-50"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextPage}
              disabled={!!numPages && pageNumber >= numPages}
              title="Próxima Página"
              className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/10 rounded-sm disabled:opacity-50"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#222] rounded-sm border border-gray-600/50 px-2 h-7" title="Página atual">
              <span className="text-xs font-medium text-white px-2">{pageNumber}</span>
              <span className="text-xs text-gray-400 border-l border-gray-600 pl-2 ml-1">de {numPages || '--'}</span>
            </div>
            <div className="h-4 w-px bg-gray-600 mx-1 opacity-50"></div>
            <div className="flex items-center gap-0.5">
              <Button onClick={handleZoomOut} variant="ghost" size="icon" className="h-7 w-7 text-gray-300 hover:text-white hover:bg-white/10 rounded-sm" title="Diminuir Zoom">
                <Minus className="h-3 w-3" />
              </Button>
              <Button onClick={handleZoomIn} variant="ghost" size="icon" className="h-7 w-7 text-gray-300 hover:text-white hover:bg-white/10 rounded-sm" title="Aumentar Zoom">
                <Plus className="h-3 w-3" />
              </Button>
              <div className="bg-[#222] border border-gray-600/50 rounded-sm px-3 h-7 flex items-center justify-center min-w-[60px] cursor-pointer" onClick={handleZoomReset} title="Resetar Zoom">
                <span className="text-xs text-white/90">{zoomLevel}%</span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/10 rounded-sm">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-[#525659] overflow-auto relative flex justify-center p-8 custom-scrollbar">
          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-40">
              <p className="text-lg mb-4 text-red-300">{error}</p>
              <Button onClick={handleDownload} variant="outline" className="text-black bg-white hover:bg-gray-100">
                <Download className="h-4 w-4 mr-2" />
                Baixar Arquivo
              </Button>
            </div>
          )}

          {/* Documents */}
          {!error && document && (
            <DocumentPreviewContent
              document={document}
              zoomLevel={zoomLevel}
              pageNumber={pageNumber}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(err) => {
                console.error("PDF Load Error", err)
                setError("Erro ao carregar PDF")
                setIsLoading(false)
              }}
              onDocxLoad={() => setIsLoading(false)}
              onDocxError={(errorMsg) => {
                setError(errorMsg)
                setIsLoading(false)
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
