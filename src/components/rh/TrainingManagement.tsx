"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  PauseCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTrainings } from "@/hooks/use-rh"
import { Training } from "@/types/rh"

interface TrainingManagementProps {
  activeTab: string
}

export default function TrainingManagement({ activeTab }: TrainingManagementProps) {
  const { toast } = useToast()
  const { trainings, loading, loadTrainings } = useTrainings()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateTrainingModalOpen, setIsCreateTrainingModalOpen] = useState(false)
  const [isEditTrainingModalOpen, setIsEditTrainingModalOpen] = useState(false)
  const [isDeleteTrainingModalOpen, setIsDeleteTrainingModalOpen] = useState(false)
  const [isSavingTraining, setIsSavingTraining] = useState(false)
  const [isDeletingTraining, setIsDeletingTraining] = useState(false)
  const [trainingToDelete, setTrainingToDelete] = useState<Training | null>(null)
  const [editingTraining, setEditingTraining] = useState<Training | null>(null)
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    modality: 'ONLINE',
    status: 'PLANNED',
    startDate: '',
    endDate: '',
    participants: [] as string[]
  })

  useEffect(() => {
    if (activeTab === "treinamento") {
      loadTrainings()
    }
  }, [activeTab])

  const handleCreateTraining = () => {
    setEditingTraining(null)
    setTrainingForm({
      title: '',
      description: '',
      instructor: '',
      duration: '',
      modality: 'ONLINE',
      status: 'PLANNED',
      startDate: '',
      endDate: '',
      participants: []
    })
    setIsCreateTrainingModalOpen(true)
  }

  const handleEditTraining = (training: Training) => {
    setEditingTraining(training)
    setTrainingForm({
      title: training.title,
      description: training.description || '',
      instructor: training.instructor || '',
      duration: training.duration?.toString() || '',
      modality: training.modality,
      status: training.status,
      startDate: training.startDate || '',
      endDate: training.endDate || '',
      participants: training.participants || []
    })
    setIsEditTrainingModalOpen(true)
  }

  const handleDeleteTraining = (training: Training) => {
    setTrainingToDelete(training)
    setIsDeleteTrainingModalOpen(true)
  }

  const handleSaveTraining = async () => {
    if (!trainingForm.title || !trainingForm.startDate) {
      toast({
        title: "Erro",
        description: "Título e data de início são obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSavingTraining(true)
      
      const trainingData = {
        title: trainingForm.title,
        description: trainingForm.description,
        instructor: trainingForm.instructor,
        duration: trainingForm.duration ? parseInt(trainingForm.duration) : undefined,
        modality: trainingForm.modality,
        status: trainingForm.status,
        startDate: trainingForm.startDate,
        endDate: trainingForm.endDate,
        participants: trainingForm.participants
      }
      
      // Mock API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingTraining) {
        toast({
          title: "Sucesso",
          description: "Treinamento atualizado com sucesso",
        })
        setIsEditTrainingModalOpen(false)
      } else {
        toast({
          title: "Sucesso",
          description: "Treinamento criado com sucesso",
        })
        setIsCreateTrainingModalOpen(false)
      }
      
      // Reload trainings
      loadTrainings()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar treinamento",
        variant: "destructive",
      })
    } finally {
      setIsSavingTraining(false)
    }
  }

  const confirmDeleteTraining = async () => {
    if (trainingToDelete) {
      try {
        setIsDeletingTraining(true)
        
        // Mock API call - replace with actual API integration
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        toast({
          title: "Sucesso",
          description: "Treinamento excluído com sucesso",
        })
        setIsDeleteTrainingModalOpen(false)
        setTrainingToDelete(null)
        
        // Reload trainings
        loadTrainings()
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Falha ao excluir treinamento",
          variant: "destructive",
        })
      } finally {
        setIsDeletingTraining(false)
      }
    }
  }

  const cancelDeleteTraining = () => {
    setIsDeleteTrainingModalOpen(false)
    setTrainingToDelete(null)
  }

  const filteredTrainings = Array.isArray(trainings) ? trainings.filter(training =>
    training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const getModalityLabel = (modality: string) => {
    switch (modality) {
      case 'ONLINE': return 'Online'
      case 'IN_PERSON': return 'Presencial'
      case 'HYBRID': return 'Híbrido'
      default: return modality
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return <Badge className="bg-blue-100 text-blue-800">Planejado</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-green-100 text-green-800">Em Andamento</Badge>
      case 'COMPLETED':
        return <Badge className="bg-gray-100 text-gray-800">Concluído</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'ONLINE': return <MapPin className="h-4 w-4 text-blue-600" />
      case 'IN_PERSON': return <MapPin className="h-4 w-4 text-green-600" />
      case 'HYBRID': return <MapPin className="h-4 w-4 text-purple-600" />
      default: return <MapPin className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Treinamentos</h2>
          <p className="text-muted-foreground">
            Gerencie os treinamentos e capacitações dos colaboradores
          </p>
        </div>
        <Button onClick={handleCreateTraining}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Treinamento
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar treinamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Treinamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(trainings) ? trainings.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              +3% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(trainings) ? trainings.filter(t => t.status === 'IN_PROGRESS').length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Treinamentos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planejados</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(trainings) ? trainings.filter(t => t.status === 'PLANNED').length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando início
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(trainings) ? trainings.filter(t => t.status === 'COMPLETED').length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Treinamentos finalizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trainings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Treinamentos Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os treinamentos disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Instrutor</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{training.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {training.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{training.instructor || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getModalityIcon(training.modality)}
                        <span className="ml-2">{getModalityLabel(training.modality)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(training.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {training.startDate ? new Date(training.startDate).toLocaleDateString('pt-BR') : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        {training.duration ? `${training.duration}h` : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTraining(training)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar treinamento</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTraining(training)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir treinamento</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Training Modal */}
      <Dialog open={isCreateTrainingModalOpen} onOpenChange={setIsCreateTrainingModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Treinamento</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo treinamento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Treinamento *</Label>
              <Input
                id="title"
                value={trainingForm.title}
                onChange={(e) => setTrainingForm({...trainingForm, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={trainingForm.description}
                onChange={(e) => setTrainingForm({...trainingForm, description: e.target.value})}
                placeholder="Descreva o conteúdo e objetivos do treinamento..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instructor">Instrutor</Label>
                <Input
                  id="instructor"
                  value={trainingForm.instructor}
                  onChange={(e) => setTrainingForm({...trainingForm, instructor: e.target.value})}
                  placeholder="Nome do instrutor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (horas)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={trainingForm.duration}
                  onChange={(e) => setTrainingForm({...trainingForm, duration: e.target.value})}
                  placeholder="Ex: 8"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={trainingForm.startDate}
                  onChange={(e) => setTrainingForm({...trainingForm, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Término</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={trainingForm.endDate}
                  onChange={(e) => setTrainingForm({...trainingForm, endDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modality">Modalidade</Label>
                <Select 
                  value={trainingForm.modality} 
                  onValueChange={(value: any) => setTrainingForm({...trainingForm, modality: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="IN_PERSON">Presencial</SelectItem>
                    <SelectItem value="HYBRID">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={trainingForm.status} 
                  onValueChange={(value: any) => setTrainingForm({...trainingForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNED">Planejado</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTrainingModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTraining} disabled={isSavingTraining}>
              {isSavingTraining ? 'Salvando...' : 'Criar Treinamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Training Modal */}
      <Dialog open={isEditTrainingModalOpen} onOpenChange={setIsEditTrainingModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Treinamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do treinamento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título do Treinamento *</Label>
              <Input
                id="edit-title"
                value={trainingForm.title}
                onChange={(e) => setTrainingForm({...trainingForm, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={trainingForm.description}
                onChange={(e) => setTrainingForm({...trainingForm, description: e.target.value})}
                placeholder="Descreva o conteúdo e objetivos do treinamento..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-instructor">Instrutor</Label>
                <Input
                  id="edit-instructor"
                  value={trainingForm.instructor}
                  onChange={(e) => setTrainingForm({...trainingForm, instructor: e.target.value})}
                  placeholder="Nome do instrutor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duração (horas)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={trainingForm.duration}
                  onChange={(e) => setTrainingForm({...trainingForm, duration: e.target.value})}
                  placeholder="Ex: 8"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Data de Início *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={trainingForm.startDate}
                  onChange={(e) => setTrainingForm({...trainingForm, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">Data de Término</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={trainingForm.endDate}
                  onChange={(e) => setTrainingForm({...trainingForm, endDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-modality">Modalidade</Label>
                <Select 
                  value={trainingForm.modality} 
                  onValueChange={(value: any) => setTrainingForm({...trainingForm, modality: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="IN_PERSON">Presencial</SelectItem>
                    <SelectItem value="HYBRID">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={trainingForm.status} 
                  onValueChange={(value: any) => setTrainingForm({...trainingForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNED">Planejado</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTrainingModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTraining} disabled={isSavingTraining}>
              {isSavingTraining ? 'Salvando...' : 'Atualizar Treinamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Training Modal */}
      <Dialog open={isDeleteTrainingModalOpen} onOpenChange={setIsDeleteTrainingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Treinamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o treinamento "{trainingToDelete?.title}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteTraining}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTraining} disabled={isDeletingTraining}>
              {isDeletingTraining ? 'Excluindo...' : 'Excluir Treinamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}