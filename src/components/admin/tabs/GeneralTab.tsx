'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Trash2, Loader2, Image, Eye } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

interface GeneralTabProps {
  activeTab: string
}

interface SocialMediaLinks {
  facebook: string
  linkedin: string
  instagram: string
}

export default function GeneralTab({ activeTab }: GeneralTabProps) {
  const { toast } = useToast()
  const [loginBackgroundImage, setLoginBackgroundImage] = useState<string | null>(null)
  const [loginBackgroundImages, setLoginBackgroundImages] = useState<string[]>([])
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  const [isDeletingBackground, setIsDeletingBackground] = useState(false)
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLinks>({
    facebook: '',
    linkedin: '',
    instagram: ''
  })
  const [isSavingSocialMedia, setIsSavingSocialMedia] = useState(false)

  useEffect(() => {
    if (activeTab === "general") {
      loadLoginBackground()
      loadSocialMediaSettings()
    }
  }, [activeTab])

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
      const response = await fetch('/api/admin/settings', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setSocialMediaLinks({
          facebook: data.social_facebook_url || '',
          linkedin: data.social_linkedin_url || '',
          instagram: data.social_instagram_url || ''
        })
      }
    } catch (error) {
      console.error('Error fetching social media settings:', error)
    }
  }

  const handleSaveSocialMedia = async () => {
    try {
      setIsSavingSocialMedia(true)
      
      const settings = [
        { key: 'social_facebook_url', value: socialMediaLinks.facebook },
        { key: 'social_linkedin_url', value: socialMediaLinks.linkedin },
        { key: 'social_instagram_url', value: socialMediaLinks.instagram }
      ]
      
      for (const setting of settings) {
        const response = await fetch('/api/admin/settings', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(setting),
        })
        
        if (!response.ok) {
          throw new Error(`Failed to save ${setting.key}`)
        }
      }
      
      toast({
        title: "Sucesso",
        description: "Links de redes sociais atualizados com sucesso",
      })
    } catch (error) {
      console.error('Error saving social media settings:', error)
      toast({
        title: "Erro",
        description: "Falha ao salvar links de redes sociais",
      })
    } finally {
      setIsSavingSocialMedia(false)
    }
  }

  const handleBackgroundImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploadingBackground(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('backgroundImages', files[i])
      }

      const response = await fetch('/api/admin/login-background', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.backgroundImages && data.backgroundImages.length > 0) {
          setLoginBackgroundImages(data.backgroundImages)
          setLoginBackgroundImage(data.backgroundImages[0])
          toast({
            title: "Sucesso",
            description: `${data.backgroundImages.length} imagem(ns) enviada(s) com sucesso`,
          })
        }
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Falha ao enviar imagens de fundo",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar imagens de fundo",
        variant: "destructive",
      })
    } finally {
      setIsUploadingBackground(false)
      event.target.value = ''
    }
  }

  const handleBackgroundImageDelete = async (fileName?: string) => {
    setIsDeletingBackground(true)
    try {
      let url = '/api/admin/login-background'
      if (fileName) {
        url += `?fileName=${encodeURIComponent(fileName)}`
      }

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        if (fileName) {
          const updatedImages = loginBackgroundImages.filter(img => !img.includes(fileName))
          setLoginBackgroundImages(updatedImages)
          
          if (loginBackgroundImage?.includes(fileName) && updatedImages.length > 0) {
            setLoginBackgroundImage(updatedImages[0])
          } else if (updatedImages.length === 0) {
            setLoginBackgroundImage(null)
          }
          
          toast({
            title: "Sucesso",
            description: "Imagem removida com sucesso",
          })
        } else {
          setLoginBackgroundImage(null)
          setLoginBackgroundImages([])
          toast({
            title: "Sucesso",
            description: "Todas as imagens de fundo foram removidas",
          })
        }
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Falha ao remover imagem de fundo",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover imagem de fundo",
        variant: "destructive",
      })
    } finally {
      setIsDeletingBackground(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Geral</h1>
        <p className="text-muted-foreground">
          Configurações gerais do sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-3">
                  Personalize as imagens de fundo da página de login (tamanho recomendado: 1920x1080px, máximo 50MB cada). 
                  Você pode selecionar múltiplas imagens para criar uma apresentação automática.
                </p>
                
                {loginBackgroundImages.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm font-medium">
                      {loginBackgroundImages.length} imagem(ns) cadastrada(s)
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {loginBackgroundImages.map((image, index) => (
                        <div key={image} className="relative rounded-lg overflow-hidden border group">
                          <img 
                            src={image} 
                            alt={`Imagem de fundo ${index + 1}`} 
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setLoginBackgroundImage(image)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                title="Definir como principal"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const fileName = image.split('/').pop()
                                  if (fileName) handleBackgroundImageDelete(fileName)
                                }}
                                disabled={isDeletingBackground}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                title="Remover imagem"
                              >
                                {isDeletingBackground ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          {image === loginBackgroundImage && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('background-image-upload')?.click()}
                        disabled={isUploadingBackground}
                        className="flex-1"
                      >
                        {isUploadingBackground ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Adicionar Imagens
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBackgroundImageDelete()}
                        disabled={isDeletingBackground}
                      >
                        {isDeletingBackground ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover Todas
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" alt="" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Nenhuma imagem de fundo configurada
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('background-image-upload')?.click()}
                        disabled={isUploadingBackground}
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
                )}
                
                <input
                  id="background-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBackgroundImageUpload}
                  className="hidden"
                  disabled={isUploadingBackground}
                />
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-3">
                  Configure os links das redes sociais para o rodapé do site
                </p>
                
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
                      placeholder="https://instagram.com/sua-pagina"
                      value={socialMediaLinks.instagram}
                      onChange={(e) => setSocialMediaLinks(prev => ({ ...prev, instagram: e.target.value }))}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSaveSocialMedia}
                    disabled={isSavingSocialMedia}
                    className="w-full"
                  >
                    {isSavingSocialMedia ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Links de Redes Sociais'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>
              Informações básicas sobre o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Versão</span>
                <span className="text-sm text-muted-foreground">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Ambiente</span>
                <span className="text-sm text-muted-foreground">Desenvolvimento</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Última Atualização</span>
                <span className="text-sm text-muted-foreground">Hoje</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}