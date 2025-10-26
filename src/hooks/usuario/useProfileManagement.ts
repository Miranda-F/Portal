"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

interface ProfileForm {
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

export function useProfileManagement() {
  const { user, refreshAuth } = useAuth()
  const { toast } = useToast()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState("")
  const [isCroppingPortalLogo, setIsCroppingPortalLogo] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "",
    email: "",
    sectorId: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    photoUrl: "",
    photoFile: null,
    showIdentityCard: false
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [latestPhotoUrl, setLatestPhotoUrl] = useState<string | null>(null)
  const [photoRemoved, setPhotoRemoved] = useState(false)

  const openProfileModal = () => {
    if (user) {
      // Verificar se temos uma URL de foto mais recente no latestPhotoUrl ou no profileForm
      const latestPhotoUrlFromState = latestPhotoUrl || (profileForm.photoUrl && !profileForm.photoUrl.startsWith('data:') ? profileForm.photoUrl : null)
      const photoUrlToUse = latestPhotoUrlFromState || user.photoUrl
      
      // Forçar a atualização da foto usando um timestamp para evitar cache
      const photoUrl = photoUrlToUse ? `${photoUrlToUse}?t=${Date.now()}` : ""
      
      setProfileForm({
        name: user.name,
        email: user.email,
        sectorId: user.sectorId || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        photoUrl: photoUrl,
        photoFile: null,
        showIdentityCard: user.showIdentityCard || false
      })
      // Resetar o estado de remoção quando o modal é aberto
      setPhotoRemoved(false)
      setShowProfileModal(true)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImageToCrop(previewUrl)
      setIsCroppingPortalLogo(false) // Indicar que estamos cortando a foto de perfil
      setShowImageCropper(true)
      // Fechar o modal de perfil para evitar conflitos de eventos
      setShowProfileModal(false)
    }
  }

  const handleCropComplete = (croppedImage: string) => {
    
    // Usar diretamente a imagem recortada como preview
    const newPhotoUrl = croppedImage
    
    setProfileForm(prev => ({
      ...prev,
      photoUrl: newPhotoUrl // Usar diretamente o base64 retornado pelo ImageCropper
    }))
    
    // Converter para File apenas quando for salvar
    fetch(croppedImage)
      .then(res => res.blob())
      .then(blob => {
        
        // Ensure the blob is converted to a valid File object
        const file = new File([blob], "profile-photo.jpg", { 
          type: "image/jpeg",
          lastModified: Date.now()
        })
        
        // Atualizar o form com o arquivo
        setProfileForm(prev => ({
          ...prev,
          photoFile: file
        }))
        
        // Reabrir o modal de perfil após o recorte e um pequeno delay para garantir que o estado seja atualizado
        setTimeout(() => {
          setShowProfileModal(true)
        }, 100)
      })
      .catch(error => {
        console.error('Error converting cropped image to file:', error)
        toast({
          title: "Erro",
          description: "Não foi possível processar a imagem recortada",
          variant: "destructive",
        })
        // Ainda assim reabrir o modal
        setTimeout(() => {
          setShowProfileModal(true)
        }, 100)
      })
    
    setShowImageCropper(false)
    setImageToCrop("")
  }

  const handleCropCancel = () => {
    setShowImageCropper(false)
    setImageToCrop("")
    setIsCroppingPortalLogo(false)
    // Reabrir o modal correspondente
    if (isCroppingPortalLogo) {
      // setShowPortalLogoModal(true) - This would need to be passed in or handled differently
    } else {
      setShowProfileModal(true)
    }
  }

  const removePhoto = () => {
    setProfileForm({
      ...profileForm,
      photoFile: null,
      photoUrl: ""
    })
    // Limpar o latestPhotoUrl também
    setLatestPhotoUrl(null)
    setPhotoRemoved(true) // Indicar que a foto foi removida
  }

  const updateProfile = async () => {
    try {
      setIsUpdatingProfile(true)
      
      // Validate passwords if new password is provided
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        toast({
          title: "Erro",
          description: "A nova senha e a confirmação não coincidem.",
          variant: "destructive",
        })
        setIsUpdatingProfile(false)
        return
      }

      // Create FormData for file upload
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
      
      // Verificar se a foto foi removida (photoUrl está vazio mas usuário tinha foto antes)
      if (!profileForm.photoUrl && user?.photoUrl) {
        formData.append('removePhoto', 'true')
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData,
      })

      if (response.ok) {
        const updatedUser = await response.json()
        
        // Verificar se a photoUrl foi retornada corretamente
        if (updatedUser.photoUrl) {
          // Garantir que a URL seja válida
          const photoUrl = updatedUser.photoUrl.startsWith('http') 
            ? updatedUser.photoUrl 
            : `${window.location.origin}${updatedUser.photoUrl}`
          
          // ATUALIZAR O PROFILEFORM COM A NOVA URL DA FOTO E CACHE-BUSTING
          const photoUrlWithTimestamp = `${updatedUser.photoUrl}?t=${Date.now()}`
          setProfileForm(prev => ({
            ...prev,
            photoUrl: photoUrlWithTimestamp,
            photoFile: null // Limpar o arquivo já que foi salvo
          }))
          
          // ATUALIZAR O LATEST PHOTO URL PARA O AVATAR PRINCIPAL
          setLatestPhotoUrl(photoUrlWithTimestamp)
          setPhotoRemoved(false) // Resetar o estado de remoção quando uma nova foto é adicionada
        } else {
          // Se não houver photoUrl, significa que a foto foi removida
          setProfileForm(prev => ({
            ...prev,
            photoUrl: "",
            photoFile: null
          }))
          setLatestPhotoUrl(null)
          setPhotoRemoved(true) // Indicar que a foto foi removida
        }
        
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!",
        })
        setShowProfileModal(false)
        // Atualizar os dados do usuário sem recarregar a página
        await refreshAuth()
      } else {
        const error = await response.json()
        console.error('Profile update error:', error)
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

  return {
    showProfileModal,
    setShowProfileModal,
    showImageCropper,
    setShowImageCropper,
    imageToCrop,
    isCroppingPortalLogo,
    profileForm,
    setProfileForm,
    isUpdatingProfile,
    latestPhotoUrl,
    setLatestPhotoUrl,
    photoRemoved,
    setPhotoRemoved,
    openProfileModal,
    handlePhotoChange,
    handleCropComplete,
    handleCropCancel,
    removePhoto,
    updateProfile
  }
}