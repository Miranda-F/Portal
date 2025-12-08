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
  Building,
  DollarSign,
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useJobs, useSectors } from "@/hooks/use-rh"
import { Job, Sector, JobForm } from "@/types/rh"

interface JobsManagementProps {
  activeTab: string
}

export default function JobsManagement({ activeTab }: JobsManagementProps) {
  const { toast } = useToast()
  const { jobs, loading, loadJobs, createJob, updateJob, deleteJob, toggleJobStatus } = useJobs()
  const { sectors, loadSectors } = useSectors()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false)
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false)
  const [isDeleteJobModalOpen, setIsDeleteJobModalOpen] = useState(false)
  const [isSavingJob, setIsSavingJob] = useState(false)
  const [isDeletingJob, setIsDeletingJob] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [jobForm, setJobForm] = useState<JobForm>({
    title: '',
    description: '',
    requirements: '',
    department: '',
    salary: '',
    maxApplications: '',
    type: 'FULL_TIME',
    status: 'ACTIVE'
  })
  const [requirementsInput, setRequirementsInput] = useState('')
  const [requirementsBadges, setRequirementsBadges] = useState<string[]>([])

  useEffect(() => {
    if (activeTab === "vagas") {
      loadJobs()
      loadSectors()
    }
  }, [activeTab])

  const handleCreateJob = () => {
    setEditingJob(null)
    setJobForm({
      title: '',
      description: '',
      requirements: '',
      department: '',
      salary: '',
      maxApplications: '',
      type: 'FULL_TIME',
      status: 'ACTIVE'
    })
    resetRequirementsFields()
    setIsCreateJobModalOpen(true)
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    const requirementsArray = job.requirements ? job.requirements.split(', ').filter(req => req.trim()) : []
    
    // Find the sector ID that matches the job's department name
    const sector = sectors.find(s => s.name === job.department)
    const sectorId = sector ? sector.id : ''
    
    setJobForm({
      title: job.title,
      description: job.description || '',
      requirements: job.requirements || '',
      department: sectorId,
      salary: job.salary || '',
      maxApplications: job.maxApplications?.toString() || '',
      type: job.type,
      status: job.status
    })
    setRequirementsBadges(requirementsArray)
    setRequirementsInput('')
    setIsEditJobModalOpen(true)
  }

  const handleDeleteJob = (job: Job) => {
    setJobToDelete(job)
    setIsDeleteJobModalOpen(true)
  }

  const handleSaveJob = async () => {
    if (!jobForm.title || !jobForm.department) {
      toast({
        title: "Erro",
        description: "Título e setor são obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSavingJob(true)
      
      // Find the sector name from the selected sector ID
      const selectedSector = sectors.find(s => s.id === jobForm.department)
      const sectorName = selectedSector ? selectedSector.name : ''
      
      const jobData = {
        title: jobForm.title,
        description: jobForm.description,
        requirements: jobForm.requirements,
        department: sectorName,
        salary: jobForm.salary,
        maxApplications: jobForm.maxApplications ? parseInt(jobForm.maxApplications) : undefined,
        type: jobForm.type,
        status: jobForm.status,
      }
      
      if (editingJob) {
        await updateJob(editingJob.id, jobData)
        toast({
          title: "Sucesso",
          description: "Vaga atualizada com sucesso",
        })
        setIsEditJobModalOpen(false)
      } else {
        await createJob(jobData)
        toast({
          title: "Sucesso",
          description: "Vaga criada com sucesso",
        })
        setIsCreateJobModalOpen(false)
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar vaga",
        variant: "destructive",
      })
    } finally {
      setIsSavingJob(false)
    }
  }

  const confirmDeleteJob = async () => {
    if (jobToDelete) {
      try {
        setIsDeletingJob(true)
        await deleteJob(jobToDelete.id)
        toast({
          title: "Sucesso",
          description: "Vaga excluída com sucesso",
        })
        setIsDeleteJobModalOpen(false)
        setJobToDelete(null)
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Falha ao excluir vaga",
          variant: "destructive",
        })
      } finally {
        setIsDeletingJob(false)
      }
    }
  }

  const cancelDeleteJob = () => {
    setIsDeleteJobModalOpen(false)
    setJobToDelete(null)
  }

  const handleToggleJobStatus = async (jobId: string) => {
    try {
      await toggleJobStatus(jobId)
      toast({
        title: "Sucesso",
        description: "Status da vaga atualizado com sucesso",
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar status",
        variant: "destructive",
      })
    }
  }

  const handleRequirementsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequirementsInput(e.target.value)
  }

  const resetRequirementsFields = () => {
    setRequirementsInput('')
    setRequirementsBadges([])
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Vagas</h2>
          <p className="text-muted-foreground">
            Gerencie as vagas abertas na empresa
          </p>
        </div>
        <Button onClick={handleCreateJob}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Vaga
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vagas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vagas Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as vagas disponíveis na empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {job.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        {job.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {job.type === 'FULL_TIME' ? 'Tempo Integral' :
                         job.type === 'PART_TIME' ? 'Meio Período' :
                         job.type === 'CONTRACT' ? 'Contrato' : 'Estágio'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        {job.salary || 'A combinar'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleToggleJobStatus(job.id)}
                      >
                        {job.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditJob(job)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar vaga</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteJob(job)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir vaga</p>
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

      {/* Create Job Modal */}
      <Dialog open={isCreateJobModalOpen} onOpenChange={setIsCreateJobModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Vaga</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar uma nova vaga
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Vaga *</Label>
                <Input
                  id="title"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Setor *</Label>
                <Select 
                  value={jobForm.department} 
                  onValueChange={(value) => setJobForm({...jobForm, department: value})}
                >
                  <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={jobForm.description}
                onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                placeholder="Descreva as responsabilidades e atividades do cargo..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requisitos</Label>
              <Textarea
                id="requirements"
                value={jobForm.requirements}
                onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                placeholder="Liste os requisitos e qualificações necessárias..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salário</Label>
                <Input
                  id="salary"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                  placeholder="Ex: R$ 3.000,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxApplications">Máximo de Candidatos</Label>
                <Input
                  id="maxApplications"
                  type="number"
                  value={jobForm.maxApplications}
                  onChange={(e) => setJobForm({...jobForm, maxApplications: e.target.value})}
                  placeholder="Deixe em branco para ilimitado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Contratação</Label>
                <Select 
                  value={jobForm.type} 
                  onValueChange={(value: any) => setJobForm({...jobForm, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Tempo Integral</SelectItem>
                    <SelectItem value="PART_TIME">Meio Período</SelectItem>
                    <SelectItem value="CONTRACT">Contrato</SelectItem>
                    <SelectItem value="INTERNSHIP">Estágio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateJobModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveJob} disabled={isSavingJob}>
              {isSavingJob ? 'Salvando...' : 'Criar Vaga'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Job Modal */}
      <Dialog open={isEditJobModalOpen} onOpenChange={setIsEditJobModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Vaga</DialogTitle>
            <DialogDescription>
              Atualize as informações da vaga
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título da Vaga *</Label>
                <Input
                  id="edit-title"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Setor *</Label>
                <Select 
                  value={jobForm.department} 
                  onValueChange={(value) => setJobForm({...jobForm, department: value})}
                >
                  <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={jobForm.description}
                onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                placeholder="Descreva as responsabilidades e atividades do cargo..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-requirements">Requisitos</Label>
              <Textarea
                id="edit-requirements"
                value={jobForm.requirements}
                onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                placeholder="Liste os requisitos e qualificações necessárias..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-salary">Salário</Label>
                <Input
                  id="edit-salary"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                  placeholder="Ex: R$ 3.000,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxApplications">Máximo de Candidatos</Label>
                <Input
                  id="edit-maxApplications"
                  type="number"
                  value={jobForm.maxApplications}
                  onChange={(e) => setJobForm({...jobForm, maxApplications: e.target.value})}
                  placeholder="Deixe em branco para ilimitado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo de Contratação</Label>
                <Select 
                  value={jobForm.type} 
                  onValueChange={(value: any) => setJobForm({...jobForm, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Tempo Integral</SelectItem>
                    <SelectItem value="PART_TIME">Meio Período</SelectItem>
                    <SelectItem value="CONTRACT">Contrato</SelectItem>
                    <SelectItem value="INTERNSHIP">Estágio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={jobForm.status} 
                onValueChange={(value: any) => setJobForm({...jobForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativa</SelectItem>
                  <SelectItem value="INACTIVE">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditJobModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveJob} disabled={isSavingJob}>
              {isSavingJob ? 'Salvando...' : 'Atualizar Vaga'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Job Modal */}
      <Dialog open={isDeleteJobModalOpen} onOpenChange={setIsDeleteJobModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Vaga</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a vaga "{jobToDelete?.title}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteJob}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteJob} disabled={isDeletingJob}>
              {isDeletingJob ? 'Excluindo...' : 'Excluir Vaga'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}