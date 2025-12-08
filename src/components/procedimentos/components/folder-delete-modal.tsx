'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2, Folder } from "lucide-react"

interface FolderDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  folderPath: string
  folderName: string
  documentCount: number
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

export function FolderDeleteModal({
  isOpen,
  onClose,
  folderPath,
  folderName,
  documentCount,
  onConfirm,
  isDeleting
}: FolderDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Excluir Pasta</span>
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você está prestes a excluir a pasta <strong>{folderName}</strong>.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{folderName}</p>
            </div>
            <p className="text-xs text-muted-foreground">{folderPath}</p>
            {documentCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Esta pasta contém {documentCount} documento{documentCount !== 1 ? 's' : ''}.
              </p>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            {folderPath.includes('Certificados') 
              ? 'Todos os documentos nesta pasta serão movidos para a pasta de certificado correspondente (Formulários, Procedimentos, Políticas, etc.). As subpastas também serão excluídas.'
              : 'Todos os documentos nesta pasta serão movidos para a pasta pai ou ficarão sem pasta. As subpastas também serão excluídas.'}
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir Pasta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


