'use client'

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
} from "@/components/ui/dialog"
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
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  AlertTriangle,
  User,
  Building
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

// Interface para o modelo Training do Prisma
interface Training {
  id: string
  title: string
  deadline: string
  status: 'VALID' | 'EXPIRED' | 'PENDING'
  createdAt: string
  updatedAt: string
  collaborator: {
    id: string
    name: string
    email: string
  }
  sector?: {
    id: string
    name: string
  }
}

interface TrainingFormData {
  collaborator: string
  training: string
  sector: string
  deadline: string
  status: 'VALID' | 'EXPIRED' | 'PENDING'
}

export default function TreinamentosPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [trainings, setTrainings] = useState<Training[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [sectors, setSectors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Form data
  const [trainingForm, setTrainingForm] = useState<TrainingFormData>({
    collaborator: '',
    training: '',
    sector: 'none',
    deadline: '',
    status: 'VALID'
  })
  
  const [editingTraining, setEditingTraining] = useState<Training | null>(null)
  const [trainingToDelete, setTrainingToDelete] = useState<Training | null>(null)

  useEffect(() => {
    if (user && !authLoading) {
      loadData()
    }
  }, [user, authLoading])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar treinamentos
      const trainingsResponse = await fetch('/api/admin/trainings')
      if (trainingsResponse.ok) {
        const trainingsData = await trainingsResponse.json()
        setTrainings(trainingsData.trainings || [])
      }
      
      // Carregar usuários para o select
      const usersResponse = await fetch('/api/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData || [])
      }
      
      // Carregar setores para o select
      const sectorsResponse = await fetch('/api/sectors')
      if (sectorsResponse.ok) {
        const sectorsData = await sectorsResponse.json()
        setSectors(sectorsData || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTraining = () => {
    setEditingTraining(null)
    setTrainingForm({
      collaborator: '',
      training: '',
      sector: 'none',
      deadline: '',
      status: 'VALID'
    })
    setIsCreateModalOpen(true)
  }

  const handleEditTraining = (training: Training) => {
    setEditingTraining(training)
    setTrainingForm({
      collaborator: training.collaborator.id,
      training: training.title,
      sector: training.sector?.id || "none",
      deadline: new Date(training.deadline).toISOString().split('T')[0],
      status: training.status
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteTraining = (training: Training) => {
    setTrainingToDelete(training)
    setIsDeleteModalOpen(true)
  }

  const handleSaveTraining = async () => {
    if (!trainingForm.collaborator || !trainingForm.training || !trainingForm.deadline) {
      toast({
        title: "Erro",
        description: "Colaborador, treinamento e data de vencimento são obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      
      // Convert "none" back to empty string for API compatibility
      const formData = {
        ...trainingForm,
        sector: trainingForm.sector === "none" ? "" : trainingForm.sector
      }
      
      const url = editingTraining ? `/api/admin/trainings/${editingTraining.id}` : '/api/admin/trainings'
      const method = editingTraining ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: editingTraining ? "Treinamento atualizado com sucesso" : "Treinamento criado com sucesso",
        })
        
        if (editingTraining) {
          setIsEditModalOpen(false)
        } else {
          setIsCreateModalOpen(false)
        }
        
        // Recarregar dados
        loadData()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar treinamento')
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar treinamento",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDeleteTraining = async () => {
    if (trainingToDelete) {
      try {
        setIsDeleting(true)
        
        const response = await fetch(`/api/admin/trainings/${trainingToDelete.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          toast({
            title: "Sucesso",
            description: "Treinamento excluído com sucesso",
          })
          setIsDeleteModalOpen(false)
          setTrainingToDelete(null)
          
          // Recarregar dados
          loadData()
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao excluir treinamento')
        }
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Falha ao excluir treinamento",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = 
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.sector?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || training.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALID':
        return <Badge className="bg-green-100 text-green-800">Válido</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive">Vencido</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Próximo a vencer</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Treinamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os treinamentos e capacitações dos colaboradores
          </p>
        </div>
        <Button onClick={handleCreateTraining}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Treinamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Treinamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainings.length}</div>
            <p className="text-xs text-muted-foreground">
              Treinamentos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Válidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainings.filter(t => t.status === 'VALID').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Dentro do prazo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo a Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainings.filter(t => t.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Atenção necessária
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainings.filter(t => t.status === 'EXPIRED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem ação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar treinamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="VALID">Válidos</SelectItem>
                <SelectItem value="PENDING">Próximo a vencer</SelectItem>
                <SelectItem value="EXPIRED">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trainings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Treinamentos Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os treinamentos e seus status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Treinamento</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Vencimento</TableHead>
                  <TableHead>Dias Restantes</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Carregando...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredTrainings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum treinamento encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrainings.map((training) => {
                    const daysUntilDeadline = getDaysUntilDeadline(training.deadline)
                    
                    return (
                      <TableRow key={training.id}>
                        <TableCell>
                          <div className="font-medium">{training.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            {training.collaborator.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {training.sector ? (
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                              {training.sector.name}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(training.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatDate(training.deadline)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center ${daysUntilDeadline < 0 ? 'text-red-600' : daysUntilDeadline <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                            <Clock className="h-4 w-4 mr-1" />
                            {daysUntilDeadline < 0 ? `${Math.abs(daysUntilDeadline)} dias atrás` : `${daysUntilDeadline} dias`}
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
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Training Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Treinamento</DialogTitle>
            <DialogDescription>
              Preencha as informações para cadastrar um novo treinamento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collaborator">Colaborador *</Label>
              <Select value={trainingForm.collaborator} onValueChange={(value) => setTrainingForm({...trainingForm, collaborator: value})}>
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <Label htmlFor="training">Treinamento *</Label>
              <Input
                id="training"
                value={trainingForm.training}
                onChange={(e) => setTrainingForm({...trainingForm, training: e.target.value})}
                placeholder="Ex: NR 10, NR 35, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sector">Setor</Label>
              <Select value={trainingForm.sector} onValueChange={(value) => setTrainingForm({...trainingForm, sector: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum setor</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Data de Vencimento *</Label>
              <Input
                id="deadline"
                type="date"
                value={trainingForm.deadline}
                onChange={(e) => setTrainingForm({...trainingForm, deadline: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTraining} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Training Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Treinamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do treinamento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-collaborator">Colaborador *</Label>
              <Select value={trainingForm.collaborator} onValueChange={(value) => setTrainingForm({...trainingForm, collaborator: value})}>
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <Label htmlFor="edit-training">Treinamento *</Label>
              <Input
                id="edit-training"
                value={trainingForm.training}
                onChange={(e) => setTrainingForm({...trainingForm, training: e.target.value})}
                placeholder="Ex: NR 10, NR 35, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-sector">Setor</Label>
              <Select value={trainingForm.sector} onValueChange={(value) => setTrainingForm({...trainingForm, sector: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum setor</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Data de Vencimento *</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={trainingForm.deadline}
                onChange={(e) => setTrainingForm({...trainingForm, deadline: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTraining} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Training Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Treinamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este treinamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {trainingToDelete && (
            <div className="py-4">
              <p><strong>Treinamento:</strong> {trainingToDelete.title}</p>
              <p><strong>Colaborador:</strong> {trainingToDelete.collaborator.name}</p>
              <p><strong>Data Vencimento:</strong> {formatDate(trainingToDelete.deadline)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTraining} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}