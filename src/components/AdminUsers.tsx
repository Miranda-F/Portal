'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Users, Search, Plus, Edit, Trash2, UserCheck, UserX, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

interface AdminUsersProps {
  users: any[]
  pendingUsers: any[]
  sectors: any[]
  onUserUpdate: () => void
}

export default function AdminUsers({
  users,
  pendingUsers,
  sectors,
  onUserUpdate
}: AdminUsersProps) {
  
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
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [userForm, setUserForm] = useState({
    name: '',
    function: '',
    email: '',
    role: 'USER',
    approved: true,
    sectorId: '',
    password: ''
  })

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.function.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = userStatusFilter === "all" || 
                           (userStatusFilter === "active" && user.approved) ||
                           (userStatusFilter === "inactive" && !user.approved)
      
      const matchesSector = userSectorFilter === "all" || user.sectorId === userSectorFilter
      
      return matchesSearch && matchesStatus && matchesSector
    })
    .sort((a, b) => {
      let aValue = a[userSortField]
      let bValue = b[userSortField]
      
      if (userSortField === 'lastLogin') {
        aValue = new Date(a.lastLogin || 0).getTime()
        bValue = new Date(b.lastLogin || 0).getTime()
      }
      
      if (userSortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
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
      function: user.function,
      email: user.email,
      role: user.role,
      approved: user.approved,
      sectorId: user.sectorId || '',
      password: ''
    })
    setIsEditUserModalOpen(true)
  }

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user)
    setIsDeleteUserModalOpen(true)
  }

  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsSavingUser(true)
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userForm),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: editingUser ? "Usuário atualizado com sucesso." : "Usuário criado com sucesso.",
        })
        setIsCreateUserModalOpen(false)
        setIsEditUserModalOpen(false)
        onUserUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível salvar o usuário.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error saving user:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
      })
    } finally {
      setIsSavingUser(false)
    }
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setIsDeletingUser(true)
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Usuário excluído com sucesso.",
        })
        setIsDeleteUserModalOpen(false)
        onUserUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível excluir o usuário.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingUser(false)
    }
  }

  const handleApproveUser = async (userId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ approved }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: approved ? "Usuário ativado com sucesso." : "Usuário desativado com sucesso.",
        })
        onUserUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível atualizar o status do usuário.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error approving user:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário.",
        variant: "destructive",
      })
    }
  }

  const handleSort = (field: 'name' | 'email' | 'lastLogin') => {
    if (userSortField === field) {
      setUserSortDirection(userSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setUserSortField(field)
      setUserSortDirection('asc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={handleCreateUser}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={userSectorFilter} onValueChange={setUserSectorFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os setores</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Gerencie os usuários do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                <div className="col-span-3">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('name')}
                  >
                    Nome
                    {userSortField === 'name' && (
                      userSortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="col-span-3">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    {userSortField === 'email' && (
                      userSortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="col-span-2">Função</div>
                <div className="col-span-2">Setor</div>
                <div className="col-span-2">Ações</div>
              </div>
              
              {filteredUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b">
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      <Badge variant={user.approved ? "default" : "secondary"}>
                        {user.approved ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground">{user.email}</div>
                  <div className="col-span-2 text-sm">{user.function}</div>
                  <div className="col-span-2 text-sm">
                    {user.sector?.name || 'N/A'}
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={user.approved}
                        onCheckedChange={(checked) => handleApproveUser(user.id, checked)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usuários Pendentes de Ativação</CardTitle>
            <CardDescription>Usuários aguardando ativação de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <UserX className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    <Badge variant="secondary">{user.function}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveUser(user.id, false)}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApproveUser(user.id, true)}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Ativar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit User Modal */}
      <Dialog open={isCreateUserModalOpen || isEditUserModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateUserModalOpen(false)
          setIsEditUserModalOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Atualize as informações do usuário." : "Preencha as informações para criar um novo usuário."}
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
              <Label htmlFor="role" className="text-right">
                Função
              </Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a função" />
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
                  {userForm.sectorId && !sectors.find(s => s.id === userForm.sectorId)?.active && (
                    <SelectItem key={userForm.sectorId} value={userForm.sectorId}>
                      {sectors.find(s => s.id === userForm.sectorId)?.name} (Inativo)
                    </SelectItem>
                  )}
                  {sectors.filter(sector => sector.active).map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>
          <DialogFooter>
            <Button onClick={handleSaveUser} disabled={isSavingUser}>
              {isSavingUser ? (
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

      {/* Delete User Modal */}
      <Dialog open={isDeleteUserModalOpen} onOpenChange={setIsDeleteUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteUserModalOpen(false)} disabled={isDeletingUser}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={isDeletingUser}>
              {isDeletingUser ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir Usuário'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}