'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Search, Plus, Edit, Trash2, ShieldCheck, Clock, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

interface UsersTabProps {
  users: any[]
  employees: any[]
  sectors: any[]
  onUsersChange: (users: any[]) => void
  onSectorsChange: (sectors: any[]) => void
}

interface UserForm {
  name: string
  function: string
  email: string
  role: string
  approved: boolean
  sectorId: string
  password: string
}

export default function UsersTab({ 
  users, 
  employees, 
  sectors, 
  onUsersChange, 
  onSectorsChange 
}: UsersTabProps) {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [userStatusFilter, setUserStatusFilter] = useState("all")
  const [userSectorFilter, setUserSectorFilter] = useState("all")
  const [userSortField, setUserSortField] = useState<'name' | 'email' | 'lastLogin'>('name')
  const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Modal states
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false)
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [isDeletingUser, setIsDeletingUser] = useState(false)
  
  // Form states
  const [editingUser, setEditingUser] = useState<any>(null)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    function: '',
    email: '',
    role: 'USER',
    approved: true,
    sectorId: '',
    password: ''
  })

  const handleCreateUser = () => {
    setEditingUser(null)
    setUserForm({
      name: '',
      function: '',
      email: '',
      role: 'USER',
      approved: true,
      sectorId: '',
      password: ''
    })
    setIsCreateUserModalOpen(true)
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      function: user.function || '',
      email: user.email,
      role: user.role,
      approved: user.approved,
      sectorId: user.sectorId || '',
      password: ''
    })
    setIsEditUserModalOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setUserToDelete(user)
      setIsDeleteUserModalOpen(true)
    }
  }

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        setIsDeletingUser(true)
        
        const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (response.ok) {
          const updatedUsers = users.filter(user => user.id !== userToDelete.id)
          onUsersChange(updatedUsers)
          toast({
            title: "Sucesso",
            description: "Usuário excluído com sucesso",
          })
          setIsDeleteUserModalOpen(false)
          setUserToDelete(null)
        } else {
          const error = await response.json()
          toast({
            title: "Erro",
            description: error.error || "Falha ao excluir usuário",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao excluir usuário",
          variant: "destructive",
        })
      } finally {
        setIsDeletingUser(false)
      }
    }
  }

  const cancelDeleteUser = () => {
    setIsDeleteUserModalOpen(false)
    setUserToDelete(null)
  }

  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      })
      return
    }

    if (!editingUser && !userForm.password) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória para criar novo usuário",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSavingUser(true)
      
      if (editingUser) {
        const updateData: any = {
          name: userForm.name,
          function: userForm.function,
          email: userForm.email,
          sectorId: userForm.sectorId === 'none' ? null : userForm.sectorId,
          role: userForm.role,
          approved: userForm.approved,
        }

        if (userForm.password) {
          updateData.password = userForm.password
        }

        const response = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updateData),
        })

        if (response.ok) {
          const updatedUser = await response.json()
          const updatedUsers = users.map(user => 
            user.id === editingUser.id ? updatedUser : user
          )
          onUsersChange(updatedUsers)
          toast({
            title: "Sucesso",
            description: "Usuário atualizado com sucesso",
          })
          setIsEditUserModalOpen(false)
        } else {
          const error = await response.json()
          toast({
            title: "Erro",
            description: error.error || "Falha ao atualizar usuário",
            variant: "destructive",
          })
        }
      } else {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: userForm.name,
            function: userForm.function,
            email: userForm.email,
            sectorId: userForm.sectorId === 'none' ? null : userForm.sectorId,
            role: userForm.role,
            password: userForm.password,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const updatedUsers = [...users, data.user]
          onUsersChange(updatedUsers)
          toast({
            title: "Sucesso",
            description: "Usuário criado com sucesso",
          })
          setIsCreateUserModalOpen(false)
        } else {
          const error = await response.json()
          console.error('Create user error:', error)
          toast({
            title: "Erro",
            description: error.error || "Falha ao criar usuário",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar usuário",
        variant: "destructive",
      })
    } finally {
      setIsSavingUser(false)
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    console.log('handleToggleUserStatus called for userId:', userId)
    try {
      const user = users.find(u => u.id === userId)
      if (!user) {
        console.log('User not found')
        return
      }

      console.log('Found user:', user.name, 'current approved status:', user.approved)
      console.log('Current user:', currentUser?.name, 'currentUser.id:', currentUser?.id)
      console.log('User role:', user.role)

      // Verificar se o usuário está tentando desativar a si mesmo
      if (currentUser && user.id === currentUser.id) {
        console.log('User trying to deactivate self - blocking')
        toast({
          title: "Ação não permitida",
          description: "Você não pode desativar seu próprio usuário",
          variant: "destructive",
        })
        return
      }

      // Verificar se é um administrador (não pode desativar outros administradores)
      if (user.role === 'ADMIN') {
        console.log('User is ADMIN - blocking')
        toast({
          title: "Ação não permitida",
          description: "Não é possível desativar usuários com perfil de Administrador",
          variant: "destructive",
        })
        return
      }

      // Usar a nova API de approve/desapprove
      console.log('Calling API to toggle user status to:', !user.approved)
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          approved: !user.approved,
        }),
      })

      console.log('API response status:', response.status)
      if (response.ok) {
        const updatedUser = await response.json()
        console.log('API response data:', updatedUser)
        const updatedUsers = users.map(u => 
          u.id === userId ? updatedUser : u
        )
        onUsersChange(updatedUsers)
        toast({
          title: "Sucesso",
          description: `Usuário ${user.approved ? 'desativado' : 'ativado'} com sucesso`,
        })
      } else {
        const error = await response.json()
        console.log('API error:', error)
        toast({
          title: "Erro",
          description: error.error || "Falha ao atualizar status do usuário",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log('Catch error:', error)
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do usuário",
        variant: "destructive",
      })
    }
  }

  const handleUserSort = (field: 'name' | 'email' | 'lastLogin') => {
    if (userSortField === field) {
      setUserSortDirection(userSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setUserSortField(field)
      setUserSortDirection('asc')
    }
  }

  const getSortedUsers = (usersToSort: any[]) => {
    return [...usersToSort].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (userSortField) {
        case 'name':
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
          break
        case 'email':
          aValue = a.email?.toLowerCase() || ''
          bValue = b.email?.toLowerCase() || ''
          break
        case 'lastLogin':
          aValue = new Date(a.lastLogin || 0).getTime()
          bValue = new Date(b.lastLogin || 0).getTime()
          break
        default:
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
      }
      
      if (aValue < bValue) return userSortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return userSortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = userStatusFilter === "all" || 
                         (userStatusFilter === "active" && user.approved) ||
                         (userStatusFilter === "inactive" && !user.approved)
    const matchesSector = userSectorFilter === "all" || user.sectorId === userSectorFilter
    
    console.log('Filtering user:', user.name, {
      matchesSearch,
      matchesStatus,
      matchesSector,
      isEmployee: false, // Regular users are never employees
      approved: user.approved
    })
    
    return matchesSearch && matchesStatus && matchesSector
  })

  // Convert employees to user-like objects and combine with users
  const combinedUsers = [
    ...filteredUsers.map(user => ({
      ...user,
      isEmployee: false, // Explicitly mark regular users as non-employees
      employeeStatus: null
    })),
    ...employees.map(employee => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: 'USER',
      approved: employee.status === 'ACTIVE',
      sectorId: employee.sectorId,
      function: employee.position,
      lastLogin: null,
      isEmployee: true, // Flag to identify employees
      employeeStatus: employee.status
    }))
  ]

  const sortedAndFilteredUsers = getSortedUsers(combinedUsers)

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <h2 className="text-xl font-semibold whitespace-nowrap">Pessoas & Permissões</h2>
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userSectorFilter} onValueChange={setUserSectorFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Setores</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleCreateUser} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          {sortedAndFilteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum usuário ou colaborador encontrado.</p>
            </div>
          ) : (
            <TooltipProvider>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      <div className="flex items-center space-x-2 cursor-pointer hover:text-foreground" onClick={() => handleUserSort('name')}>
                        <span>Pessoa</span>
                        {userSortField === 'name' ? (
                          userSortDirection === 'asc' ? 
                            <ArrowUp className="h-4 w-4" /> : 
                            <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Permissões</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Último login</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>

                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                          <Badge variant={user.role === 'ADMIN' ? "destructive" : "outline"}>
                            {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : user.isEmployee ? 'Não aplicável' : 'Nunca'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.isEmployee ? user.employeeStatus === 'ACTIVE' : user.approved}
                            onCheckedChange={(checked) => {
                              console.log('Switch clicked for user:', user.name, 'checked:', checked)
                              console.log('User details:', {
                                id: user.id,
                                name: user.name,
                                isEmployee: user.isEmployee,
                                role: user.role,
                                approved: user.approved,
                                currentUser: currentUser?.name,
                                currentUserId: currentUser?.id,
                                employeeStatus: user.employeeStatus,
                                disabled: user.role === 'ADMIN' || (currentUser && user.id === currentUser.id)
                              })
                              
                              // Verificar se é um administrador
                              if (user.role === 'ADMIN') {
                                console.log('User is ADMIN - showing admin message')
                                toast({
                                  title: "Ação não permitida",
                                  description: "Não é possível desativar usuários com perfil de Administrador",
                                  variant: "destructive",
                                })
                                return
                              }
                              
                              // Verificar se está tentando desativar a si mesmo
                              if (currentUser && user.id === currentUser.id) {
                                console.log('User trying to deactivate self - blocking')
                                toast({
                                  title: "Ação não permitida",
                                  description: "Você não pode desativar seu próprio usuário",
                                  variant: "destructive",
                                })
                                return
                              }
                              
                              console.log('Calling handleToggleUserStatus')
                              handleToggleUserStatus(user.id)
                            }}
                            disabled={user.role === 'ADMIN' || (currentUser && user.id === currentUser.id)}
                          />
                          <Badge variant={user.isEmployee ? (user.employeeStatus === 'ACTIVE' ? "default" : "secondary") : (user.approved ? "default" : "secondary")} className="text-xs font-medium">
                            {user.isEmployee ? (user.employeeStatus === 'ACTIVE' ? 'Ativo' : 
                             user.employeeStatus === 'INACTIVE' ? 'Inativo' : 
                             user.employeeStatus === 'ON_LEAVE' ? 'Licença' : user.employeeStatus) : (user.approved ? 'Ativo' : 'Inativo')}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => {
                                if (user.isEmployee) {
                                  toast({
                                    title: "Informação",
                                    description: "Edite colaboradores no módulo RH",
                                  })
                                } else {
                                  handleEditUser(user)
                                }
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => {
                                if (user.isEmployee) {
                                  toast({
                                    title: "Informação",
                                    description: "Exclua colaboradores no módulo RH",
                                  })
                                } else {
                                  handleDeleteUser(user.id)
                                }
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Dialog open={isCreateUserModalOpen} onOpenChange={setIsCreateUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Crie um novo usuário no sistema
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="function" className="text-right">
                Função
              </Label>
              <Input
                id="function"
                value={userForm.function}
                onChange={(e) => setUserForm({...userForm, function: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Perfil
              </Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sector" className="text-right">
                Setor
              </Label>
              <Select value={userForm.sectorId} onValueChange={(value) => setUserForm({...userForm, sectorId: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveUser} disabled={isSavingUser}>
              {isSavingUser ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Edite as informações do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nome
              </Label>
              <Input
                id="edit-name"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-function" className="text-right">
                Função
              </Label>
              <Input
                id="edit-function"
                value={userForm.function}
                onChange={(e) => setUserForm({...userForm, function: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                Nova Senha
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                placeholder="Deixe em branco para não alterar"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Perfil
              </Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-sector" className="text-right">
                Setor
              </Label>
              <Select value={userForm.sectorId} onValueChange={(value) => setUserForm({...userForm, sectorId: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveUser} disabled={isSavingUser}>
              {isSavingUser ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteUserModalOpen} onOpenChange={setIsDeleteUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário "{userToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteUser}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={isDeletingUser}>
              {isDeletingUser ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}