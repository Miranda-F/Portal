"use client"

import { useState, useEffect } from "react"
import { FileText, ExternalLink, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PDFViewerProps {
  fileUrl?: string | null
  fileName?: string
}

export function PDFViewer({ fileUrl, fileName }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [useEmbed, setUseEmbed] = useState(false)
  const [useDirectDownload, setUseDirectDownload] = useState(false)

  useEffect(() => {
    if (fileUrl) {
      console.log('Processing fileUrl:', fileUrl)
      
      // Para URLs de arquivos no sistema
      if (fileUrl.startsWith('/uploads/')) {
        // Construir URL absoluta para arquivos locais
        const absoluteUrl = `${window.location.origin}${fileUrl}`
        console.log('Constructed absolute URL:', absoluteUrl)
        setPdfUrl(absoluteUrl)
        setUseEmbed(false)
        setUseDirectDownload(false)
      } 
      // Para URLs externas
      else if (fileUrl.startsWith('http')) {
        console.log('Using external URL directly:', fileUrl)
        setPdfUrl(fileUrl)
        setUseEmbed(false)
        setUseDirectDownload(false)
      }
      // Para URLs relativas
      else {
        try {
          const absoluteUrl = new URL(fileUrl, window.location.origin).href
          console.log('Converted relative URL to absolute:', absoluteUrl)
          setPdfUrl(absoluteUrl)
          setUseEmbed(false)
          setUseDirectDownload(false)
        } catch (err) {
          console.error('Error converting URL:', err)
          setError('URL inválida')
        }
      }
    }
  }, [fileUrl])

  const handleIframeError = () => {
    console.log('Iframe failed, trying embed...')
    if (!useEmbed) {
      setError('Não foi possível carregar o PDF no iframe. Tentando alternativa...')
      setUseEmbed(true)
    } else if (!useDirectDownload) {
      setError('Embed também falhou. Tentando download direto...')
      setUseDirectDownload(true)
    } else {
      setError('Não foi possível carregar o PDF. Tente abrir em nova aba.')
    }
  }

  const handleEmbedError = () => {
    console.log('Embed failed, trying direct download...')
    if (!useDirectDownload) {
      setError('Embed falhou, tentando download direto...')
      setUseDirectDownload(true)
    } else {
      setError('Não foi possível carregar o PDF com nenhuma das opções disponíveis.')
    }
  }

  const resetViewer = () => {
    setUseEmbed(false)
    setUseDirectDownload(false)
    setError(null)
  }

  const downloadFile = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = fileName || 'documento.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center p-4">
          <FileText className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-600 mb-1">Erro na visualização</p>
          <p className="text-xs">{error}</p>
          <div className="mt-3 space-y-2">
            {pdfUrl && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(pdfUrl, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Abrir em nova aba
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadFile}
                  className="w-full"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Baixar arquivo
                </Button>
              </>
            )}
            {(useEmbed || useDirectDownload) && (
              <Button
                size="sm"
                variant="outline"
                onClick={resetViewer}
                className="w-full"
              >
                Tentar visualização normal
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Carregando PDF...</p>
        </div>
      </div>
    )
  }

  // Se for download direto, mostrar apenas opções de download
  if (useDirectDownload) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <div className="text-center p-4">
          <FileText className="h-12 w-12 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-medium mb-2">Visualização não disponível</p>
          <p className="text-xs mb-3">O PDF não pode ser exibido diretamente, mas você pode baixá-lo:</p>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(pdfUrl, '_blank')}
              className="w-full"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Abrir em nova aba
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={downloadFile}
              className="w-full"
            >
              <Download className="h-3 w-3 mr-1" />
              Baixar arquivo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetViewer}
              className="w-full"
            >
              Tentar visualização novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Construir URL com parâmetros para evitar bloqueio
  const getSafePdfUrl = () => {
    try {
      const url = new URL(pdfUrl)
      // Adicionar parâmetros para melhor visualização
      url.searchParams.set('view', 'FitH')
      url.searchParams.set('toolbar', '1')
      url.searchParams.set('navpanes', '1')
      url.searchParams.set('scrollbar', '1')
      url.searchParams.set('zoom', 'page-width')
      
      console.log('Final PDF URL:', url.toString())
      return url.toString()
    } catch (err) {
      console.error('Error constructing URL:', err)
      return pdfUrl
    }
  }

  // Tentar usar embed se iframe falhou
  if (useEmbed) {
    return (
      <div className="h-full w-full">
        <embed
          src={getSafePdfUrl()}
          type="application/pdf"
          className="w-full h-full border-0"
          title={`PDF: ${fileName || 'Documento'}`}
          onError={handleEmbedError}
        />
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <iframe
        src={getSafePdfUrl()}
        className="w-full h-full border-0"
        title={`PDF: ${fileName || 'Documento'}`}
        onError={handleIframeError}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
        allow="fullscreen"
      >
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center p-4">
            <FileText className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-medium mb-2">Visualização não disponível</p>
            <p className="text-xs mb-3">Seu navegador não suporta a visualização de PDF inline</p>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(getSafePdfUrl(), '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir em nova aba
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={downloadFile}
                className="w-full"
              >
                <Download className="h-3 w-3 mr-1" />
                Baixar arquivo
              </Button>
            </div>
          </div>
        </div>
      </iframe>
    </div>
  )
}