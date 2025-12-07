'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Folder } from "lucide-react"

interface FolderCreateModalProps {
  isOpen: boolean
  onClose: () => void
  parentPath: string
  onConfirm: (folderName: string) => Promise<void>
  isCreating: boolean
}

export function FolderCreateModal({
  isOpen,
  onClose,
  parentPath,
  onConfirm,
  isCreating
}: FolderCreateModalProps) {
  const [folderName, setFolderName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return
    
    await onConfirm(folderName.trim())
    setFolderName('')
  }

  const handleClose = () => {
    setFolderName('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5 text-primary" />
            <span>Criar Nova Pasta</span>
          </DialogTitle>
          <DialogDescription>
            Crie uma nova pasta dentro de "{parentPath.split('/').pop() || 'Root'}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Nome da Pasta *</Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Digite o nome da pasta"
                disabled={isCreating}
                autoFocus
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>Caminho completo: {parentPath}/{folderName || '...'}</p>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={!folderName.trim() || isCreating}
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Pasta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}






