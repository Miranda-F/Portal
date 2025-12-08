'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Lock, FileUp, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface VerifyFileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  onConfirm: () => Promise<void>
}

export function VerifyFileUploadModal({
  isOpen,
  onClose,
  fileName,
  onConfirm
}: VerifyFileUploadModalProps) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Preencher automaticamente o email quando o modal abrir
  useEffect(() => {
    if (isOpen && user?.email) {
      setEmail(user.email)
    }
  }, [isOpen, user?.email])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setError(null)
    setIsLoading(false)
    setIsVerifying(false)
    onClose()
  }

  const handleVerifyCredentials = async () => {
    if (!email || !password) {
      setError('Por favor, informe o email e a senha.')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Credenciais inválidas')
      }

      // Credenciais verificadas, prosseguir com a confirmação
      setIsVerifying(false)
      await handleConfirm()
    } catch (err) {
      setIsVerifying(false)
      setError(err instanceof Error ? err.message : 'Erro ao verificar credenciais. Tente novamente.')
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await onConfirm()
      handleClose()
    } catch (err) {
      setIsLoading(false)
      setError(err instanceof Error ? err.message : 'Erro ao confirmar. Tente novamente.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-black dark:text-white" />
            Confirmação de Anexo de Arquivo
          </DialogTitle>
          <DialogDescription>
            Para anexar um novo arquivo ao documento, é necessário confirmar sua identidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Arquivo a ser anexado</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <FileUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{fileName}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verify-email">Email *</Label>
            <Input
              id="verify-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={isVerifying || isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verify-password">Senha *</Label>
            <Input
              id="verify-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              disabled={isVerifying || isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isVerifying && !isLoading) {
                  handleVerifyCredentials()
                }
              }}
            />
          </div>

          <Alert>
            <AlertDescription className="text-xs text-muted-foreground">
              Ao confirmar, o arquivo atual será substituído pelo novo arquivo. Esta ação não pode ser desfeita.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isVerifying || isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleVerifyCredentials}
            disabled={isVerifying || isLoading || !email || !password}
          >
            {isVerifying || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isVerifying ? 'Verificando...' : 'Confirmando...'}
              </>
            ) : (
              'Confirmar Anexo'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

