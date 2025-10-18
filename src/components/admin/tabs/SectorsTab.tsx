'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Building, Search, Plus, Edit, Trash2, Users, Loader2 } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

interface SectorsTabProps {
  sectors: any[]
  onSectorsChange: (sectors: any[]) => void
}

interface SectorForm {
  name: string
  description: string
  active: boolean
}

export default function SectorsTab({ sectors, onSectorsChange }: SectorsTabProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal states
  const [isCreateSectorModalOpen, setIsCreateSectorModalOpen] = useState(false)
  const [isEditSectorModalOpen, setIsEditSectorModalOpen] = useState(false)
  const [isDeleteSectorModalOpen, setIsDeleteSectorModalOpen] = useState(false)
  const [isSavingSector, setIsSavingSector] = useState(false)
  const [isDeletingSector, setIsDeletingSector] = useState(false)
  
  // Form states
  const [sectorToEdit, setSectorToEdit] = useState<any>(null)
  const [sectorToDelete, setSectorToDelete] = useState<any>(null)
  const [sectorForm, setSectorForm] = useState<SectorForm>({
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
      description: sector.description || '',
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
        description: "Nome do setor é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSavingSector(true)
      
      if (sectorToEdit) {
        const response = await fetch(`/api/admin/sectors/${sectorToEdit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: sectorForm.name,
            description: sectorForm.description,
            active: sectorForm.active,
          }),
        })

        if (response.ok) {
          const updatedSector = await response.json()
          const updatedSectors = sectors.map(sector => 
            sector.id === sectorToEdit.id ? updatedSector : sector
          )
          onSectorsChange(updatedSectors)
          toast({
            title: "Sucesso",
            description: "Setor atualizado com sucesso",
          })
          setIsEditSectorModalOpen(false)
        } else {
          const error = await response.json()
          toast({
            title: "Erro",
            description: error.error || "Falha ao atualizar setor",
            variant: "destructive",
          })
        }
      } else {
        const response = await fetch('/api/admin/sectors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: sectorForm.name,
            description: sectorForm.description,
            active: sectorForm.active,
          }),
        })

        if (response.ok) {
          const newSector = await response.json()
          const updatedSectors = [...sectors, newSector]
          onSectorsChange(updatedSectors)
          toast({
            title: "Sucesso",
            description: "Setor criado com sucesso",
          })
          setIsCreateSectorModalOpen(false)
        } else {
          const error = await response.json()
          toast({
            title: "Erro",
            description: error.error || "Falha ao criar setor",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar setor",
        variant: "destructive",
      })
    } finally {
      setIsSavingSector(false)
    }
  }

  const confirmDeleteSector = async () => {
    if (sectorToDelete) {
      try {
        setIsDeletingSector(true)
        
        const response = await fetch(`/api/admin/sectors/${sectorToDelete.id}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (response.ok) {
          const updatedSectors = sectors.filter(sector => sector.id !== sectorToDelete.id)
          onSectorsChange(updatedSectors)
          toast({
            title: "Sucesso",
            description: "Setor excluído com sucesso",
          })
          setIsDeleteSectorModalOpen(false)
          setSectorToDelete(null)
        } else {
          const error = await response.json()
          toast({
            title: "Erro",
            description: error.error || "Falha ao excluir setor",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao excluir setor",
          variant: "destructive",
        })
      } finally {
        setIsDeletingSector(false)
      }
    }
  }

  const cancelDeleteSector = () => {
    setIsDeleteSectorModalOpen(false)
    setSectorToDelete(null)
  }

  const handleToggleSectorStatus = async (sectorId: string) => {
    try {
      const sector = sectors.find(s => s.id === sectorId)
      if (!sector) return

      const response = await fetch(`/api/admin/sectors/${sectorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          active: !sector.active,
        }),
      })

      if (response.ok) {
        const updatedSector = await response.json()
        const updatedSectors = sectors.map(s => 
          s.id === sectorId ? updatedSector : s
        )
        onSectorsChange(updatedSectors)
        toast({
          title: "Sucesso",
          description: `Setor ${!sector.active ? 'ativado' : 'desativado'} com sucesso`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Falha ao atualizar status do setor",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do setor",
        variant: "destructive",
      })
    }
  }

  const filteredSectors = sectors.filter(sector => 
    sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sector.description && sector.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <h2 className="text-xl font-semibold whitespace-nowrap">Gerenciamento de Setores</h2>
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar setores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        <Button onClick={handleCreateSector} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Novo Setor
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          {filteredSectors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum setor encontrado.</p>
            </div>
          ) : (
            <TooltipProvider>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Descrição</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Usuários</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSectors.map((sector) => (
                    <tr key={sector.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-foreground truncate">{sector.name}</h3>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <p className="text-sm text-muted-foreground font-medium truncate max-w-[300px]">
                          {sector.description || '-'}
                        </p>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{sector._count?.users || 0}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={sector.active}
                            onCheckedChange={(checked) => handleToggleSectorStatus(sector.id)}
                          />
                          <Badge variant={sector.active ? "default" : "secondary"} className="text-xs font-medium">
                            {sector.active ? 'Ativo' : 'Desativado'}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => handleEditSector(sector)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar setor</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteSector(sector)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir setor</p>
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

      {/* Create Sector Modal */}
      <Dialog open={isCreateSectorModalOpen} onOpenChange={setIsCreateSectorModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Setor</DialogTitle>
            <DialogDescription>
              Crie um novo setor no sistema
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
              <Textarea
                id="description"
                value={sectorForm.description}
                onChange={(e) => setSectorForm({...sectorForm, description: e.target.value})}
                className="col-span-3"
                rows={3}
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
              {isSavingSector ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Criar Setor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sector Modal */}
      <Dialog open={isEditSectorModalOpen} onOpenChange={setIsEditSectorModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Setor</DialogTitle>
            <DialogDescription>
              Edite as informações do setor
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nome
              </Label>
              <Input
                id="edit-name"
                value={sectorForm.name}
                onChange={(e) => setSectorForm({...sectorForm, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="edit-description"
                value={sectorForm.description}
                onChange={(e) => setSectorForm({...sectorForm, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-active" className="text-right">
                Ativo
              </Label>
              <Switch
                id="edit-active"
                checked={sectorForm.active}
                onCheckedChange={(checked) => setSectorForm({...sectorForm, active: checked})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveSector} disabled={isSavingSector}>
              {isSavingSector ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sector Modal */}
      <Dialog open={isDeleteSectorModalOpen} onOpenChange={setIsDeleteSectorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Setor</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o setor "{sectorToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteSector}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSector} disabled={isDeletingSector}>
              {isDeletingSector ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}