'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Search, Edit, Trash2, ShieldCheck, Clock, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useUsersPagination } from '@/hooks/admin/useUsersPagination'
import BatchOperationsModal from '../BatchOperationsModal'
import PaginationControls from '../PaginationControls'

interface UsersTabProps {
  employees: any[]
  sectors: any[]
  onSectorsChange: (sectors: any[]) => void
  onRefreshData?: () => void
  onUsersChange?: (users: any[]) => void
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
  employees,
  sectors,
  onSectorsChange,
  onRefreshData,
  onUsersChange
}: UsersTabProps) {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  
  // Hook de paginação
  const {
    data: users,
    pagination,
    paginationState,
    loading: usersLoading,
    updatePagination,
    goToPage,
    updateUsers,
    refresh
  } = useUsersPagination()
  
  const [userSortField, setUserSortField] = useState<'name' | 'email' | 'lastLogin'>('name')
  const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Modal states
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

  // Estados para seleção múltipla
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [togglingUsers, setTogglingUsers] = useState<Set<string>>(new Set())

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
          toast({
            title: "Sucesso",
            description: "Usuário excluído com sucesso",
          })
          setIsDeleteUserModalOpen(false)
          setUserToDelete(null)
          refresh() // Refresh data after delete
          // Atualizar dados do dashboard também
          if (onUsersChange) {
            const updatedUsers = users.filter(u => u.id !== userToDelete.id)
            onUsersChange(updatedUsers)
          }
          // Refresh dados do admin (dashboard)
          if (onRefreshData) {
            onRefreshData()
          }
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

  const handleUpdateUser = async () => {
    if (!userForm.name || !userForm.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSavingUser(true)
      
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
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso",
        })
        setIsEditUserModalOpen(false)
        setEditingUser(null)
        refresh() // Refresh data after update
        // Atualizar dados do dashboard também
        if (onUsersChange) {
          const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u)
          onUsersChange(updatedUsers)
        }
        // Refresh dados do admin (dashboard)
        if (onRefreshData) {
          onRefreshData()
        }
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Falha ao atualizar usuário",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar usuário",
        variant: "destructive",
      })
    } finally {
      setIsSavingUser(false)
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    if (togglingUsers.has(userId)) {
      return
    }

    try {
      setTogglingUsers(prev => new Set(prev).add(userId))
      
      const user = users.find(u => u.id === userId)
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado",
          variant: "destructive",
        })
        return
      }

      if (currentUser && user.id === currentUser.id) {
        toast({
          title: "Ação não permitida",
          description: "Você não pode desativar seu próprio usuário",
          variant: "destructive",
        })
        return
      }

      if (user.role === 'ADMIN') {
        toast({
          title: "Ação não permitida",
          description: "Não é possível desativar usuários com perfil de Administrador",
          variant: "destructive",
        })
        return
      }

      const loadingToast = toast({
        title: "Processando...",
        description: `${user.approved ? 'Desativando' : 'Ativando'} usuário ${user.name}`,
        duration: 0,
      })

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

      if (response.ok) {
        const updatedUser = await response.json()
        loadingToast.dismiss()
        toast({
          title: "Sucesso",
          description: `Usuário ${user.name} foi ${updatedUser.approved ? 'ativado' : 'desativado'} com sucesso`,
          variant: "default",
        })
        refresh() // Refresh data after status toggle
        // Atualizar dados do dashboard também
        if (onUsersChange) {
          const updatedUsers = users.map(u => u.id === userId ? updatedUser : u)
          onUsersChange(updatedUsers)
        }
        // Refresh dados do admin (dashboard)
        if (onRefreshData) {
          onRefreshData()
        }
      } else {
        const errorData = await response.json()
        loadingToast.dismiss()
        toast({
          title: "Erro",
          description: errorData.error || "Falha ao atualizar status do usuário",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast({
        title: "Erro",
        description: "Falha na comunicação com o servidor",
        variant: "destructive",
      })
    } finally {
      setTogglingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  // Funções para seleção múltipla
  const handleSelectUser = (userId: string) => {
    // Verificar se o usuário é admin
    const user = users.find(u => u.id === userId)
    if (user && user.role === 'ADMIN') {
      toast({
        title: "Ação não permitida",
        description: "Não é possível selecionar usuários administradores para operações em lote",
        variant: "destructive",
      })
      return
    }

    setSelectedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set())
    } else {
      // Selecionar apenas usuários não-admin da lista atual
      const selectableUsers = sortedAndFilteredUsers.filter(user => user.role !== 'ADMIN')
      setSelectedUsers(new Set(selectableUsers.map(user => user.id)))
    }
    setSelectAll(!selectAll)
  }

  const handleBatchOperation = () => {
    if (selectedUsers.size > 0) {
      setIsBatchModalOpen(true)
    }
  }

  const handleClearSelection = () => {
    setSelectedUsers(new Set())
    setSelectAll(false)
  }

  const handleUsersChange = (updatedUsers: any[]) => {
    updateUsers(updatedUsers)
    const remainingIds = new Set(updatedUsers.map(u => u.id))
    setSelectedUsers(prev => new Set([...prev].filter(id => remainingIds.has(id))))
    
    // Refresh dos dados para sincronizar com o servidor
    refresh()
    
    // Atualizar dados do dashboard também
    if (onUsersChange) {
      onUsersChange(updatedUsers)
    }
    
    // Refresh dados do admin (dashboard)
    if (onRefreshData) {
      onRefreshData()
    }
  }

  // Função específica para operações em lote
  const handleBatchUsersChange = (updatedUsers: any[]) => {
    console.log('🔄 Batch users change:', updatedUsers.length, 'users')
    
    // Para operações em lote, apenas refresh os dados
    refresh()
    
    // Atualizar dados do dashboard também
    if (onUsersChange) {
      console.log('📊 Updating dashboard with onUsersChange')
      onUsersChange(updatedUsers)
    } else {
      console.warn('⚠️ onUsersChange not available')
    }
    
    // Refresh dados do admin (dashboard)
    if (onRefreshData) {
      console.log('🔄 Refreshing admin data')
      onRefreshData()
    } else {
      console.warn('⚠️ onRefreshData not available')
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

  // Handlers para filtros
  const handleSearchChange = (search: string) => {
    updatePagination({ search })
  }

  const handleStatusFilterChange = (status: 'all' | 'active' | 'inactive') => {
    updatePagination({ status })
  }

  const handleSectorFilterChange = (sector: string) => {
    updatePagination({ sector })
  }

  // Aplicar filtros locais apenas para ordenação (busca é feita no servidor)
  const filteredUsers = users.filter((user) => {
    const matchesSector = paginationState.sector === "all" || user.sectorId === paginationState.sector
    return matchesSector // Mostrar todos os usuários, mas controlar seleção individualmente
  })

  const sortedAndFilteredUsers = getSortedUsers(filteredUsers)
  
  // Atualizar estado selectAll baseado nos usuários selecionáveis
  const selectableUsers = sortedAndFilteredUsers.filter(user => user.role !== 'ADMIN')
  const allSelectableSelected = selectableUsers.length > 0 && selectableUsers.every(user => selectedUsers.has(user.id))
  
  // Sincronizar estado selectAll usando useEffect para evitar re-renderizações infinitas
  useEffect(() => {
    if (allSelectableSelected && !selectAll) {
      setSelectAll(true)
    } else if (!allSelectableSelected && selectAll) {
      setSelectAll(false)
    }
  }, [allSelectableSelected, selectAll])

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
                      value={paginationState.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={paginationState.status} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={paginationState.sector} onValueChange={handleSectorFilterChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
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
          
          {/* Botões de seleção múltipla */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchOperation}
                className="flex items-center space-x-1"
              >
                <Users className="h-4 w-4" />
                <span>Lote ({selectedUsers.size})</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
              >
                Limpar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          {usersLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : sortedAndFilteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground">Nenhum usuário ou colaborador encontrado.</p>
            </div>
          ) : (
            <TooltipProvider>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        aria-label="Selecionar todos os usuários não-admin"
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      <div className="flex items-center space-x-2 cursor-pointer hover:text-foreground" onClick={() => handleUserSort('name')}>
                        <span>Pessoa</span>
                        {userSortField === 'name' ? (
                          userSortDirection === 'asc' ? 
                            <ArrowUp className="h-4 w-4" /> : 
                            <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      <div className="flex items-center space-x-2 cursor-pointer hover:text-foreground" onClick={() => handleUserSort('email')}>
                        <span>Email</span>
                        {userSortField === 'email' ? (
                          userSortDirection === 'asc' ? 
                            <ArrowUp className="h-4 w-4" /> : 
                            <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Setor</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Função</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      <div className="flex items-center space-x-2 cursor-pointer hover:text-foreground" onClick={() => handleUserSort('lastLogin')}>
                        <span>Último Login</span>
                        {userSortField === 'lastLogin' ? (
                          userSortDirection === 'asc' ? 
                            <ArrowUp className="h-4 w-4" /> : 
                            <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                            aria-label={`Selecionar ${user.name}`}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            disabled={user.role === 'ADMIN'}
                          />
                          {user.role === 'ADMIN' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Administradores não podem ser selecionados para operações em lote</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
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
                        <div className="text-sm">{user.email}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm">
                          {user.sector?.name || 'Sem setor'}
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
                          {togglingUsers.has(user.id) ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">Processando...</span>
                            </div>
                          ) : (
                            <Switch
                              checked={user.approved}
                              onCheckedChange={() => handleToggleUserStatus(user.id)}
                              disabled={user.role === 'ADMIN' || (currentUser && user.id === currentUser.id)}
                            />
                          )}
                          <Badge variant={user.approved ? "default" : "secondary"} className="text-xs font-medium">
                            {user.approved ? 'Ativo' : 'Inativo'}
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
                            }) : 'Nunca'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
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
                                <p>Editar usuário</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
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
                                <p>Excluir usuário</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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

      {/* Controles de Paginação */}
      {!usersLoading && sortedAndFilteredUsers.length > 0 && (
        <PaginationControls
          pagination={pagination}
          onPageChange={goToPage}
          onLimitChange={(limit) => updatePagination({ limit })}
          loading={usersLoading}
        />
      )}

      {/* Edit User Modal */}
      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="function">Função</Label>
                <Input
                  id="function"
                  value={userForm.function}
                  onChange={(e) => setUserForm(prev => ({ ...prev, function: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="role">Função no Sistema</Label>
                <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="sector">Setor</Label>
              <Select value={userForm.sectorId} onValueChange={(value) => setUserForm(prev => ({ ...prev, sectorId: value }))}>
                <SelectTrigger>
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
            <div>
              <Label htmlFor="password">Nova Senha (opcional)</Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Deixe em branco para manter a senha atual"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="approved"
                checked={userForm.approved}
                onCheckedChange={(checked) => setUserForm(prev => ({ ...prev, approved: checked as boolean }))}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="approved" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Usuário aprovado
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateUser} disabled={isSavingUser}>
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

      {/* Modal de Operações em Lote */}
      <BatchOperationsModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        selectedUsers={sortedAndFilteredUsers.filter(user => selectedUsers.has(user.id) && user.role !== 'ADMIN')}
        onUsersChange={handleBatchUsersChange}
        onClearSelection={handleClearSelection}
      />
    </div>
  )
}
