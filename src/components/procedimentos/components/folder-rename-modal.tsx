'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Folder } from "lucide-react"

interface FolderRenameModalProps {
  isOpen: boolean
  onClose: () => void
  currentPath: string
  currentName: string
  onConfirm: (newName: string) => Promise<void>
  isRenaming: boolean
}

export function FolderRenameModal({
  isOpen,
  onClose,
  currentPath,
  currentName,
  onConfirm,
  isRenaming
}: FolderRenameModalProps) {
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName)
    }
  }, [isOpen, currentName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || newName.trim() === currentName) return
    
    await onConfirm(newName.trim())
  }

  const handleClose = () => {
    setNewName('')
    onClose()
  }

  const getParentPath = () => {
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    return parts.join('/') || 'Root'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5 text-primary" />
            <span>Renomear Pasta</span>
          </DialogTitle>
          <DialogDescription>
            Renomeie a pasta "{currentName}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newName">Novo Nome *</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Digite o novo nome"
                disabled={isRenaming}
                autoFocus
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>Caminho completo: {getParentPath()}/{newName || '...'}</p>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={handleClose} disabled={isRenaming}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={!newName.trim() || newName.trim() === currentName || isRenaming}
            >
              {isRenaming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Renomear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}






