'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, AlertTriangle, Lock } from 'lucide-react'
import { Document } from '@/types/document'
import { formatDate } from './utils/document-utils'
import { useAuth } from '@/hooks/use-auth'

interface RescheduleDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  onConfirm: (documentId: string, newDate: string) => Promise<void>
}

export function RescheduleDocumentModal({
  isOpen,
  onClose,
  document,
  onConfirm
}: RescheduleDocumentModalProps) {
  const { user } = useAuth()
  const [newDate, setNewDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'input' | 'confirm'>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inicializar a data com a data de vencimento atual do documento quando o modal abrir
  useEffect(() => {
    // Só inicializar quando o modal estiver aberto E o documento estiver disponível
    if (!isOpen || !document) {
      return
    }

    // Sempre resetar para o passo de input quando o modal abrir
    setStep('input')
    setError(null)

    if (document.nextReviewDate) {
      // Formatar a data de vencimento atual para o formato YYYY-MM-DD
      const currentExpiryDate = document.nextReviewDate
      let dateStr: string
      
      // nextReviewDate é sempre uma string no formato YYYY-MM-DD ou ISO string
      if (typeof currentExpiryDate === 'string') {
        // Extrair apenas a parte da data (ignorar hora se houver)
        // Pode ser "2025-12-09" ou "2025-12-09T00:00:00.000Z"
        dateStr = currentExpiryDate.split('T')[0]
      } else {
        // Se for um Date (caso raro), converter para YYYY-MM-DD usando UTC
        const date = new Date(currentExpiryDate)
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        dateStr = `${year}-${month}-${day}`
      }
      
      // Verificar se a data está no formato correto (YYYY-MM-DD)
      if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        setNewDate(dateStr)
      } else {
        // Se a data não for válida, usar a data de hoje como fallback
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        setNewDate(`${year}-${month}-${day}`)
      }
    } else {
      // Se não há data de vencimento, usar a data de hoje
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      setNewDate(`${year}-${month}-${day}`)
    }
  }, [isOpen, document?.id, document?.nextReviewDate])

  // Preencher automaticamente o email quando o modal abrir
  useEffect(() => {
    if (isOpen && user?.email && step === 'confirm') {
      setEmail(user.email)
    }
  }, [isOpen, user?.email, step])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    }
  }

  const handleClose = () => {
    // Resetar tudo quando fechar o modal
    setNewDate('')
    setEmail('')
    setPassword('')
    setStep('input')
    setError(null)
    setIsLoading(false)
    setIsVerifying(false)
    onClose()
  }

  const handleNext = () => {
    setError(null)
    
    if (!newDate) {
      setError('Por favor, informe a nova data de vencimento.')
      return
    }

    const selectedDate = new Date(newDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      setError('A nova data de vencimento não pode ser anterior à data atual.')
      return
    }

    if (document?.nextReviewDate) {
      const currentDate = new Date(document.nextReviewDate)
      currentDate.setHours(0, 0, 0, 0)
      
      if (selectedDate.getTime() === currentDate.getTime()) {
        setError('A nova data deve ser diferente da data atual de vencimento.')
        return
      }
    }

    setStep('confirm')
  }

  const handleBack = () => {
    setStep('input')
    setEmail('')
    setPassword('')
    setError(null)
  }

  const handleVerifyCredentials = async () => {
    if (!email || !password) {
      setError('Por favor, informe o email e a senha.')
      return
    }

    if (!user || email !== user.email) {
      setError('O email deve corresponder ao usuário logado.')
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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Credenciais inválidas')
      }

      // Credenciais verificadas, prosseguir com o reaprazamento
      await handleConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar credenciais. Tente novamente.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleConfirm = async () => {
    if (!document) return

    setIsLoading(true)
    setError(null)

    try {
      await onConfirm(document.id, newDate)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reaprazar documento. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysDifference = () => {
    if (!document?.nextReviewDate || !newDate) return null
    
    const currentDate = new Date(document.nextReviewDate)
    const selectedDate = new Date(newDate)
    const diffTime = selectedDate.getTime() - currentDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const daysDifference = getDaysDifference()

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reaprazar Documento
          </DialogTitle>
          <DialogDescription>
            {step === 'input' 
              ? 'Informe a nova data de vencimento/revisão para o documento.'
              : 'Confirme sua identidade informando seu email e senha para finalizar o reaprazamento.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'input' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="newDate">Nova Data de Vencimento/Revisão *</Label>
                <Input
                  id="newDate"
                  type="date"
                  value={newDate || ''}
                  onChange={(e) => {
                    setNewDate(e.target.value)
                    setError(null)
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                  key={`date-input-${document?.id}-${document?.nextReviewDate}`} // Force re-render quando documento mudar
                />
                {document?.nextReviewDate && (
                  <p className="text-xs text-muted-foreground">
                    Data atual: <strong>{formatDate(document.nextReviewDate)}</strong>
                  </p>
                )}
              </div>

              {daysDifference !== null && (
                <Alert className={daysDifference >= 0 ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {daysDifference >= 0 
                      ? `A nova data é ${daysDifference} dia(s) após a data atual.`
                      : `A nova data é ${Math.abs(daysDifference)} dia(s) antes da data atual.`}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <>
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Confirmação de Dupla Checagem</strong>
                  <br />
                  Por favor, informe seu email e senha para confirmar a alteração.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError(null)
                    }}
                    placeholder={user?.email || 'seu@email.com'}
                    className="w-full"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    placeholder="Digite sua senha"
                    className="w-full"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Resumo da Alteração:</p>
                <div className="text-sm space-y-1">
                  <p><strong>Documento:</strong> {document?.title}</p>
                  <p><strong>Data Atual:</strong> {document?.nextReviewDate ? formatDate(document.nextReviewDate) : '—'}</p>
                  <p><strong>Nova Data:</strong> {formatDate(newDate)}</p>
                  {daysDifference !== null && (
                    <p><strong>Diferença:</strong> {daysDifference >= 0 ? '+' : ''}{daysDifference} dia(s)</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {step === 'input' ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleNext}>
                Próximo
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                Voltar
              </Button>
              <Button 
                onClick={handleVerifyCredentials} 
                disabled={isLoading || isVerifying || !email || !password}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading || isVerifying ? 'Verificando...' : 'Confirmar Reaprazamento'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

