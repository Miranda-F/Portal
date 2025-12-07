'use client'

import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Loader2 } from "lucide-react"

// Set PDF Worker - This only runs when this specific file is loaded on the client
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerClientProps {
    url: string
    pageNumber: number
    zoomLevel: number
    onLoadSuccess: (data: { numPages: number }) => void
    onLoadError: (error: Error) => void
}

export default function PdfViewerClient({
    url,
    pageNumber,
    zoomLevel,
    onLoadSuccess,
    onLoadError
}: PdfViewerClientProps) {
    return (
        <Document
            file={url}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={
                <div className="flex items-center gap-2 text-white">
                    <Loader2 className="animate-spin h-6 w-6" />
                    <span>Carregando PDF...</span>
                </div>
            }
            className="bg-white"
        >
            <Page
                pageNumber={pageNumber}
                className="bg-white shadow-lg"
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={900} // Base width, scaled by transform in parent
            />
        </Document>
    )
}
