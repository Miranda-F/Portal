"use client"

import { useState, useEffect, useCallback } from "react"
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
  const { user, logout, loading: authLoading, authChecked } = useAuth()
  const [currentView, setCurrentView] = useState<string>('dashboard')

  // Handler para navegação da sidebar - otimizado com useCallback
  const handleSidebarNavigation = useCallback((href: string) => {
    const path = href.startsWith('/') ? href.substring(1) : href

    // Mapeamento direto de rotas para views
    const routeToViewMap: Record<string, string> = {
      'sobre-pratagy': 'sobre-pratagy',
      'organograma': 'organograma',
      'contato': 'contato',
      'ouvidoria': 'ouvidoria',
      'perfil': 'perfil',
      'usuario': 'dashboard'
    }

    // Tratar caso especial de missão e valores
    if (path === 'sobre-pratagy#nossa-identidade') {
      setCurrentView('missao-valores')
      return
    }

    // Verificar se é uma rota interna
    if (routeToViewMap[path]) {
      setCurrentView(routeToViewMap[path])
    } else {
      // Para outras rotas, fazer navegação normal
      window.location.href = href
    }
  }, [])

  // Efeito simplificado para gerenciar estado de loading - combinado em um único useEffect
  useEffect(() => {
    const loginInProgress = sessionStorage.getItem('loginInProgress') === 'true'
    
    // Limpar flag de login quando autenticação for concluída
    if (authChecked && !authLoading) {
      sessionStorage.removeItem('loginInProgress')
    }
  }, [authLoading, authChecked])

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
      
      {/* Layout with Sidebar and Header */}
      <div className="relative">
        {/* Sidebar positioned over header */}
        <UsuarioSidebar
          className="fixed top-0 left-0 h-screen z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300"
          onNavigate={handleSidebarNavigation}
        />
        
        {/* Header */}
        <UsuarioHeader hideMegaMenu={true} hideUserDropdownMenu={true} />

        {/* Main Content */}
        <main className="ml-0 lg:ml-64 min-h-screen">
          <div className="container mx-auto px-4 py-8 pt-20 lg:pt-8">
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
                  {currentView === 'perfil' && <PerfilContent sectors={[]} />}
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
          </div>
        </main>
      </div>
    </div>
  )
}