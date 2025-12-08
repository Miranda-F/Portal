"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/theme-toggle"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

import { Loading } from "@/components/ui/loading-spinner"
import { OptimizedBackgroundImage } from "@/components/OptimizedBackgroundImage"
import { OptimizedImage } from "@/components/OptimizedImage"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState<"login" | "forgot">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loginBackgroundImage, setLoginBackgroundImage] = useState<string | null>(null)
  const [loginBackgroundImages, setLoginBackgroundImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    linkedin: '',
    instagram: ''
  })
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState("")
  
  // Carousel auto-play
  const [carouselApi, setCarouselApi] = useState<any>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  useEffect(() => {
    const authParam = searchParams.get('auth')
    if (authParam === 'login' || authParam === 'forgot') {
      setActiveTab(authParam)
    }
  }, [searchParams])

  // Load login background images
  useEffect(() => {
    const loadLoginBackgrounds = async () => {
      try {
        const response = await fetch('/api/admin/login-background')
        if (response.ok) {
          const data = await response.json()
          if (data.backgroundImages && data.backgroundImages.length > 0) {
            setLoginBackgroundImages(data.backgroundImages)
            setLoginBackgroundImage(data.backgroundImages[0])
            setCurrentImageIndex(0)
          } else if (data.backgroundImageUrl) {
            // Fallback para compatibilidade
            setLoginBackgroundImages([data.backgroundImageUrl])
            setLoginBackgroundImage(data.backgroundImageUrl)
            setCurrentImageIndex(0)
          }
        }
      } catch (error) {
        console.error('Error loading login backgrounds:', error)
      }
    }

    loadLoginBackgrounds()
  }, [])

  // Auto-rotate background images every 4 seconds
  useEffect(() => {
    if (loginBackgroundImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % loginBackgroundImages.length
        setLoginBackgroundImage(loginBackgroundImages[nextIndex])
        return nextIndex
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [loginBackgroundImages])

  // Load social media links
  useEffect(() => {
    const loadSocialMediaLinks = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSocialMediaLinks({
            facebook: data.social_facebook_url || '',
            linkedin: data.social_linkedin_url || '',
            instagram: data.social_instagram_url || ''
          })
        }
      } catch (error) {
        console.error('Error loading social media links:', error)
      }
    }

    loadSocialMediaLinks()
  }, [])

  // Carousel auto-play
  useEffect(() => {
    if (!carouselApi) return

    const interval = setInterval(() => {
      // Verifica se chegou ao último slide
      const selectedIndex = carouselApi.selectedScrollSnap()
      const scrollSnapList = carouselApi.scrollSnapList()
      
      if (selectedIndex === scrollSnapList.length - 1) {
        // Se está no último, vai para o primeiro
        carouselApi.scrollTo(0, true)
      } else {
        // Senão, vai para o próximo
        carouselApi.scrollNext()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [carouselApi])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Set a flag in sessionStorage to indicate login is in progress
      sessionStorage.setItem('loginInProgress', 'true')
      
      // Use the login function from use-auth hook which updates auth state immediately
      await login(loginEmail, loginPassword)
      
      // Clear the login flag
      sessionStorage.removeItem('loginInProgress')
      
      // Redirect based on user role
      // Wait a bit for the auth state to be updated
      setTimeout(() => {
        const userRole = sessionStorage.getItem('userRole')
        if (userRole === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/usuario')
        }
      }, 100)
    } catch (error) {
      // Toast is already handled by the login function
      console.error('Login error in component:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar redefinição de senha')
      }

      setIsSubmitted(true)
      // Toast is already handled by the forgot password API response
    } catch (error) {
      // Toast is already handled by the API response
      console.error('Forgot password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForgotPasswordForm = () => {
    setForgotEmail("")
    setIsSubmitted(false)
  }

  return (
    <div className="min-h-screen bg-background optimize-text">
      {/* Split Login Layout */}
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-muted/30">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-12 px-8">
              <OptimizedImage 
                src="/Logo-p-pratagy.webp" 
                alt="Portal do Pratagy" 
                width={280}
                height={112}
                className="optimize-animate"
                priority={true}
              />
            </div>

            {/* Login Form */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-border/50">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta</h1>
                <p className="text-muted-foreground">Acesse sua conta para continuar</p>
              </div>

              {activeTab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu.email@pratagy.com.br"
                        className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
                        className="pl-10 pr-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-all duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember-me" className="text-sm">
                        Salvar informações
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm p-0 h-auto transition-all duration-200 hover:text-primary/80"
                      onClick={() => setActiveTab("forgot")}
                    >
                      Esqueceu sua senha?
                    </Button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Entrando...
                      </div>
                    ) : (
                      "Começar sessão"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  {!isSubmitted ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Esqueceu sua senha?</h3>
                        <p className="text-sm text-muted-foreground">
                          Digite seu email e enviaremos um link para redefinir sua senha
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="seu.email@pratagy.com.br"
                            className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-11 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Enviando...
                          </div>
                        ) : (
                          "Enviar link de recuperação"
                        )}
                      </Button>

                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => {
                          setActiveTab("login")
                          resetForgotPasswordForm()
                        }}
                        className="w-full h-11 transition-all duration-200 hover:scale-[1.02]"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para o Login
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Email enviado!</h3>
                        <p className="text-sm text-muted-foreground">
                          Enviamos um link para {forgotEmail}. Verifique sua caixa de entrada e siga as instruções.
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setActiveTab("login")
                          resetForgotPasswordForm()
                        }}
                        className="w-full h-11 transition-all duration-200 hover:scale-[1.02]"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para o Login
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Legal Links */}
            <div className="flex justify-center space-x-6 text-sm mt-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text transition-all duration-200 hover:translate-x-1">
                Política de Privacidade
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text transition-all duration-200 hover:translate-x-1">
                Termos de Uso
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text transition-all duration-200 hover:translate-x-1">
                Cookies
              </a>
            </div>
          </div>
        </div>

        {/* Right Side - Images */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 p-4">
          {/* Background Images with Transition */}
          {loginBackgroundImages.length > 0 && (
            <>
              {loginBackgroundImages.map((image, index) => (
                <OptimizedBackgroundImage
                  key={image}
                  src={image}
                  alt="Background do Portal Pratagy"
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority={index === 0}
                />
              ))}
              {/* Image Indicators */}
              {loginBackgroundImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {loginBackgroundImages.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => {
                        setCurrentImageIndex(index)
                        setLoginBackgroundImage(loginBackgroundImages[index])
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Theme Toggle Button */}
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>

          {/* Overlay Content */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-8">
            <div className="text-center text-white max-w-5xl w-full">
              <p className="text-lg lg:text-xl mb-8 drop-shadow-md leading-relaxed">
                Acesse documentos de gestão da qualidade, oportunidades de trabalho e eventos corporativos em um único lugar.
              </p>
              
              {/* Cards Carousel */}
              <div className="w-full max-w-5xl mx-auto">
                <Carousel 
                  opts={{ 
                    align: "start", 
                    loop: false,
                    dragFree: false,
                    containScroll: "keepSnaps"
                  }} 
                  className="w-full"
                  setApi={setCarouselApi}
                >
                  <CarouselContent>
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 h-full">
                        <h3 className="font-semibold mb-2">Gestão da Qualidade</h3>
                        <p className="text-sm opacity-90">Procedimentos e documentos atualizados</p>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 h-full">
                        <h3 className="font-semibold mb-2">Recursos Humanos</h3>
                        <p className="text-sm opacity-90">Oportunidades e desenvolvimento</p>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 h-full">
                        <h3 className="font-semibold mb-2">Eventos</h3>
                        <p className="text-sm opacity-90">Eventos corporativos e treinamentos</p>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 h-full">
                        <h3 className="font-semibold mb-2">Missão, Visão e Valores</h3>
                        <p className="text-sm opacity-90">Conheça os pilares que guiam nossa organização e moldam nossa cultura</p>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex -left-16" />
                  <CarouselNext className="hidden md:flex -right-16" />
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Footer */}
      <footer className="bg-muted/50 border-t content-visibility-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Logo */}
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <OptimizedImage 
                src="/logo-portal-pratagy.webp" 
                alt="Portal do Pratagy" 
                width={200}
                height={80}
                className="h-16 w-auto object-contain"
              />
              <p className="text-muted-foreground text-sm optimize-text">
                © 2024 Portal do Pratagy. Todos os direitos reservados.
              </p>
            </div>
            
            {/* Texto e Redes Sociais - Alinhado à direita */}
            <div className="text-center lg:text-right">
              <p className="text-muted-foreground mb-4 max-w-md mx-auto lg:ml-auto optimize-text">
                Plataforma integrada para gestão da qualidade, oportunidades de trabalho e eventos corporativos. 
                Conectando pessoas e processos com eficiência e inovação.
              </p>
              <div className="flex justify-center lg:justify-end space-x-4">
                {socialMediaLinks.facebook && (
                  <a 
                    href={socialMediaLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center optimize-animate hover:bg-primary/20 transition-all duration-200 hover:scale-110"
                  >
                    <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {socialMediaLinks.linkedin && (
                  <a 
                    href={socialMediaLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center optimize-animate hover:bg-primary/20 transition-all duration-200 hover:scale-110"
                  >
                    <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                )}
                {socialMediaLinks.instagram && (
                  <a 
                    href={socialMediaLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center optimize-animate hover:bg-primary/20 transition-all duration-200 hover:scale-110"
                  >
                    <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8">
          </div>
        </div>
      </footer>
    </div>
  )
}