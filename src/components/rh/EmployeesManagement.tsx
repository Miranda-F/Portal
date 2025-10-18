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
  User,
  Calendar,
  Mail
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEmployees, useSectors } from "@/hooks/use-rh"
import { Employee, EmployeeForm } from "@/types/rh"

interface EmployeesManagementProps {
  activeTab: string
}

export default function EmployeesManagement({ activeTab }: EmployeesManagementProps) {
  const { toast } = useToast()
  const { employees, loading, loadEmployees, createEmployee } = useEmployees()
  const { sectors, loadSectors } = useSectors()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateEmployeeModalOpen, setIsCreateEmployeeModalOpen] = useState(false)
  const [isSavingEmployee, setIsSavingEmployee] = useState(false)
  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>({
    cpf: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    sectorId: '',
    admissionDate: '',
    salary: '',
    employmentType: 'CLT',
    status: 'ACTIVE',
    birthDate: '',
    gender: '',
    educationLevel: '',
    maritalStatus: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  })

  useEffect(() => {
    if (activeTab === "colaboradores") {
      loadEmployees()
      loadSectors()
    }
  }, [activeTab, loadEmployees, loadSectors])

  const handleCreateEmployee = () => {
    setEmployeeForm({
      cpf: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      position: '',
      sectorId: '',
      admissionDate: '',
      salary: '',
      employmentType: 'CLT',
      status: 'ACTIVE',
      birthDate: '',
      gender: '',
      educationLevel: '',
      maritalStatus: '',
      emergencyContact: '',
      emergencyPhone: '',
      notes: ''
    })
    setIsCreateEmployeeModalOpen(true)
  }

  const handleSaveEmployee = async () => {
    if (!employeeForm.cpf || !employeeForm.name || !employeeForm.email || !employeeForm.position || !employeeForm.sectorId || !employeeForm.admissionDate || !employeeForm.salary) {
      toast({
        title: "Erro",
        description: "CPF, nome, email, cargo, setor, data de admissão e salário são obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSavingEmployee(true)
      await createEmployee(employeeForm)
      toast({
        title: "Sucesso",
        description: "Colaborador criado com sucesso",
      })
      setIsCreateEmployeeModalOpen(false)
      // Reset form
      setEmployeeForm({
        cpf: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        position: '',
        sectorId: '',
        admissionDate: '',
        salary: '',
        employmentType: 'CLT',
        status: 'ACTIVE',
        birthDate: '',
        gender: '',
        educationLevel: '',
        maritalStatus: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: ''
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar colaborador",
        variant: "destructive",
      })
    } finally {
      setIsSavingEmployee(false)
    }
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSectorName = (sectorId: string) => {
    const sector = sectors.find(s => s.id === sectorId)
    return sector ? sector.name : 'Setor não encontrado'
  }

  const getEmploymentTypeLabel = (type: string) => {
    switch (type) {
      case 'CLT': return 'CLT'
      case 'PJ': return 'PJ'
      case 'INTERNSHIP': return 'Estágio'
      case 'TRAINEE': return 'Trainee'
      default: return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">Inativo</Badge>
      case 'ON_LEAVE':
        return <Badge className="bg-yellow-100 text-yellow-800">Licença</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Colaboradores</h2>
          <p className="text-muted-foreground">
            Gerencie os colaboradores da empresa
          </p>
        </div>
        <Button onClick={handleCreateEmployee}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Colaborador
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar colaboradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Colaboradores Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os colaboradores da empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admissão</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        {getSectorName(employee.sectorId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getEmploymentTypeLabel(employee.employmentType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {new Date(employee.admissionDate).toLocaleDateString('pt-BR')}
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
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver detalhes</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar colaborador</p>
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

      {/* Create Employee Modal */}
      <Dialog open={isCreateEmployeeModalOpen} onOpenChange={setIsCreateEmployeeModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Colaborador</DialogTitle>
            <DialogDescription>
              Preencha as informações para cadastrar um novo colaborador
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({...employeeForm, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={employeeForm.cpf}
                  onChange={(e) => setEmployeeForm({...employeeForm, cpf: e.target.value})}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={employeeForm.phone}
                  onChange={(e) => setEmployeeForm({...employeeForm, phone: e.target.value})}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  value={employeeForm.position}
                  onChange={(e) => setEmployeeForm({...employeeForm, position: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sectorId">Setor *</Label>
                <Select 
                  value={employeeForm.sectorId} 
                  onValueChange={(value) => setEmployeeForm({...employeeForm, sectorId: value})}
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admissionDate">Data de Admissão *</Label>
                <Input
                  id="admissionDate"
                  type="date"
                  value={employeeForm.admissionDate}
                  onChange={(e) => setEmployeeForm({...employeeForm, admissionDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salário *</Label>
                <Input
                  id="salary"
                  value={employeeForm.salary}
                  onChange={(e) => setEmployeeForm({...employeeForm, salary: e.target.value})}
                  placeholder="Ex: R$ 3.000,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentType">Tipo de Contratação</Label>
                <Select 
                  value={employeeForm.employmentType} 
                  onValueChange={(value: any) => setEmployeeForm({...employeeForm, employmentType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="INTERNSHIP">Estágio</SelectItem>
                    <SelectItem value="TRAINEE">Trainee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={employeeForm.birthDate}
                  onChange={(e) => setEmployeeForm({...employeeForm, birthDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <Select 
                  value={employeeForm.gender} 
                  onValueChange={(value) => setEmployeeForm({...employeeForm, gender: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Masculino</SelectItem>
                    <SelectItem value="FEMALE">Feminino</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Estado Civil</Label>
                <Select 
                  value={employeeForm.maritalStatus} 
                  onValueChange={(value) => setEmployeeForm({...employeeForm, maritalStatus: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Solteiro(a)</SelectItem>
                    <SelectItem value="MARRIED">Casado(a)</SelectItem>
                    <SelectItem value="DIVORCED">Divorciado(a)</SelectItem>
                    <SelectItem value="WIDOWED">Viúvo(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={employeeForm.address}
                onChange={(e) => setEmployeeForm({...employeeForm, address: e.target.value})}
                placeholder="Rua, número, bairro, cidade, estado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="educationLevel">Escolaridade</Label>
              <Select 
                value={employeeForm.educationLevel} 
                onValueChange={(value) => setEmployeeForm({...employeeForm, educationLevel: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FUNDAMENTAL_INCOMPLETE">Fundamental Incompleto</SelectItem>
                  <SelectItem value="FUNDAMENTAL_COMPLETE">Fundamental Completo</SelectItem>
                  <SelectItem value="MEDIUM_INCOMPLETE">Médio Incompleto</SelectItem>
                  <SelectItem value="MEDIUM_COMPLETE">Médio Completo</SelectItem>
                  <SelectItem value="SUPERIOR_INCOMPLETE">Superior Incompleto</SelectItem>
                  <SelectItem value="SUPERIOR_COMPLETE">Superior Completo</SelectItem>
                  <SelectItem value="POST_GRADUATE">Pós-graduação</SelectItem>
                  <SelectItem value="MASTERS">Mestrado</SelectItem>
                  <SelectItem value="DOCTORATE">Doutorado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                <Input
                  id="emergencyContact"
                  value={employeeForm.emergencyContact}
                  onChange={(e) => setEmployeeForm({...employeeForm, emergencyContact: e.target.value})}
                  placeholder="Nome do contato"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Telefone de Emergência</Label>
                <Input
                  id="emergencyPhone"
                  value={employeeForm.emergencyPhone}
                  onChange={(e) => setEmployeeForm({...employeeForm, emergencyPhone: e.target.value})}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={employeeForm.status} 
                onValueChange={(value: any) => setEmployeeForm({...employeeForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                  <SelectItem value="ON_LEAVE">Licença</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={employeeForm.notes}
                onChange={(e) => setEmployeeForm({...employeeForm, notes: e.target.value})}
                placeholder="Observações adicionais sobre o colaborador..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateEmployeeModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEmployee} disabled={isSavingEmployee}>
              {isSavingEmployee ? 'Salvando...' : 'Cadastrar Colaborador'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}