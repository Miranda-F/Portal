'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Upload, Loader2, Image, Trash2 } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

interface AdminGeneralProps {
  onSettingsUpdate: () => void
}

export default function AdminGeneral({
  onSettingsUpdate
}: AdminGeneralProps) {
  
  const { toast } = useToast()
  
  // Estados para gerenciamento das imagens de fundo do login
  const [loginBackgroundImage, setLoginBackgroundImage] = useState<string | null>(null)
  const [loginBackgroundImages, setLoginBackgroundImages] = useState<string[]>([])
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  const [isDeletingBackground, setIsDeletingBackground] = useState(false)
  
  // Estados para gerenciamento das redes sociais
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    linkedin: '',
    instagram: ''
  })
  const [isSavingSocialMedia, setIsSavingSocialMedia] = useState(false)

  useEffect(() => {
    loadLoginBackground()
    loadSocialMediaSettings()
  }, [])

  const loadLoginBackground = async () => {
    try {
      const response = await fetch('/api/admin/login-background', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setLoginBackgroundImage(data.backgroundImageUrl)
        setLoginBackgroundImages(data.backgroundImages || [])
      }
    } catch (error) {
      console.error('Error fetching login background:', error)
    }
  }

  const loadSocialMediaSettings = async () => {
    try {
      const response = await fetch('/api/admin/social-media', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setSocialMediaLinks(data)
      }
    } catch (error) {
      console.error('Error fetching social media settings:', error)
    }
  }

  const handleBackgroundImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploadingBackground(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i])
      }

      const response = await fetch('/api/admin/login-background', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setLoginBackgroundImage(data.backgroundImageUrl)
        setLoginBackgroundImages(data.backgroundImages || [])
        toast({
          title: "Sucesso",
          description: "Imagens de fundo enviadas com sucesso.",
        })
        onSettingsUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível enviar as imagens.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error uploading background images:', error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar as imagens.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingBackground(false)
      // Reset the file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const handleDeleteBackgroundImage = async (imageName: string) => {
    setIsDeletingBackground(true)
    try {
      const response = await fetch('/api/admin/login-background', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ imageName }),
      })

      if (response.ok) {
        const data = await response.json()
        setLoginBackgroundImage(data.backgroundImageUrl)
        setLoginBackgroundImages(data.backgroundImages || [])
        toast({
          title: "Sucesso",
          description: "Imagem de fundo excluída com sucesso.",
        })
        onSettingsUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível excluir a imagem.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting background image:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a imagem.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingBackground(false)
    }
  }

  const handleSaveSocialMedia = async () => {
    setIsSavingSocialMedia(true)
    try {
      const response = await fetch('/api/admin/social-media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(socialMediaLinks),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Links das redes sociais salvos com sucesso.",
        })
        onSettingsUpdate()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Não foi possível salvar os links.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error saving social media links:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar os links.",
        variant: "destructive",
      })
    } finally {
      setIsSavingSocialMedia(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Configurações Gerais</h2>
      </div>

      {/* Login Background Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Imagem de Fundo do Login</CardTitle>
          <CardDescription>
            Configure a imagem de fundo da página de login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Background Image */}
          {loginBackgroundImage && (
            <div className="space-y-2">
              <Label>Imagem Atual</Label>
              <div className="relative group">
                <img
                  src={loginBackgroundImage}
                  alt="Imagem de fundo atual"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    const imageName = loginBackgroundImage.split('/').pop() || ''
                    handleDeleteBackgroundImage(imageName)
                  }}
                  disabled={isDeletingBackground}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Background Images Gallery */}
          {loginBackgroundImages.length > 0 && (
            <div className="space-y-2">
              <Label>Galeria de Imagens</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loginBackgroundImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Imagem de fundo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        // Set as current background
                        const imageName = image.split('/').pop() || ''
                        fetch('/api/admin/login-background/set-current', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          credentials: 'include',
                          body: JSON.stringify({ imageName }),
                        }).then(response => {
                          if (response.ok) {
                            setLoginBackgroundImage(image)
                            toast({
                              title: "Sucesso",
                              description: "Imagem de fundo atualizada com sucesso.",
                            })
                          }
                        })
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const imageName = image.split('/').pop() || ''
                        handleDeleteBackgroundImage(imageName)
                      }}
                      disabled={isDeletingBackground}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Background */}
          <div className="space-y-2">
            <Label>Enviar Nova Imagem</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  id="background-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBackgroundImageUpload}
                  className="hidden"
                  disabled={isUploadingBackground}
                />
                <Button
                  onClick={() => document.getElementById('background-image-upload')?.click()}
                  disabled={isUploadingBackground}
                  className="w-full"
                >
                  {isUploadingBackground ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Imagem
                    </>
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB por imagem.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Redes Sociais</CardTitle>
          <CardDescription>
            Configure os links das redes sociais para o rodapé do site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook-url">Facebook</Label>
              <Input
                id="facebook-url"
                placeholder="https://facebook.com/sua-pagina"
                value={socialMediaLinks.facebook}
                onChange={(e) => setSocialMediaLinks(prev => ({ ...prev, facebook: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkedin-url">LinkedIn</Label>
              <Input
                id="linkedin-url"
                placeholder="https://linkedin.com/company/sua-empresa"
                value={socialMediaLinks.linkedin}
                onChange={(e) => setSocialMediaLinks(prev => ({ ...prev, linkedin: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instagram-url">Instagram</Label>
              <Input
                id="instagram-url"
                placeholder="https://instagram.com/sua-empresa"
                value={socialMediaLinks.instagram}
                onChange={(e) => setSocialMediaLinks(prev => ({ ...prev, instagram: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSocialMedia} disabled={isSavingSocialMedia}>
              {isSavingSocialMedia ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Links'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}