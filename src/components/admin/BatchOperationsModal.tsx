'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Users, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useBatchOperations } from '@/hooks/admin/useBatchOperations'

interface BatchOperationsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedUsers: any[]
  onUsersChange: (users: any[]) => void
  onClearSelection: () => void
}

export default function BatchOperationsModal({
  isOpen,
  onClose,
  selectedUsers,
  onUsersChange,
  onClearSelection
}: BatchOperationsModalProps) {
  const [action, setAction] = useState<'approve' | 'delete' | 'update_role'>('approve')
  const [role, setRole] = useState('USER')
  const [approved, setApproved] = useState(true)
  const [confirmAction, setConfirmAction] = useState(false)
  
  const { isProcessing, progress, currentOperation, processBatch } = useBatchOperations()

  const handleProcessBatch = async () => {
    if (!confirmAction) return

    let operations: any[] = []

    switch (action) {
      case 'approve':
        operations = selectedUsers.map(user => ({
          userId: user.id,
          approved
        }))
        break
      case 'delete':
        operations = selectedUsers.map(user => ({
          userId: user.id
        }))
        break
      case 'update_role':
        operations = selectedUsers.map(user => ({
          userId: user.id,
          role
        }))
        break
    }

    const result = await processBatch(operations, action)

    if (result.successful > 0) {
      // Atualizar lista de usuários com os resultados
      const updatedUsers = selectedUsers.map(user => {
        const successResult = result.success.find(s => s.id === user.id)
        if (successResult) {
          return { ...user, ...successResult }
        }
        return user
      })

      // Filtrar usuários deletados
      const remainingUsers = updatedUsers.filter(user => 
        action !== 'delete' || !result.success.find(s => s.id === user.id)
      )

      onUsersChange(remainingUsers)
    }

    if (result.failed === 0) {
      onClearSelection()
      onClose()
    }
  }

  const getActionDescription = () => {
    switch (action) {
      case 'approve':
        return `${approved ? 'Ativar' : 'Desativar'} ${selectedUsers.length} usuário(s)`
      case 'delete':
        return `Excluir ${selectedUsers.length} usuário(s)`
      case 'update_role':
        return `Alterar função para ${role} de ${selectedUsers.length} usuário(s)`
      default:
        return ''
    }
  }

  const getActionColor = () => {
    switch (action) {
      case 'approve':
        return approved ? 'text-green-600' : 'text-orange-600'
      case 'delete':
        return 'text-red-600'
      case 'update_role':
        return 'text-blue-600'
      default:
        return ''
    }
  }

  const canProcess = selectedUsers.length > 0 && !isProcessing

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Operações em Lote</span>
          </DialogTitle>
          <DialogDescription>
            Execute ações em múltiplos usuários simultaneamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Ação */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ação a ser executada</label>
              <Select value={action} onValueChange={(value: any) => setAction(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Ativar/Desativar Usuários</SelectItem>
                  <SelectItem value="delete">Excluir Usuários</SelectItem>
                  <SelectItem value="update_role">Alterar Função</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Configurações específicas por ação */}
            {action === 'approve' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="approved"
                  checked={approved}
                  onCheckedChange={(checked) => setApproved(checked as boolean)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="approved" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Usuários aprovados (desmarque para desativar)
                </label>
              </div>
            )}

            {action === 'update_role' && (
              <div>
                <label className="text-sm font-medium">Nova função</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Lista de usuários selecionados */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Usuários selecionados ({selectedUsers.length})
            </label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {selectedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{user.name}</span>
                  <Badge variant="outline">{user.email}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processando operações...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentOperation && (
                <p className="text-xs text-muted-foreground">{currentOperation}</p>
              )}
            </div>
          )}

          {/* Confirmação */}
          {!isProcessing && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Confirmação necessária</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Você está prestes a <span className={getActionColor()}>{getActionDescription()}</span>.
                  Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm"
                  checked={confirmAction}
                  onCheckedChange={(checked) => setConfirmAction(checked as boolean)}
                  className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                />
                <label htmlFor="confirm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Eu confirmo que desejo executar esta operação em lote
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleProcessBatch}
            disabled={!canProcess || !confirmAction}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Executar Lote
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
