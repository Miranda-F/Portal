'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export interface GenericModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

/**
 * Componente de Modal genérico e reutilizável
 * 
 * @example
 * <GenericModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Título do Modal"
 *   description="Descrição opcional"
 *   size="lg"
 * >
 *   <div>Conteúdo do modal</div>
 * </GenericModal>
 */
export function GenericModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = ''
}: GenericModalProps) {
  // Mapeamento de tamanhos para classes
  const sizeClasses = {
    sm: 'sm:max-w-[400px]',
    md: 'sm:max-w-[500px]',
    lg: 'sm:max-w-[600px]',
    xl: 'sm:max-w-[800px]',
    '2xl': 'sm:max-w-[1000px]',
    '4xl': 'sm:max-w-[1400px]',
    full: 'sm:max-w-[95vw] max-h-[95vh]'
  }

  const sizeClass = sizeClasses[size] || sizeClasses.md

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent 
        className={`${sizeClass} max-h-[90vh] overflow-y-auto ${className}`}
        onPointerDownOutside={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (!closeOnEscape) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2">
                  {description}
                </DialogDescription>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="mt-6">
          {children}
        </div>

        {footer && (
          <DialogFooter className="mt-6">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Botões comuns para uso no footer do modal
 */
export interface ModalFooterProps {
  onCancel?: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  confirmDisabled?: boolean
  loading?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
}

export function ModalFooter({
  onCancel,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmDisabled = false,
  loading = false,
  variant = 'default'
}: ModalFooterProps) {
  return (
    <div className="flex justify-end space-x-2">
      {onCancel && (
        <Button variant="outline" onClick={onCancel}>
          {cancelText}
        </Button>
      )}
      {onConfirm && (
        <Button 
          onClick={onConfirm} 
          disabled={confirmDisabled || loading}
          variant={variant}
        >
          {loading ? 'Processando...' : confirmText}
        </Button>
      )}
    </div>
  )
}

/**
 * Modal de confirmação simples
 */
export interface ConfirmModalProps extends Omit<GenericModalProps, 'children' | 'footer'> {
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'default' | 'destructive'
  message?: string
}

export function ConfirmModal({
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'default',
  message = 'Tem certeza que deseja continuar?',
  ...props
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm()
    props.onClose()
  }

  return (
    <GenericModal
      {...props}
      footer={
        <ModalFooter
          onConfirm={handleConfirm}
          onCancel={props.onClose}
          confirmText={confirmText}
          cancelText={cancelText}
          variant={confirmVariant}
        />
      }
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </GenericModal>
  )
}