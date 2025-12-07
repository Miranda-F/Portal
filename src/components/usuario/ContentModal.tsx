"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink } from "lucide-react"
import { Procedure } from "@/types/usuario"
import { useState } from "react"
import dynamic from "next/dynamic"

const DocumentPreviewModal = dynamic(
  () => import("@/components/document/document-preview-modal").then((mod) => mod.DocumentPreviewModal),
  { ssr: false }
)

interface ContentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProcedure: Procedure | null
}

export function ContentModal({
  isOpen,
  onClose,
  selectedProcedure
}: ContentModalProps) {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const truncateFileName = (fileName: string, maxLength: number = 30) => {
    if (!fileName || fileName.length <= maxLength) {
      return fileName
    }

    const extension = fileName.split('.').pop()
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
    const truncatedName = nameWithoutExt.substring(0, maxLength)

    return `${truncatedName}...${extension ? `.${extension}` : ''}`
  }

  const getProcedureTypeLabel = (type: string) => {
    switch (type) {
      case 'MANAGEMENT_PROCEDURE': return 'Procedimento de Gestão'
      case 'WORK_INSTRUCTION': return 'Instrução de Trabalho'
      default: return type
    }
  }

  const getFileType = (fileName?: string | null) => {
    if (!fileName) return 'pdf'
    const extension = fileName.split('.').pop()?.toLowerCase()
    return extension === 'docx' || extension === 'doc' ? 'docx' : 'pdf'
  }

  const getFileTypeLabel = (fileName?: string | null) => {
    const fileType = getFileType(fileName)
    return fileType === 'docx' ? 'Visualizar Documento' : 'Visualizar PDF'
  }

  const handleViewPdf = (procedure: Procedure) => {
    // converte procedure para formato de documento
    const fileType = getFileType(procedure.fileName)
    const document = {
      id: procedure.id,
      title: procedure.title,
      code: procedure.fileName?.replace(/\.[^/.]+$/, '') || procedure.title.substring(0, 10),
      version: '1.0',
      type: procedure.type === 'MANAGEMENT_PROCEDURE' ? 'management' : 'work_instruction',
      fileUrl: procedure.fileUrl,
      fileType: fileType,
      fileName: procedure.fileName,
      description: procedure.content,
      status: procedure.status === 'PUBLISHED' ? 'active' : 'inactive',
      responsibleSector: procedure.createdBy?.sectorId || 'N/A',
      createdAt: procedure.createdAt,
      updatedAt: procedure.createdAt,
      createdBy: procedure.createdBy?.name || 'N/A'
    }

    setSelectedDocument(document)
    setIsPreviewModalOpen(true)
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-4 border-b bg-muted">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <DialogTitle className="text-lg font-semibold">
                {selectedProcedure?.title || 'Conteúdo do Procedimento'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedProcedure ? getProcedureTypeLabel(selectedProcedure.type) : ''}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col">

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6 bg-background">
            <div className="space-y-4">
              {/* Informações do Procedimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Data de Criação</h4>
                  <p className="text-sm">
                    {selectedProcedure?.createdAt ? formatDate(selectedProcedure.createdAt) : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Criado por</h4>
                  <p className="text-sm">
                    {selectedProcedure?.createdBy?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Setor</h4>
                  <p className="text-sm">
                    {selectedProcedure?.createdBy?.sectorId || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Arquivo</h4>
                  <p className="text-sm">
                    {selectedProcedure?.fileName ? truncateFileName(selectedProcedure.fileName) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Descrição do Conteúdo */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h4>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  {selectedProcedure?.content ? (
                    <div className="text-sm leading-relaxed">
                      {selectedProcedure.content.split('\n').map((line, index) => (
                        <p key={index} className="mb-2 last:mb-0">
                          {line.trim()}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma descrição disponível para este procedimento.</p>
                  )}
                </div>
              </div>

              {/* Ação para abrir arquivo */}
              {selectedProcedure?.fileUrl && (
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      O documento está disponível para visualização. Clique no botão abaixo para visualizá-lo.
                    </p>
                    <Button
                      onClick={() => handleViewPdf(selectedProcedure)}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <FileText className="h-4 w-4" />
                      {getFileTypeLabel(selectedProcedure.fileName)}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* modal de preview do pdf */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
      />
    </Dialog>
  )
}