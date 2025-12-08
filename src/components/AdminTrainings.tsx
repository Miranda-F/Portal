'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { FileText, Search, Plus, Edit, Trash2, Loader2, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

interface AdminTrainingsProps {
  trainings: any[]
  users: any[]
  sectors: any[]
  onTrainingUpdate: () => void
}

export default function AdminTrainings({
  trainings,
  users,
  sectors,
  onTrainingUpdate
}: AdminTrainingsProps) {
  
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal states
  const [isCreateTrainingModalOpen, setIsCreateTrainingModalOpen] = useState(false)
  const [isEditTrainingModalOpen, setIsEditTrainingModalOpen] = useState(false)
  const [isDeleteTrainingModalOpen, setIsDeleteTrainingModalOpen] = useState(false)
  const [isSavingTraining, setIsSavingTraining] = useState(false)
  const [isDeletingTraining, setIsDeletingTraining] = useState(false)
  
  // Form states
  const [editingTraining, setEditingTraining] = useState<any>(null)
  const [trainingToDelete, setTrainingToDelete] = useState<any>(null)
  const [trainingForm, setTrainingForm] = useState({
    collaborator: '',
    training: '',
    sector: '',
    deadline: '',
    status: 'No Prazo'
  })

  const filteredTrainings = trainings.filter(training => 
    training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.collaborator?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.sector?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateTraining = () => {
    setEditingTraining(null)
    setTrainingForm({
      collaborator: '',
      training: '',
      sector: '',
      deadline: '',
      status: 'No Prazo'
    })
    setIsCreateTrainingModalOpen(true)
  }

  const handleEditTraining = (training: any) => {
    setEditingTraining(training)
    setTrainingForm({
      collaborator: training.collaboratorId || '',
      training: training.title,
      sector: training.sectorId || '',
      deadline: training.deadline ? new Date(training.deadline).toISOString().split('T')[0] : '',
      status: training.status === 'VALID' ? 'No Prazo' : 
             training.status === 'EXPIRED' ? 'Vencido' : 'Vence no Mês'
    })
    setIsEditTrainingModalOpen(true)
  }

  const handleDeleteTraining = (training: any) => {
    setTrainingToDelete(training)
    setIsDeleteTrainingModalOpen(true)
  }

  const handleSaveTraining = async () => {
    if (!trainingForm.collaborator || !trainingForm.training || !trainingForm.deadline) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsSavingTraining(true)
    try {
      const url = editingTraining ? `/api/admin/trainings/${editingTraining.id}` : '/api/admin/trainings'
      const method = editingTraining ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          collaboratorId: trainingForm.collaborator,
          title: trainingForm.training,
          sectorId: trainingForm.sector,
          deadline: trainingForm.deadline,
          status: trainingForm.status === 'No Prazo' ? 'VALID' : 
                 trainingForm.status === 'Vencido' ? 'EXPIRED' : 'PENDING'
        }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: editingTraining ? "Treinamento atualizado com sucesso." : "Treinamento criado com sucesso.",
        })
        setIsCreateTrainingModalOpen(false)
        setIsEditTrainingModalOpen(false)
        onTrainingUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível salvar o treinamento.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error saving training:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o treinamento.",
        variant: "destructive",
      })
    } finally {
      setIsSavingTraining(false)
    }
  }

  const confirmDeleteTraining = async () => {
    if (!trainingToDelete) return

    setIsDeletingTraining(true)
    try {
      const response = await fetch(`/api/admin/trainings/${trainingToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Treinamento excluído com sucesso.",
        })
        setIsDeleteTrainingModalOpen(false)
        onTrainingUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível excluir o treinamento.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting training:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o treinamento.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingTraining(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VALID':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALID':
        return <Badge className="bg-green-100 text-green-800">No Prazo</Badge>
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Vence no Mês</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Gerenciamento de Treinamentos</h2>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar treinamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={handleCreateTraining}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Treinamento
        </Button>
      </div>

      {/* Trainings List */}
      <Card>
        <CardHeader>
          <CardTitle>Treinamentos</CardTitle>
          <CardDescription>Gerencie os treinamentos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTrainings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum treinamento encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrainings.map((training) => (
                <Card key={training.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(training.status)}
                          <CardTitle className="font-medium">{training.title}</CardTitle>
                          {getStatusBadge(training.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Colaborador: {training.collaborator?.name || 'N/A'}</span>
                          <span>Setor: {training.sector?.name || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTraining(training)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTraining(training)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Data de Vencimento:</strong>{' '}
                        {training.deadline ? new Date(training.deadline).toLocaleDateString() : 'N/A'}
                      </div>
                      {training.description && (
                        <div className="text-sm text-muted-foreground">
                          {training.description}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Training Modal */}
      <Dialog open={isCreateTrainingModalOpen || isEditTrainingModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateTrainingModalOpen(false)
          setIsEditTrainingModalOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTraining ? "Editar Treinamento" : "Novo Treinamento"}</DialogTitle>
            <DialogDescription>
              {editingTraining ? "Atualize as informações do treinamento." : "Preencha as informações para criar um novo treinamento."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collaborator" className="text-right">
                Colaborador
              </Label>
              <Select value={trainingForm.collaborator} onValueChange={(value) => setTrainingForm({...trainingForm, collaborator: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="training" className="text-right">
                Treinamento
              </Label>
              <Input
                id="training"
                value={trainingForm.training}
                onChange={(e) => setTrainingForm({...trainingForm, training: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sector" className="text-right">
                Setor
              </Label>
              <Select value={trainingForm.sector} onValueChange={(value) => setTrainingForm({...trainingForm, sector: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">
                Vencimento
              </Label>
              <Input
                id="deadline"
                type="date"
                value={trainingForm.deadline}
                onChange={(e) => setTrainingForm({...trainingForm, deadline: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={trainingForm.status} onValueChange={(value) => setTrainingForm({...trainingForm, status: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No Prazo">No Prazo</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Vence no Mês">Vence no Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveTraining} disabled={isSavingTraining}>
              {isSavingTraining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Training Modal */}
      <Dialog open={isDeleteTrainingModalOpen} onOpenChange={setIsDeleteTrainingModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Treinamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este treinamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteTrainingModalOpen(false)} disabled={isDeletingTraining}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTraining} disabled={isDeletingTraining}>
              {isDeletingTraining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir Treinamento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}