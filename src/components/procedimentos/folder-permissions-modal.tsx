'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Trash2, Search, HelpCircle, Users, Edit, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/use-auth'

interface User {
    id: string
    name: string
    email: string
    photoUrl?: string | null
    role: string
    sector?: {
        name: string
    } | null
}

interface Sector {
    id: string
    name: string
}

interface Permission {
    id: string
    userId?: string
    sectorId?: string
    user?: User
    sector?: Sector
    type: 'VIEW' | 'EDIT' | 'ADMIN'
    targetType: 'USER' | 'SECTOR'
}

interface FolderMetadata {
    id: string
    path: string
    permissions: Permission[]
}

interface FolderPermissionsModalProps {
    isOpen: boolean
    onClose: () => void
    folderPath: string | null
    folderName: string | null
}

export function FolderPermissionsModal({ isOpen, onClose, folderPath, folderName }: FolderPermissionsModalProps) {
    const { toast } = useToast()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [sectors, setSectors] = useState<Sector[]>([])
    const [searchUser, setSearchUser] = useState('')
    const [selectedUser, setSelectedUser] = useState<string>('')
    const [selectedSector, setSelectedSector] = useState<string>('')
    const [selectedPermission, setSelectedPermission] = useState<string>('VIEW')
    const [permissionType, setPermissionType] = useState<'USER' | 'SECTOR'>('USER')
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'USERS' | 'SECTORS'>('USERS')
    const [expandedSectorUsers, setExpandedSectorUsers] = useState<Permission[]>([])

    // Carregar dados iniciais
    useEffect(() => {
        if (isOpen && folderPath && user && user.role === 'ADMIN') {
            fetchPermissions()
            fetchUsers()
            fetchSectors()
        }
        
        // Limpar estados expandidos ao fechar o modal
        if (!isOpen) {
            setExpandedSectorUsers([])
            setActiveTab('USERS')
        }
    }, [isOpen, folderPath, user])

    const fetchUsers = async () => {
        try {
            // Buscar usuários para o seletor (pode ser otimizado para buscar on-demand)
            const response = await fetch('/api/admin/users?active=true', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Usuário não autorizado para buscar usuários')
                    return
                }
                throw new Error(`Erro ${response.status}: ${response.statusText}`)
            }
            
            const data = await response.json()
            setUsers(data.users || [])
        } catch (error) {
            console.error('Erro ao buscar usuários:', error)
        }
    }

    const fetchSectors = async () => {
        try {
            const response = await fetch('/api/sectors', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Usuário não autorizado para buscar setores')
                    return
                }
                throw new Error(`Erro ${response.status}: ${response.statusText}`)
            }
            
            const data = await response.json()
            setSectors(data || [])
        } catch (error) {
            console.error('Erro ao buscar setores:', error)
        }
    }

    const fetchSectorUsers = async (sectorId: string, sectorName: string, permissionType: string) => {
        try {
            const response = await fetch(`/api/admin/users?sectorId=${sectorId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            
            if (!response.ok) {
                console.warn('Erro ao buscar usuários do setor')
                return
            }
            
            const data = await response.json()
            const sectorUsers = data.users || []
            
            // Criar permissões expandidas para cada usuário do setor
            const expandedPermissions = sectorUsers.map((user: User) => ({
                id: `${sectorId}-${user.id}`, // ID composto para identificar
                userId: user.id,
                user,
                type: permissionType,
                targetType: 'USER' as const,
                sectorId,
                sector: { id: sectorId, name: sectorName }
            }))
            
            setExpandedSectorUsers(prev => {
                // Remover permissões antigas deste setor e adicionar as novas
                const filtered = prev.filter(p => p.sectorId !== sectorId)
                return [...filtered, ...expandedPermissions]
            })
        } catch (error) {
            console.error('Erro ao buscar usuários do setor:', error)
        }
    }

    const fetchPermissions = async () => {
        setLoading(true)
        try {
            const url = `/api/admin/folders/permissions?path=${encodeURIComponent(folderPath || '')}`
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Usuário não autorizado para buscar permissões')
                    toast({
                        title: "Acesso negado",
                        description: "Você não tem permissão para gerenciar permissões de pasta.",
                        variant: "destructive"
                    })
                    return
                }
                throw new Error(`Erro ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            setPermissions(data.permissions || [])
        } catch (error) {
            console.error('Erro ao buscar permissões:', error)
            toast({
                title: "Erro",
                description: "Não foi possível carregar as permissões.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAddPermission = async () => {
        if (permissionType === 'USER' && !selectedUser) return
        if (permissionType === 'SECTOR' && !selectedSector) return

        setSaving(true)
        try {
            const requestBody: any = {
                path: folderPath,
                permission: selectedPermission,
                action: 'add',
                targetType: permissionType
            }

            if (permissionType === 'USER') {
                requestBody.userId = selectedUser
            } else {
                requestBody.sectorId = selectedSector
            }

            const response = await fetch('/api/admin/folders/permissions', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })

            if (!response.ok) {
                if (response.status === 401) {
                    toast({
                        title: "Acesso negado",
                        description: "Você não tem permissão para gerenciar permissões de pasta.",
                        variant: "destructive"
                    })
                    return
                }
                if (response.status === 403) {
                    toast({
                        title: "Permissão negada",
                        description: "Apenas administradores podem gerenciar permissões de pasta.",
                        variant: "destructive"
                    })
                    return
                }
                throw new Error(`Erro ${response.status}: ${response.statusText}`)
            }

            await fetchPermissions()
            setSelectedUser('')
            setSelectedSector('')
            
            // Se adicionou permissão de setor, buscar usuários do setor
            if (permissionType === 'SECTOR' && selectedSector) {
                const sector = sectors.find(s => s.id === selectedSector)
                if (sector) {
                    await fetchSectorUsers(selectedSector, sector.name, selectedPermission)
                }
            }
            
            toast({
                title: "Sucesso",
                description: `Permissão adicionada com sucesso para ${permissionType === 'USER' ? 'o usuário' : 'o setor'}.`,
            })
        } catch (error) {
            console.error('Erro ao adicionar permissão:', error)
            toast({
                title: "Erro",
                description: "Erro ao adicionar permissão.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const handleRemovePermission = async (permissionId: string, targetType: 'USER' | 'SECTOR') => {
        setSaving(true)
        try {
            const response = await fetch('/api/admin/folders/permissions', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    path: folderPath,
                    permissionId,
                    targetType,
                    action: 'remove'
                })
            })

            const responseData = await response.json()

            if (!response.ok) {
                if (response.status === 401) {
                    toast({
                        title: "Acesso negado",
                        description: "Você não tem permissão para gerenciar permissões de pasta.",
                        variant: "destructive"
                    })
                    return
                }
                if (response.status === 403) {
                    toast({
                        title: "Permissão negada",
                        description: "Apenas administradores podem gerenciar permissões de pasta.",
                        variant: "destructive"
                    })
                    return
                }
                if (response.status === 404) {
                    toast({
                        title: "Erro",
                        description: "Permissão não encontrada.",
                        variant: "destructive"
                    })
                    return
                }
                throw new Error(`Erro ${response.status}: ${response.statusText}`)
            }

            await fetchPermissions()
            
            // Se removeu permissão de setor, remover usuários expandidos
            if (targetType === 'SECTOR') {
                setExpandedSectorUsers(prev => prev.filter(p => p.sectorId !== permissionId))
            }
            
            toast({
                title: "Sucesso",
                description: "Permissão removida com sucesso.",
            })
        } catch (error) {
            console.error('Erro ao remover permissão:', error)
            toast({
                title: "Erro",
                description: "Erro ao remover permissão.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    

    const handleUpdatePermissionType = async (permissionId: string, targetType: 'USER' | 'SECTOR', newType: string) => {
        try {
            const requestBody: any = {
                path: folderPath,
                permission: newType,
                action: 'add', // 'add' funciona como upsert/update também
                targetType,
                permissionId
            }

            const response = await fetch('/api/admin/folders/permissions', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })

            const responseData = await response.json()

            if (!response.ok) {
                if (response.status === 401) {
                    toast({
                        title: "Acesso negado",
                        description: "Você não tem permissão para gerenciar permissões de pasta.",
                        variant: "destructive"
                    })
                    return
                }
                if (response.status === 403) {
                    toast({
                        title: "Permissão negada",
                        description: "Apenas administradores podem gerenciar permissões de pasta.",
                        variant: "destructive"
                    })
                    return
                }
                if (response.status === 404) {
                    toast({
                        title: "Erro",
                        description: "Permissão não encontrada.",
                        variant: "destructive"
                    })
                    return
                }
                // Mostrar mensagem de erro específica da API
                const errorMessage = responseData?.error || `Erro ${response.status}: ${response.statusText}`
                throw new Error(errorMessage)
            }

            // Atualizar localmente para feedback rápido
            setPermissions(prev => prev.map(p =>
                p.id === permissionId && p.targetType === targetType ? { ...p, type: newType as any } : p
            ))

            toast({
                title: "Atualizado",
                description: "Permissão alterada com sucesso.",
            })
        } catch (error) {
            console.error('Erro ao atualizar permissão:', error)
            fetchPermissions() // Reverter buscando do servidor
            toast({
                title: "Erro",
                description: error.message || "Erro ao atualizar permissão.",
                variant: "destructive"
            })
        }
    }

    // Get IDs of users and sectors that already have permissions
    const existingUserIds = new Set([
        ...permissions.filter(p => p.targetType === 'USER').map(p => p.userId).filter(Boolean),
        ...expandedSectorUsers.map(p => p.userId).filter(Boolean)
    ])
    
    const existingSectorIds = new Set(
        permissions.filter(p => p.targetType === 'SECTOR').map(p => p.sectorId).filter(Boolean)
    )

    const filteredUsers = users.filter(u => 
        !existingUserIds.has(u.id) && // Exclude users that already have permissions
        (u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase()))
    )

    const filteredSectors = sectors.filter(s => !existingSectorIds.has(s.id))

    const getPermissionLabel = (type: string) => {
        switch (type) {
            case 'VIEW': return 'Visualizar'
            case 'EDIT': return 'Editar'
            case 'ADMIN': return 'Administrar'
            default: return type
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="folder-permissions-modal max-h-[90vh] flex flex-col p-0 gap-0" 
            >
                <div className="p-6 pb-2">
                    <DialogHeader>
                        <DialogTitle>Permissões da pasta</DialogTitle>
                    </DialogHeader>
                </div>

                {/* Check if user is admin */}
                {!user || user.role !== 'ADMIN' ? (
                    <div className="p-6 flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-muted-foreground">
                                Apenas administradores podem gerenciar permissões de pasta.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
                    {/* Controles Superiores */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border">
                        <div className="lg:col-span-2 space-y-2">
                            <Label htmlFor="permission-type">Tipo</Label>
                            <Select value={permissionType} onValueChange={(value: 'USER' | 'SECTOR') => setPermissionType(value)}>
                                <SelectTrigger id="permission-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">Usuário</SelectItem>
                                    <SelectItem value="SECTOR">Setor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {permissionType === 'USER' ? (
                            <div className="lg:col-span-4 space-y-2">
                                <Label htmlFor="user-select">Usuários</Label>
                                <Select value={selectedUser} onValueChange={setSelectedUser} disabled={filteredUsers.length === 0}>
                                    <SelectTrigger id="user-select">
                                        <SelectValue placeholder={filteredUsers.length === 0 ? "Nenhum usuário disponível" : "Selecione um usuário"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2">
                                            <div className="flex items-center px-2 py-1 border rounded-md mb-2">
                                                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                                                <input
                                                    className="flex-1 bg-transparent outline-none text-sm"
                                                    placeholder="Buscar..."
                                                    value={searchUser}
                                                    onChange={(e) => setSearchUser(e.target.value)}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <ScrollArea className="h-[200px]">
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map(user => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={user.photoUrl || undefined} />
                                                                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-sm font-medium">{user.name}</span>
                                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    {users.length === 0 ? 'Carregando usuários...' : 'Todos os usuários já têm permissão'}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="lg:col-span-4 space-y-2">
                                <Label htmlFor="sector-select">Setores</Label>
                                <Select value={selectedSector} onValueChange={setSelectedSector} disabled={filteredSectors.length === 0}>
                                    <SelectTrigger id="sector-select">
                                        <SelectValue placeholder={filteredSectors.length === 0 ? "Nenhum setor disponível" : "Selecione um setor"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <ScrollArea className="h-[200px]">
                                            {filteredSectors.length > 0 ? (
                                                filteredSectors.map(sector => (
                                                    <SelectItem key={sector.id} value={sector.id}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                                <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                                                                    {sector.name.substring(0, 2).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-medium">{sector.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    {sectors.length === 0 ? 'Carregando setores...' : 'Todos os setores já têm permissão'}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="lg:col-span-3 space-y-2">
                            <Label htmlFor="permission-level">Nível de permissão</Label>
                            <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                                <SelectTrigger id="permission-level">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VIEW">Visualizar</SelectItem>
                                    <SelectItem value="EDIT">Editar/Modificar</SelectItem>
                                    <SelectItem value="ADMIN">Administrar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="lg:col-span-3 flex items-center justify-end space-x-2">
                            <Button
                                className="w-full"
                                onClick={handleAddPermission}
                                disabled={
                                    (!selectedUser && permissionType === 'USER') || 
                                    (!selectedSector && permissionType === 'SECTOR') || 
                                    saving ||
                                    (permissionType === 'USER' && filteredUsers.length === 0) ||
                                    (permissionType === 'SECTOR' && filteredSectors.length === 0)
                                }
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Adicionar
                            </Button>
                        </div>
                    </div>

                    {/* Área de Aprovação Paralela (Mock Visual) */}
                    <div className="flex justify-end">
                        <div className="border rounded-md p-3 bg-white dark:bg-card shadow-sm w-64">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">Habilitar aprovação paralela?</span>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Revisores</span>
                                    <Switch disabled />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Aprovadores</span>
                                    <Switch defaultChecked disabled />
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-2" disabled>Organograma</Button>
                            </div>
                        </div>
                    </div>

  

                    {/* Tabela de Permissões */}
                    <div className="flex-1 border rounded-md overflow-hidden bg-white dark:bg-card">
                        <div className="flex items-center justify-between p-4 border-b bg-slate-50 dark:bg-muted/50">
                            <div className="flex space-x-4">
                                <Button 
                                    variant="ghost" 
                                    className={`border-b-2 rounded-none px-2 h-auto pb-1 hover:bg-transparent ${
                                        activeTab === 'USERS' 
                                            ? 'border-primary text-primary' 
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => setActiveTab('USERS')}
                                >
                                    Usuários
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className={`border-b-2 rounded-none px-2 h-auto pb-1 hover:bg-transparent ${
                                        activeTab === 'SECTORS' 
                                            ? 'border-primary text-primary' 
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => setActiveTab('SECTORS')}
                                >
                                    Setor
                                </Button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button size="sm" variant="default" className="bg-teal-600 hover:bg-teal-700" disabled>
                                    <Edit className="h-3 w-3 mr-2" />
                                    Modificação em massa
                                </Button>
                                <div className="w-48 relative">
                                    <Search className="h-3 w-3 absolute left-2 top-2.5 text-muted-foreground" />
                                    <Input placeholder="Pesquisar" className="h-8 pl-8 text-xs" />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-auto max-h-[300px]">
                            {loading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-muted/50 sticky top-0 z-10">
                                        <tr className="text-left text-xs uppercase text-muted-foreground font-medium">
                                            <th className="px-4 py-3 w-10">#</th>
                                            <th className="px-4 py-3">Nome</th>
                                            <th className="px-4 py-3">Tipo</th>
                                            <th className="px-4 py-3">Setor</th>
                                            <th className="px-4 py-3 w-40">Permissão</th>
                                            <th className="px-4 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {(() => {
                                            let displayPermissions = []
                                            
                                            if (activeTab === 'USERS') {
                                                // Mostrar usuários diretos + usuários expandidos dos setores
                                                const userPermissions = permissions.filter(p => p.targetType === 'USER')
                                                displayPermissions = [...userPermissions, ...expandedSectorUsers]
                                            } else {
                                                // Mostrar apenas permissões de setor
                                                displayPermissions = permissions.filter(p => p.targetType === 'SECTOR')
                                            }
                                            
                                            if (displayPermissions.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                            {activeTab === 'USERS' 
                                                                ? 'Nenhuma permissão de usuário configurada.'
                                                                : 'Nenhuma permissão de setor configurada.'
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                            
                                            return displayPermissions.map((perm, index) => (
                                                <tr key={perm.id} className="hover:bg-slate-50 dark:hover:bg-muted/50">
                                                    <td className="px-4 py-3 text-muted-foreground">{String(index + 1).padStart(2, '0')}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {perm.targetType === 'USER' || perm.sectorId ? (
                                                                <>
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={perm.user?.photoUrl || undefined} />
                                                                        <AvatarFallback>{perm.user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{perm.user?.name}</span>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                                                                            {perm.sector?.name.substring(0, 2).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <span className="font-medium">{perm.sector?.name}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            (perm.targetType === 'USER' || perm.sectorId) 
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                        }`}>
                                                            {(perm.targetType === 'USER' || perm.sectorId) ? 'Usuário' : 'Setor'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {(perm.targetType === 'USER' || perm.sectorId) 
                                                            ? (perm.sector?.name || perm.user?.email)
                                                            : `${perm.sector?.name} (todos os membros)`
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Select
                                                            value={perm.type}
                                                            onValueChange={(val) => handleUpdatePermissionType(perm.id, perm.targetType || 'USER', val)}
                                                            disabled={expandedSectorUsers.some(esp => esp.id === perm.id)} // Desabilitar apenas para usuários expandidos
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="VIEW">Visualizar</SelectItem>
                                                                <SelectItem value="EDIT">Editar/Modificar</SelectItem>
                                                                <SelectItem value="ADMIN">Administrar</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleRemovePermission(perm.id, perm.targetType || 'USER')}
                                                            disabled={expandedSectorUsers.some(esp => esp.id === perm.id)} // Desabilitar apenas para usuários expandidos
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        })()}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
                )}
                
                <DialogFooter className="p-4 border-t bg-slate-50 dark:bg-muted/20">
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
