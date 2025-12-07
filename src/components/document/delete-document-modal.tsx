'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Document } from '@/types/document'

interface DeleteDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteDocumentModal({
  isOpen,
  onClose,
  document,
  onConfirm,
  isDeleting
}: DeleteDocumentModalProps) {
  if (!document) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Excluir Documento</span>
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o documento.
          </DialogDescription>
        </DialogHeader>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você está prestes a excluir o documento <strong>{document.code}</strong> - {document.title}.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Por favor, confirme que você deseja continuar com a exclusão:
          </p>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium">{document.code}</p>
            <p className="text-sm">{document.title}</p>
            <p className="text-xs text-muted-foreground">Versão: {document.version}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir Documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}