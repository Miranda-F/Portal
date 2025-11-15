'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { DocumentFormData, Sector } from '@/types/document'
import { DocumentForm } from './document-form'

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  formData: DocumentFormData
  setFormData: (data: DocumentFormData) => void
  sectors: Sector[]
  onSubmit: () => void
  isSubmitting: boolean
  isEditing?: boolean
  hasChanges?: boolean // Indica se há alterações no formulário (apenas para edição)
}

export function DocumentModal({
  isOpen,
  onClose,
  title,
  description,
  formData,
  setFormData,
  sectors,
  onSubmit,
  isSubmitting,
  isEditing = false,
  hasChanges = true // Por padrão, permite salvar (para criação)
}: DocumentModalProps) {
  // Na edição, desabilitar o botão se não houver mudanças
  const isSubmitDisabled = isSubmitting || (isEditing && !hasChanges)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DocumentForm
          formData={formData}
          setFormData={setFormData}
          sectors={sectors}
          isEditing={isEditing}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitDisabled}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Atualizar Documento' : 'Criar Documento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}