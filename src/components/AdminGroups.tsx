'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Users2, Plus, Edit, Trash2, Search, Loader2, X } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

interface AdminGroupsProps {
  groups: any[]
  users: any[]
  onGroupUpdate: () => void
}

export default function AdminGroups({
  groups,
  users,
  onGroupUpdate
}: AdminGroupsProps) {
  
  const { toast } = useToast()
  
  // Modal states
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false)
  const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false)
  const [isSavingGroup, setIsSavingGroup] = useState(false)
  const [isDeletingGroup, setIsDeletingGroup] = useState(false)
  
  // Form states
  const [groupToDelete, setGroupToDelete] = useState<any>(null)
  const [editingGroup, setEditingGroup] = useState<any>(null)
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    active: true
  })
  
  // User selection states
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState('')

  const handleCreateGroup = () => {
    setEditingGroup(null)
    setGroupForm({
      name: '',
      description: '',
      active: true
    })
    setSelectedUsers([])
    setAvailableUsers(users)
    setIsCreateGroupModalOpen(true)
  }

  const handleEditGroup = (group: any) => {
    setEditingGroup(group)
    setGroupForm({
      name: group.name,
      description: group.description,
      active: group.active
    })
    setSelectedUsers(group.users?.map((u: any) => u.id) || [])
    setAvailableUsers(users.filter(u => !group.users?.some((gu: any) => gu.id === u.id)))
    setIsEditGroupModalOpen(true)
  }

  const handleDeleteGroup = (group: any) => {
    setGroupToDelete(group)
    setIsDeleteGroupModalOpen(true)
  }

  const handleSaveGroup = async () => {
    if (!groupForm.name) {
      toast({
        title: "Erro",
        description: "O nome do grupo é obrigatório.",
        variant: "destructive",
      })
      return
    }

    setIsSavingGroup(true)
    try {
      const url = editingGroup ? `/api/admin/groups/${editingGroup.id}` : '/api/admin/groups'
      const method = editingGroup ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...groupForm,
          userIds: selectedUsers
        }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: editingGroup ? "Grupo atualizado com sucesso." : "Grupo criado com sucesso.",
        })
        setIsCreateGroupModalOpen(false)
        setIsEditGroupModalOpen(false)
        onGroupUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível salvar o grupo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error saving group:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o grupo.",
        variant: "destructive",
      })
    } finally {
      setIsSavingGroup(false)
    }
  }

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return

    setIsDeletingGroup(true)
    try {
      const response = await fetch(`/api/admin/groups/${groupToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Grupo excluído com sucesso.",
        })
        setIsDeleteGroupModalOpen(false)
        onGroupUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível excluir o grupo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o grupo.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingGroup(false)
    }
  }

  const handleToggleGroupStatus = async (groupId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ...groups.find(g => g.id === groupId), active }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: active ? "Grupo ativado com sucesso." : "Grupo desativado com sucesso.",
        })
        onGroupUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível atualizar o status do grupo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error toggling group status:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do grupo.",
        variant: "destructive",
      })
    }
  }

  const addUserToGroup = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId)
    if (user) {
      setSelectedUsers([...selectedUsers, userId])
      setAvailableUsers(availableUsers.filter(u => u.id !== userId))
    }
  }

  const removeUserFromGroup = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
      setAvailableUsers([...availableUsers, user])
    }
  }

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gerenciamento de Grupos</h2>
        <Button onClick={handleCreateGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      {/* Groups List */}
      <Card>
        <CardHeader>
          <CardTitle>Grupos</CardTitle>
          <CardDescription>Gerencie os grupos de usuários do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum grupo encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                <div className="col-span-3">Nome</div>
                <div className="col-span-5">Descrição</div>
                <div className="col-span-2">Membros</div>
                <div className="col-span-2">Ações</div>
              </div>
              
              {groups.map((group) => (
                <div key={group.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b">
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4" />
                      <span className="font-medium">{group.name}</span>
                    </div>
                  </div>
                  <div className="col-span-5 text-sm text-muted-foreground">
                    {group.description || 'Sem descrição'}
                  </div>
                  <div className="col-span-2">
                    <Badge variant="outline">
                      {group.users?.length || 0} membros
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGroup(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGroup(group)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={group.active}
                        onCheckedChange={(checked) => handleToggleGroupStatus(group.id, checked)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Group Modal */}
      <Dialog open={isCreateGroupModalOpen || isEditGroupModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateGroupModalOpen(false)
          setIsEditGroupModalOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Editar Grupo" : "Novo Grupo"}</DialogTitle>
            <DialogDescription>
              {editingGroup ? "Atualize as informações do grupo." : "Preencha as informações para criar um novo grupo."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={groupForm.name}
                onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                value={groupForm.description}
                onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Ativo
              </Label>
              <Switch
                id="active"
                checked={groupForm.active}
                onCheckedChange={(checked) => setGroupForm({...groupForm, active: checked})}
              />
            </div>
            
            {/* User Selection */}
            <div className="col-span-4 space-y-4">
              <Label>Selecionar Usuários</Label>
              
              {/* Available Users */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {filteredAvailableUsers.length > 0 ? (
                    filteredAvailableUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => addUserToGroup(user.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                        <Plus className="h-4 w-4" />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-2">
                      Nenhum usuário disponível encontrado.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  <Label>Usuários Selecionados</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                    {selectedUsers.map((userId) => {
                      const user = users.find(u => u.id === userId)
                      return user ? (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUserFromGroup(user.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveGroup} disabled={isSavingGroup}>
              {isSavingGroup ? (
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

      {/* Delete Group Modal */}
      <Dialog open={isDeleteGroupModalOpen} onOpenChange={setIsDeleteGroupModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Grupo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteGroupModalOpen(false)} disabled={isDeletingGroup}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteGroup} disabled={isDeletingGroup}>
              {isDeletingGroup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir Grupo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}