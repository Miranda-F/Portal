"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText, Eye, AlertCircle, AlertTriangle, CheckCircle, File, FileSpreadsheet, Download, BookOpen
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Procedure } from "@/types/usuario"
import { ContentModal } from "@/components/usuario/ContentModal"
import { useState } from "react"
import dynamic from "next/dynamic"

const DocumentPreviewModal = dynamic(
  () => import("@/components/document/document-preview-modal").then((mod) => mod.DocumentPreviewModal),
  { ssr: false }
)

interface ProceduresDisplayProps {
  procedures: Procedure[]
  viewMode: "cards" | "list"
}

export function ProceduresDisplay({
  procedures,
  viewMode // We keep the prop to avoid breaking parent, but ignore it for now or use it if user wants toggles. Instructions said remove card view.
}: ProceduresDisplayProps) {
  const [showContentModal, setShowContentModal] = useState(false)
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null)

  // Document Reader State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  const getProcedureValidityStatus = (procedure: Procedure) => {
    // Placeholder logic from original file
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getFileType = (fileName?: string | null) => {
    if (!fileName) return 'pdf'
    const extension = fileName.split('.').pop()?.toLowerCase()
    return extension === 'docx' || extension === 'doc' ? 'docx' : 'pdf'
  }

  const handleReadDocument = (procedure: Procedure) => {
    if (procedure.fileUrl) {
      const fileType = getFileType(procedure.fileName)
      const document = {
        id: procedure.id,
        title: procedure.title,
        code: procedure.fileName?.replace(/\.[^/.]+$/, '') || procedure.title.substring(0, 10),
        fileUrl: procedure.fileUrl,
        fileType: fileType,
        fileName: procedure.fileName,
      }
      setSelectedDocument(document)
      setIsPreviewModalOpen(true)
    }
  }

  const openContentModal = (procedure: Procedure) => {
    setSelectedProcedure(procedure)
    setShowContentModal(true)
  }

  const closeContentModal = () => {
    setShowContentModal(false)
    setSelectedProcedure(null)
  }

  if (procedures.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
          <p className="text-muted-foreground text-center">
            Não há documentos disponíveis no momento.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="rounded-md border bg-white dark:bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {procedures.map((procedure) => (
              <TableRow key={procedure.id}>
                {/* Nome / Título */}
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{procedure.title}</span>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Validity Badges if needed */}
                      {procedure.status === 'PUBLISHED' && (() => {
                        const validityStatus = getProcedureValidityStatus(procedure)
                        if (!validityStatus) return null
                        return (
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 flex items-center gap-1">
                            {validityStatus.status === 'expired' && <AlertCircle className="h-3 w-3 text-red-500" />}
                            {validityStatus.status === 'warning' && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                            {validityStatus.status === 'valid' && <CheckCircle className="h-3 w-3 text-green-500" />}
                            Vence em {validityStatus.days} dias
                          </Badge>
                        )
                      })()}
                    </div>
                  </div>
                </TableCell>

                {/* Tipo */}
                <TableCell>
                  <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {procedure.type === 'MANAGEMENT_PROCEDURE' ? 'Procedimento de Gestão' : 'Instrução de Trabalho'}
                  </Badge>
                </TableCell>

                {/* Data */}
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(procedure.createdAt)}
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">


                    {procedure.fileUrl && (
                      <Button
                        variant="default" // Primary color for "Read" action
                        size="sm"
                        onClick={() => handleReadDocument(procedure)}
                        title="Ler Documento"
                        className="h-8 gap-2 bg-[#0f4c81] hover:bg-[#0d4270] text-white px-3"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span className="text-xs font-semibold">Ler Documento</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ContentModal
        isOpen={showContentModal}
        onClose={closeContentModal}
        selectedProcedure={selectedProcedure}
      />

      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
      />
    </>
  )
}