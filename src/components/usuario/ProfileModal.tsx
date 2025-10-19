"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenericModal, ModalFooter } from "@/components/GenericModal"
import { RobustImage } from "@/components/RobustImage"
import { getInitials } from "@/lib/utils"
import { Camera, X, Lock } from "lucide-react"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profileForm: {
    name: string
    email: string
    sectorId: string
    currentPassword: string
    newPassword: string
    confirmPassword: string
    photoUrl: string
    photoFile: File | null
    showIdentityCard: boolean
  }
  setProfileForm: (form: any) => void
  sectors: any[]
  isUpdatingProfile: boolean
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePhoto: () => void
  onUpdateProfile: () => void
}

export function ProfileModal({
  isOpen,
  onClose,
  profileForm,
  setProfileForm,
  sectors,
  isUpdatingProfile,
  onPhotoChange,
  onRemovePhoto,
  onUpdateProfile
}: ProfileModalProps) {
  // Componente de imagem robusto para o modal
  const RobustModalImage = ({ src, alt, className, onError }: { src: string, alt: string, className: string, onError?: () => void }) => {
    return (
      <RobustImage 
        src={src} 
        alt={alt} 
        className={className} 
        onError={onError}
        onLoad={() => {
          console.log('Modal image loaded successfully:', src)
        }}
      />
    )
  }

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title="Meu Perfil"
      description="Atualize suas informações pessoais, senha e foto de perfil."
      size="lg"
    >
      <div className="grid gap-6 py-4">
        {/* Photo Upload Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {profileForm.photoUrl ? (
              <RobustModalImage 
                src={profileForm.photoUrl.startsWith('data:') ? profileForm.photoUrl : (profileForm.photoUrl.startsWith('http') ? profileForm.photoUrl : `${window.location.origin}${profileForm.photoUrl}`)} 
                alt="Foto de perfil" 
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                onError={() => {
                  // Se a imagem não carregar, mostrar o placeholder
                  console.log('Modal image failed to load, showing placeholder')
                  // O fallback será tratado pelo componente pai
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-xl">
                  {profileForm.name ? getInitials(profileForm.name) : 'U'}
                </span>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 flex space-x-1">
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </div>
              </Label>
              {profileForm.photoUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full"
                  onClick={onRemovePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoChange}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Clique na câmera para fazer upload de uma nova foto
          </p>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sector" className="text-right">
                  Setor
                </Label>
                <div className="col-span-3">
                  <Input
                    id="sector"
                    value={profileForm.sectorId ? (
                      sectors.find(s => s.id === profileForm.sectorId)?.name || "Setor não encontrado"
                    ) : (
                      "Nenhum setor definido"
                    )}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Alterar Senha
              </h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currentPassword" className="text-right">
                  Senha Atual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
                  className="col-span-3"
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPassword" className="text-right">
                  Nova Senha
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                  className="col-span-3"
                  placeholder="Digite a nova senha"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right">
                  Confirmar
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                  className="col-span-3"
                  placeholder="Confirme a nova senha"
                />
              </div>
              <p className="text-sm text-muted-foreground col-span-4 text-center">
                Deixe em branco se não deseja alterar a senha
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            {/* Settings content can be added here */}
          </TabsContent>
        </Tabs>
      </div>
      
      <ModalFooter
        onCancel={onClose}
        onConfirm={onUpdateProfile}
        confirmText="Salvar alterações"
        cancelText="Cancelar"
        confirmDisabled={isUpdatingProfile}
        loading={isUpdatingProfile}
      />
    </GenericModal>
  )
}