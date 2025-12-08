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

interface PerfilContentProps {
    sectors?: any[]
}

export function PerfilContent({ sectors = [] }: PerfilContentProps) {
    const { user, refreshAuth } = useAuth()
    const { toast } = useToast()

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Cria preview URL
            const previewUrl = URL.createObjectURL(file)
            
            setProfileForm(prev => ({
                ...prev,
                photoUrl: previewUrl,
                photoFile: file
            }))
        }
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

                // Clear password fields
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
            {/* Profile Photo Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Foto de Perfil
                    </CardTitle>
                    <CardDescription>
                        Atualize sua foto de perfil
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            {profileForm.photoUrl ? (
                                <div className="relative">
                                    <RobustImage
                                        src={profileForm.photoUrl.startsWith('data:') ? profileForm.photoUrl : (profileForm.photoUrl.startsWith('http') ? profileForm.photoUrl : `${window.location.origin}${profileForm.photoUrl}`)}
                                        alt="Foto de perfil"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                                        onError={() => {
                                            console.log('Image failed to load')
                                        }}
                                    />
                                    {/* Botão Remover sobre a imagem */}
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
                        <p className="text-sm text-muted-foreground text-center">
                            Clique na câmera para fazer upload de uma nova foto
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Dados Pessoais
                    </CardTitle>
                    <CardDescription>
                        Atualize suas informações pessoais e de segurança
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Informações Pessoais */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Informações Pessoais</h3>
                        
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                                id="name"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                placeholder="Digite seu nome completo"
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
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sector">Setor</Label>
                            <Input
                                id="sector"
                                value={profileForm.sectorId ? (
                                    sectors.find(s => s.id === profileForm.sectorId)?.name || "Setor não encontrado"
                                ) : (
                                    "Nenhum setor definido"
                                )}
                                readOnly
                                className="bg-gray-50 dark:bg-slate-900"
                            />
                            <p className="text-xs text-muted-foreground">
                                O setor é definido pelo administrador do sistema
                            </p>
                        </div>
                    </div>

                    {/* Separador */}
                    <div className="border-t pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-medium">Segurança</h3>
                        </div>
                    </div>

                    {/* Informações de Segurança */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="profile-current-password">Senha Atual</Label>
                            <Input
                                id="profile-current-password"
                                type="password"
                                value={profileForm.currentPassword}
                                onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                                placeholder="Digite sua senha atual"
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
                            />
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Deixe os campos em branco se não deseja alterar a senha
                        </p>
                    </div>

                    {/* Botão de Salvar */}
                    <div className="pt-4">
                        <Button
                            onClick={updateProfile}
                            disabled={isUpdatingProfile}
                            className="w-full"
                        >
                            {isUpdatingProfile ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
