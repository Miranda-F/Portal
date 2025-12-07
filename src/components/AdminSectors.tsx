'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Building, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

interface AdminSectorsProps {
  sectors: any[]
  onSectorUpdate: () => void
}

export default function AdminSectors({
  sectors,
  onSectorUpdate
}: AdminSectorsProps) {
  
  const { toast } = useToast()
  
  // Modal states
  const [isCreateSectorModalOpen, setIsCreateSectorModalOpen] = useState(false)
  const [isEditSectorModalOpen, setIsEditSectorModalOpen] = useState(false)
  const [isDeleteSectorModalOpen, setIsDeleteSectorModalOpen] = useState(false)
  const [isSavingSector, setIsSavingSector] = useState(false)
  const [isDeletingSector, setIsDeletingSector] = useState(false)
  
  // Form states
  const [sectorToEdit, setSectorToEdit] = useState<any>(null)
  const [sectorToDelete, setSectorToDelete] = useState<any>(null)
  const [sectorForm, setSectorForm] = useState({
    name: '',
    description: '',
    active: true
  })

  const handleCreateSector = () => {
    setSectorToEdit(null)
    setSectorForm({
      name: '',
      description: '',
      active: true
    })
    setIsCreateSectorModalOpen(true)
  }

  const handleEditSector = (sector: any) => {
    setSectorToEdit(sector)
    setSectorForm({
      name: sector.name,
      description: sector.description,
      active: sector.active
    })
    setIsEditSectorModalOpen(true)
  }

  const handleDeleteSector = (sector: any) => {
    setSectorToDelete(sector)
    setIsDeleteSectorModalOpen(true)
  }

  const handleSaveSector = async () => {
    if (!sectorForm.name) {
      toast({
        title: "Erro",
        description: "O nome do setor é obrigatório.",
        variant: "destructive",
      })
      return
    }

    setIsSavingSector(true)
    try {
      const url = sectorToEdit ? `/api/admin/sectors/${sectorToEdit.id}` : '/api/admin/sectors'
      const method = sectorToEdit ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(sectorForm),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: sectorToEdit ? "Setor atualizado com sucesso." : "Setor criado com sucesso.",
        })
        setIsCreateSectorModalOpen(false)
        setIsEditSectorModalOpen(false)
        onSectorUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível salvar o setor.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error saving sector:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o setor.",
        variant: "destructive",
      })
    } finally {
      setIsSavingSector(false)
    }
  }

  const confirmDeleteSector = async () => {
    if (!sectorToDelete) return

    setIsDeletingSector(true)
    try {
      const response = await fetch(`/api/admin/sectors/${sectorToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Setor excluído com sucesso.",
        })
        setIsDeleteSectorModalOpen(false)
        onSectorUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível excluir o setor.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting sector:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o setor.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingSector(false)
    }
  }

  const handleToggleSectorStatus = async (sectorId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/sectors/${sectorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ...sectors.find(s => s.id === sectorId), active }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: active ? "Setor ativado com sucesso." : "Setor desativado com sucesso.",
        })
        onSectorUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível atualizar o status do setor.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error toggling sector status:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do setor.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gerenciamento de Setores</h2>
        <Button onClick={handleCreateSector}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Setor
        </Button>
      </div>

      {/* Sectors List */}
      <Card>
        <CardHeader>
          <CardTitle>Setores</CardTitle>
          <CardDescription>Gerencie os setores do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {sectors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum setor encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                <div className="col-span-4">Nome</div>
                <div className="col-span-5">Descrição</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Ações</div>
              </div>
              
              {sectors.map((sector) => (
                <div key={sector.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b">
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{sector.name}</span>
                    </div>
                  </div>
                  <div className="col-span-5 text-sm text-muted-foreground">
                    {sector.description || 'Sem descrição'}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={sector.active ? "default" : "secondary"}>
                      {sector.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSector(sector)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSector(sector)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={sector.active}
                        onCheckedChange={(checked) => handleToggleSectorStatus(sector.id, checked)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Sector Modal */}
      <Dialog open={isCreateSectorModalOpen || isEditSectorModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateSectorModalOpen(false)
          setIsEditSectorModalOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{sectorToEdit ? "Editar Setor" : "Novo Setor"}</DialogTitle>
            <DialogDescription>
              {sectorToEdit ? "Atualize as informações do setor." : "Preencha as informações para criar um novo setor."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={sectorForm.name}
                onChange={(e) => setSectorForm({...sectorForm, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                value={sectorForm.description}
                onChange={(e) => setSectorForm({...sectorForm, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Ativo
              </Label>
              <Switch
                id="active"
                checked={sectorForm.active}
                onCheckedChange={(checked) => setSectorForm({...sectorForm, active: checked})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveSector} disabled={isSavingSector}>
              {isSavingSector ? (
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

      {/* Delete Sector Modal */}
      <Dialog open={isDeleteSectorModalOpen} onOpenChange={setIsDeleteSectorModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Setor</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este setor? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteSectorModalOpen(false)} disabled={isDeletingSector}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSector} disabled={isDeletingSector}>
              {isDeletingSector ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir Setor'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}