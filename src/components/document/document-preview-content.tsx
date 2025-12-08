'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2 } from "lucide-react"
import { Document as DocumentType } from '@/types/document'
import { renderAsync } from 'docx-preview'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface DocumentPreviewContentProps {
    document: DocumentType
    zoomLevel: number
    pageNumber: number
    onLoadSuccess: (data: { numPages: number }) => void
    onLoadError: (error: Error) => void
    onDocxLoad: () => void
    onDocxError: (error: string) => void
}

export function DocumentPreviewContent({
    document,
    zoomLevel,
    pageNumber,
    onLoadSuccess,
    onLoadError,
    onDocxLoad,
    onDocxError
}: DocumentPreviewContentProps) {
    const [isDocxLoading, setIsDocxLoading] = useState(false)
    const docxContainerRef = useRef<HTMLDivElement>(null)

    const isPdf = document.fileType === 'pdf'
    const isDocx = document.fileType === 'docx' || document.fileType === 'doc'

    // Initialize PDF.js worker on client side only
    useEffect(() => {
        if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }
    }, [])

    // Load DOCX
    useEffect(() => {
        if (isDocx && document.fileUrl) {
            setIsDocxLoading(true)

            const absoluteUrl = document.fileUrl.startsWith('http')
                ? document.fileUrl
                : `${window.location.origin}${document.fileUrl}`

            fetch(absoluteUrl)
                .then(res => {
                    if (!res.ok) throw new Error("Falha ao baixar arquivo")
                    return res.blob()
                })
                .then(blob => {
                    if (docxContainerRef.current) {
                        docxContainerRef.current.innerHTML = ''
                        return renderAsync(blob, docxContainerRef.current, undefined, {
                            inWrapper: false,
                            ignoreWidth: false,
                            ignoreHeight: false,
                            className: 'docx_viewer',
                        })
                    }
                })
                .then(() => {
                    setIsDocxLoading(false)
                    onDocxLoad()
                })
                .catch(err => {
                    console.error("Erro DOCX:", err)
                    setIsDocxLoading(false)
                    onDocxError("Não foi possível renderizar o arquivo Word. Tente baixá-lo.")
                })
        }
    }, [isDocx, document.fileUrl])

    return (
        <div
            className="transition-transform duration-200 ease-linear origin-top shadow-2xl"
            style={{
                transform: `scale(${zoomLevel / 100})`,
            }}
        >
            {/* PDF RENDERER */}
            {isPdf && (
                <Document
                    file={document.fileUrl}
                    onLoadSuccess={onLoadSuccess}
                    onLoadError={onLoadError}
                    loading={null}
                    className="bg-white"
                >
                    <Page
                        pageNumber={pageNumber}
                        className="bg-white shadow-lg"
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={900}
                    />
                </Document>
            )}

            {/* DOCX RENDERER */}
            {isDocx && (
                <div
                    ref={docxContainerRef}
                    className="bg-white shadow-lg min-h-[1100px] min-w-[850px] p-0"
                >
                    {isDocxLoading && (
                        <div className="flex items-center justify-center h-[200px] text-gray-500">
                            <Loader2 className="animate-spin h-8 w-8 mb-2" />
                        </div>
                    )}
                </div>
            )}

            {/* IMAGE RENDERER */}
            {!isPdf && !isDocx && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(document.fileType || '') && (
                <img
                    src={document.fileUrl}
                    alt="Preview"
                    className="max-w-full h-auto bg-white shadow-lg"
                />
            )}
        </div>
    )
}
