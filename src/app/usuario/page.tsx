"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Sora } from "next/font/google"

const sora = Sora({ subsets: ["latin"], weight: ["600", "700"] })

// Components
import { UsuarioHeader } from "@/components/usuario/UsuarioHeader"
import { UsuarioSidebar } from "@/components/usuario/UsuarioSidebar"
import { SobrePratagyContentEditable as SobrePratagyContent } from "@/components/usuario/SobrePratagyContent"
import { MissaoValoresContent } from "@/components/usuario/MissaoValoresContent"
import { OrganogramaContent } from "@/components/usuario/OrganogramaContent"
import { PerfilContent } from "@/components/usuario/PerfilContent"

export default function UsuarioPage() {
  const router = useRouter()
  const { user, logout, loading: authLoading, authChecked } = useAuth()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentView, setCurrentView] = useState<string>('dashboard') // 'dashboard', 'sobre-pratagy', etc.

  // Handler para navegação da sidebar
  const handleSidebarNavigation = (href: string) => {
    // Extrair o path sem a barra inicial
    const path = href.startsWith('/') ? href.substring(1) : href

    // Se for uma rota interna que queremos carregar dinamicamente
    if (path === 'sobre-pratagy' || path === 'organograma' || path === 'contato' || path === 'ouvidoria' || path === 'perfil') {
      setCurrentView(path)
    } else if (path === 'sobre-pratagy#nossa-identidade') {
      // Missão e Valores - carregar sobre-pratagy com seção de identidade
      setCurrentView('missao-valores')
    } else if (path === 'usuario') {
      setCurrentView('dashboard')
    } else {
      // Para outras rotas, fazer navegação normal
      window.location.href = href
    }
  }

  // Efeito para detectar transição de login e evitar flash de mensagem
  useEffect(() => {
    // Check if login is in progress
    const loginInProgress = sessionStorage.getItem('loginInProgress') === 'true'

    // Se estamos carregando autenticação ou login está em progresso, mostramos loading
    if (authLoading || loginInProgress) {
      setIsTransitioning(true)
      return
    }

    // Se a autenticação foi verificada e temos um usuário, terminamos a transição
    if (authChecked && user) {
      setIsTransitioning(false)
      // Clear any lingering login flags
      sessionStorage.removeItem('loginInProgress')
      return
    }

    // Se a autenticação foi verificada e não temos usuário, mas estávamos em transição,
    // damos um tempo para o redirecionamento acontecer
    if (authChecked && !user && !authLoading) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        // Clear login flags if we end up here
        sessionStorage.removeItem('loginInProgress')
      }, 1000) // Pequeno delay para permitir redirecionamento

      return () => clearTimeout(timer)
    }
  }, [user, authLoading, authChecked])

  // Cleanup effect to clear login flags when component unmounts
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('loginInProgress')
    }
  }, [])

  // Show loading only while auth is being checked for the first time
  if (authLoading && !authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <UsuarioHeader hideMegaMenu={true} />

      {/* Layout with Sidebar */}
      <div className="flex">
        <UsuarioSidebar
          className="sticky top-16 h-[calc(100vh-4rem)]"
          onNavigate={handleSidebarNavigation}
        />

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          {currentView === 'dashboard' ? (
            <>
              {/* Welcome Section */}
              <div className="mb-8 animate-fade-in-up">
                <h2 className={`text-3xl font-bold mb-2 ${sora.className} text-slate-900 dark:text-slate-100`}>Seu Painel</h2>
              </div>
            </>
          ) : (
            <>
              {/* Dynamic Content */}
              <div className="animate-fade-in-up">
                {currentView === 'sobre-pratagy' && <SobrePratagyContent />}
                {currentView === 'missao-valores' && <MissaoValoresContent />}
                {currentView === 'organograma' && <OrganogramaContent />}
                {currentView === 'perfil' && <PerfilContent profileManagement={{}} sectors={[]} />}
                {currentView === 'contato' && (
                  <div className="text-center p-12">
                    <h2 className={`text-3xl font-bold mb-4 ${sora.className}`}>Contato</h2>
                    <p className="text-muted-foreground">Conteúdo em desenvolvimento...</p>
                  </div>
                )}
                {currentView === 'ouvidoria' && (
                  <div className="text-center p-12">
                    <h2 className={`text-3xl font-bold mb-4 ${sora.className}`}>Ouvidoria</h2>
                    <p className="text-muted-foreground">Conteúdo em desenvolvimento...</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}