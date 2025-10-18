"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthModal } from "@/components/auth-modal"
import { FeaturesCarousel } from "@/components/features-carousel"
import { Loading } from "@/components/ui/loading-spinner"
import { OptimizedBackgroundImage } from "@/components/OptimizedBackgroundImage"
import { OptimizedImage } from "@/components/OptimizedImage"

export default function HomeContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "forgot">("login")
  const [loginBackgroundImage, setLoginBackgroundImage] = useState<string | null>(null)
  const [loginBackgroundImages, setLoginBackgroundImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    linkedin: '',
    instagram: ''
  })
  
  const searchParams = useSearchParams()

  useEffect(() => {
    const authParam = searchParams.get('auth')
    if (authParam === 'login' || authParam === 'forgot') {
      setAuthModalTab(authParam)
      setIsAuthModalOpen(true)
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

  const openLoginModal = () => {
    setAuthModalTab("login")
    setIsAuthModalOpen(true)
  }

  const openForgotPasswordModal = () => {
    setAuthModalTab("forgot")
    setIsAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background optimize-text">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 to-primary/5 content-visibility-auto">
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
                priority={index === 0} // Priorizar carregamento da primeira imagem
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
        
        <div className="relative container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <OptimizedImage 
              src="/logo-portal-pratagy.png" 
              alt="Portal do Pratagy" 
              width={320}
              height={128}
              className="optimize-animate"
              priority={true}
            />
          </div>
          <p className="text-xl md:text-2xl text-foreground/90 dark:text-black dark:[text-shadow:_0_0_1px_white,_0_0_2px_white,_0_0_3px_white] mb-8 max-w-3xl mx-auto optimize-text font-medium leading-relaxed">
            Acesse procedimentos de gestão da qualidade, oportunidades de trabalho e eventos corporativos em um único lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mobile-optimize">
            {/* Login Button */}
            <Button 
              size="lg" 
              className="w-full sm:w-auto optimize-animate" 
              onClick={openLoginModal}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Fazer Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Carousel Section */}
      <section className="py-16 px-4 bg-muted/30 content-visibility-auto">
        <FeaturesCarousel />
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t content-visibility-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e Descrição */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <OptimizedImage 
                  src="/logo-portal-pratagy.png" 
                  alt="Portal do Pratagy" 
                  width={120}
                  height={48}
                  className=""
                />
              </div>
              <p className="text-muted-foreground mb-4 max-w-md optimize-text">
                Plataforma integrada para gestão da qualidade, oportunidades de trabalho e eventos corporativos. 
                Conectando pessoas e processos com eficiência e inovação.
              </p>
              <div className="flex space-x-4">
                {socialMediaLinks.facebook && (
                  <a 
                    href={socialMediaLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center optimize-animate hover:bg-primary/20 transition-colors"
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
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center optimize-animate hover:bg-primary/20 transition-colors"
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
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center optimize-animate hover:bg-primary/20 transition-colors"
                  >
                    <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="font-semibold mb-4 optimize-text">Links Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                    Início
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            {/* Recursos */}
            <div>
              <h4 className="font-semibold mb-4 optimize-text">Recursos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                    Gestão da Qualidade
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                    Recursos Humanos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                    Oportunidades
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                    Eventos Corporativos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                    Central de Ajuda
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-muted-foreground text-sm mb-4 md:mb-0 optimize-text">
                © 2024 Portal do Pratagy. Todos os direitos reservados.
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                  Política de Privacidade
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                  Termos de Uso
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors optimize-text">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  )
}