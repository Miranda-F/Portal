"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RobustImage } from "@/components/RobustImage"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { Camera, User as UserIcon, Shield, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PerfilContentProps {
    sectors?: any[]
}

export function PerfilContent({ sectors = [] }: PerfilContentProps) {
    const { user, refreshAuth } = useAuth()
    const { toast } = useToast()

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [employeeData, setEmployeeData] = useState<any | null>(null)
    const [isLoadingEmployee, setIsLoadingEmployee] = useState(false)

    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
        sectorId: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        photoUrl: "",
        photoFile: null as File | null,
        showIdentityCard: false
    })

    // Load user data
    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name,
                email: user.email,
                sectorId: user.sectorId || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
                photoUrl: user.photoUrl ? `${user.photoUrl}?t=${Date.now()}` : "",
                photoFile: null,
                showIdentityCard: user.showIdentityCard || false
            })
        }
    }, [user])

    const sectorName = profileForm.sectorId
        ? sectors.find(s => s.id === profileForm.sectorId)?.name || "Setor não encontrado"
        : "Nenhum setor definido"

    const roleLabel = user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'
    const approvalLabel = user?.approved ? 'Aprovado' : 'Pendente'
    const badgePreference = user?.showIdentityCard ? 'Exibir' : 'Ocultar'

    // Buscar dados do colaborador (Employee) usando o email do usuário
    useEffect(() => {
        const fetchEmployee = async () => {
            if (!user?.email) return
            try {
                setIsLoadingEmployee(true)
                const response = await fetch(`/api/rh/employees?search=${encodeURIComponent(user.email)}`)

                // Algumas rotas podem exigir permissão; se 401/403, apenas ignore sem quebrar o perfil
                if (!response.ok) {
                    setEmployeeData(null)
                    return
                }

                const employees = await response.json()
                const match = Array.isArray(employees)
                    ? employees.find((emp: any) => emp.email?.toLowerCase() === user.email.toLowerCase())
                    : null
                setEmployeeData(match || null)
            } catch (err) {
                console.error('Erro ao buscar colaborador:', err)
                setEmployeeData(null)
            } finally {
                setIsLoadingEmployee(false)
            }
        }
        fetchEmployee()
    }, [user?.email])

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Não informado'
        try {
            return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
        } catch (e) {
            return 'Não informado'
        }
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const isImage = file.type.startsWith("image/")
        const maxSizeMb = 5
        const isWithinSize = file.size <= maxSizeMb * 1024 * 1024

        if (!isImage || !isWithinSize) {
            toast({
                title: "Arquivo inválido",
                description: !isImage
                    ? "Selecione um arquivo de imagem."
                    : `O tamanho máximo permitido é ${maxSizeMb}MB.`,
                variant: "destructive",
            })
            return
        }

        // cria preview URL para mostrar antes do upload
        const previewUrl = URL.createObjectURL(file)
        
        setProfileForm(prev => ({
            ...prev,
            photoUrl: previewUrl,
            photoFile: file
        }))
    }

    const removePhoto = () => {
        setProfileForm({
            ...profileForm,
            photoFile: null,
            photoUrl: ""
        })
    }

    const updateProfile = async () => {
        try {
            setIsUpdatingProfile(true)

            if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
                toast({
                    title: "Erro",
                    description: "A nova senha e a confirmação não coincidem.",
                    variant: "destructive",
                })
                setIsUpdatingProfile(false)
                return
            }

            const formData = new FormData()
            formData.append('name', profileForm.name)
            formData.append('email', profileForm.email)
            formData.append('sectorId', profileForm.sectorId)
            formData.append('showIdentityCard', profileForm.showIdentityCard.toString())

            if (profileForm.currentPassword && profileForm.newPassword) {
                formData.append('currentPassword', profileForm.currentPassword)
                formData.append('newPassword', profileForm.newPassword)
            }

            if (profileForm.photoFile) {
                formData.append('photo', profileForm.photoFile)
            }

            if (!profileForm.photoUrl && user?.photoUrl) {
                formData.append('removePhoto', 'true')
            }

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                body: formData,
            })

            if (response.ok) {
                const updatedUser = await response.json()

                if (updatedUser.photoUrl) {
                    const photoUrlWithTimestamp = `${updatedUser.photoUrl}?t=${Date.now()}`
                    setProfileForm(prev => ({
                        ...prev,
                        photoUrl: photoUrlWithTimestamp,
                        photoFile: null
                    }))
                } else {
                    setProfileForm(prev => ({
                        ...prev,
                        photoUrl: "",
                        photoFile: null
                    }))
                }

                setProfileForm(prev => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                }))

                toast({
                    title: "Sucesso",
                    description: "Perfil atualizado com sucesso!",
                })

                await refreshAuth()
            } else {
                const error = await response.json()
                toast({
                    title: "Erro",
                    description: error.message || "Não foi possível atualizar o perfil",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error('Profile update error:', error)
            toast({
                title: "Erro",
                description: "Não foi possível atualizar o perfil",
                variant: "destructive",
            })
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-lg font-semibold">
                        Foto de Perfil
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            {profileForm.photoUrl ? (
                                <div className="relative">
                                    <RobustImage
                                        src={
                                            profileForm.photoUrl.startsWith('data:') ||
                                            profileForm.photoUrl.startsWith('blob:') ||
                                            profileForm.photoUrl.startsWith('http')
                                                ? profileForm.photoUrl
                                                : profileForm.photoUrl 
                                        }
                                        alt="Foto de perfil"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                                        width={128}
                                        height={128}
                                        onError={() => {
                                            console.log('Image failed to load')
                                        }}
                                    />
                                    <button
                                        onClick={removePhoto}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary font-semibold text-3xl">
                                        {profileForm.name ? getInitials(profileForm.name) : 'U'}
                                    </span>
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2">
                                <Label htmlFor="photo-upload" className="cursor-pointer">
                                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                </Label>
                                <Input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            Dados Pessoais
                        </CardTitle>
                        <CardDescription>
                            Atualize suas informações pessoais
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                                id="name"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                placeholder="Digite seu nome completo"
                                className="max-w-md"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profileForm.email}
                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                placeholder="Digite seu e-mail"
                                className="max-w-md"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sector">Setor</Label>
                            <Input
                                id="sector"
                                value={sectorName}
                                readOnly
                                className="bg-gray-50 dark:bg-slate-900 max-w-md"
                            />
                            <p className="text-xs text-muted-foreground">
                                O setor é definido pelo administrador do sistema
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Segurança
                        </CardTitle>
                        <CardDescription>
                            Atualize suas credenciais de acesso
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="profile-current-password">Senha Atual</Label>
                            <Input
                                id="profile-current-password"
                                type="password"
                                value={profileForm.currentPassword}
                                onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                                placeholder="Digite sua senha atual"
                                className="max-w-md"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-new-password">Nova Senha</Label>
                            <Input
                                id="profile-new-password"
                                type="password"
                                value={profileForm.newPassword}
                                onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                                placeholder="Digite a nova senha"
                                className="max-w-md"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-confirm-password">Confirmar Nova Senha</Label>
                            <Input
                                id="profile-confirm-password"
                                type="password"
                                value={profileForm.confirmPassword}
                                onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                                placeholder="Confirme a nova senha"
                                className="max-w-md"
                            />
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Deixe os campos em branco se não deseja alterar a senha
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Botão de Salvar */}
            <div className="pt-4 flex justify-center">
                <Button
                    onClick={updateProfile}
                    disabled={isUpdatingProfile}
                    className="min-w-[600px]"
                >
                    {isUpdatingProfile ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>

            {/* Dados Gerais do Colaborador */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Dados Gerais do Colaborador
                    </CardTitle>
                    <CardDescription>
                        Informações cadastrais e de acesso
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Nome</p>
                            <p className="font-medium">{employeeData?.name || profileForm.name || 'Não informado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">E-mail</p>
                            <p className="font-medium break-all">{profileForm.email || 'Não informado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Setor</p>
                            <p className="font-medium">{employeeData?.sector?.name || sectorName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Perfil de Acesso</p>
                            <p className="font-medium">{roleLabel}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Admissão</p>
                            <p className="font-medium">{formatDate(employeeData?.admissionDate)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Vínculo</p>
                            <p className="font-medium">
                                {employeeData?.employmentType
                                    ? employeeData.employmentType
                                    : 'Não informado'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Cargo</p>
                            <p className="font-medium">{employeeData?.position || 'Não informado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Gestor</p>
                            <p className="font-medium">{employeeData?.managerName || 'Não informado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Jornada</p>
                            <p className="font-medium">{employeeData?.workload || 'Não informado'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
