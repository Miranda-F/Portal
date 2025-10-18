"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MegaMenu } from "@/components/mega-menu"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { Home, ArrowLeft, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings } from "lucide-react"

export default function SobrePratagyPage() {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState<'historia' | 'identidade' | 'organograma'>('historia')

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/usuario" className="flex items-center space-x-2">
              <img 
                src="/logo-portal-pratagy.png" 
                alt="Portal do Pratagy" 
                className="h-12 w-auto cursor-pointer"
              />
            </Link>
          </div>

          {/* Center - Mega Menu */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <MegaMenu hideNossaEmpresa={true} />
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu */}
            <div className="lg:hidden">
              <MegaMenu hideNossaEmpresa={true} />
            </div>
            <ThemeToggle />
            {user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    {user.photoUrl ? (
                      <img 
                        src={user.photoUrl} 
                        alt={user.name} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
                        {user.name ? getInitials(user.name) : 'U'}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'ADMIN' ? (
                    <>
                      <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Painel administrativo</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => window.location.href = '/usuario'}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Meu Painel</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => {
                    logout()
                    window.location.href = '/'
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/usuario">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Área do Usuário
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-12">
        {/* Título da Página com Imagem de Fundo */}
        <div className="relative mb-16 rounded-2xl overflow-hidden shadow-2xl">
          {/* Imagem de fundo */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/resort-background.jpg')" }}
          />
          
          {/* Overlay para melhorar a legibilidade do texto */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          
          {/* Conteúdo do card */}
          <div className="relative z-10 text-center p-16 md:p-20">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Sobre o Resort Pratagy
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
              Conheça a história, os valores e o compromisso que fazem do Resort Pratagy um destino único e inesquecível.
            </p>
          </div>
        </div>

        {/* Breadcrumb de Navegação */}
        <nav className="mb-8" aria-label="Navegação de seções">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => setActiveSection('historia')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                activeSection === 'historia'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>Sobre o Pratagy</span>
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => setActiveSection('identidade')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                activeSection === 'identidade'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>Missão, Visão e Valores</span>
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => setActiveSection('organograma')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                activeSection === 'organograma'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>Organograma</span>
            </button>
          </div>
        </nav>

        {/* Conteúdo Condicional das Seções */}
        <div className="mb-16">
          {/* Seção Nossa História */}
          {activeSection === 'historia' && (
            <div className="mb-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-4">
                  Nossa História
                </h2>
                <p className="text-lg text-blue-600 dark:text-blue-300 max-w-2xl mx-auto">
                  Conheça a jornada do Resort Pratagy desde sua fundação até se tornar um dos principais resorts do Nordeste brasileiro
                </p>
              </div>
              
              <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg max-w-4xl mx-auto">
                <CardContent className="space-y-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    O Resort Pratagy nasceu do sonho de criar um refúgio paradisíaco que combinasse o melhor da natureza com o conforto e sofisticação que nossos hóspedes merecem. Desde a nossa fundação, temos nos dedicado a oferecer experiências únicas que criam memórias duradouras.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    Localizado em uma das praias mais deslumbrantes do Nordeste brasileiro, nosso resort foi projetado para harmonizar luxo e sustentabilidade, respeitando o meio ambiente local enquanto proporciona o máximo em conforto e entretenimento.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    Ao longo dos anos, transformamos desafios em oportunidades e continuamos a evoluir, sempre mantendo nosso compromisso com a excelência e a satisfação dos nossos hóspedes.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Seção Nossa Identidade - Missão, Visão e Valores */}
          {activeSection === 'identidade' && (
            <div className="mb-16" id="nossa-identidade">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-4">
                  Nossa Identidade
                </h2>
                <p className="text-lg text-blue-600 dark:text-blue-300 max-w-2xl mx-auto">
                  Conheça os pilares que guiam o Resort Pratagy, com os cards Missão, Visão e Valores
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Missão */}
                <Card className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white font-bold text-2xl">M</span>
                  </div>
                  <h3 className="font-semibold text-xl mb-4 text-blue-800 dark:text-blue-200">Missão</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    Proporcionar experiências memoráveis e únicas, superando as expectativas dos nossos hóspedes através de um serviço excepcional, conforto e hospitalidade genuína em um paraíso tropical.
                  </p>
                </Card>
                
                {/* Visão */}
                <Card className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-l-4 border-l-green-500 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white font-bold text-2xl">V</span>
                  </div>
                  <h3 className="font-semibold text-xl mb-4 text-green-800 dark:text-green-200">Visão</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    Ser reconhecido como o principal resort de luxo do Nordeste brasileiro, referência em excelência de serviços, sustentabilidade e inovação na hospitalidade.
                  </p>
                </Card>
                
                {/* Valores */}
                <Card className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-l-4 border-l-purple-500 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white font-bold text-2xl">V</span>
                  </div>
                  <h3 className="font-semibold text-xl mb-4 text-purple-800 dark:text-purple-200">Valores</h3>
                  <div className="text-left space-y-3">
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-purple-700 dark:text-purple-300 min-w-0">Excelência:</span>
                      <span className="text-gray-700 dark:text-gray-300">Buscar sempre o melhor em tudo o que fazemos.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-purple-700 dark:text-purple-300 min-w-0">Integridade:</span>
                      <span className="text-gray-700 dark:text-gray-300">Agir com ética e transparência.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-purple-700 dark:text-purple-300 min-w-0">Inovação:</span>
                      <span className="text-gray-700 dark:text-gray-300">Criar soluções criativas e sustentáveis.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-purple-700 dark:text-purple-300 min-w-0">Respeito:</span>
                      <span className="text-gray-700 dark:text-gray-300">Valorizar pessoas e o meio ambiente.</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Seção Organograma (Placeholder) */}
          {activeSection === 'organograma' && (
            <div className="mb-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-4">
                  Organograma
                </h2>
                <p className="text-lg text-blue-600 dark:text-blue-300 max-w-2xl mx-auto">
                  Estrutura organizacional do Resort Pratagy
                </p>
              </div>
              
              <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg max-w-4xl mx-auto">
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">OR</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
                    Organograma em Desenvolvimento
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    A estrutura organizacional completa do Resort Pratagy estará disponível em breve. Esta seção exibirá o organograma detalhado com todos os departamentos e posições da nossa equipe.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img 
                src="/logo-portal-pratagy.png" 
                alt="Portal do Pratagy" 
                className="h-8 w-auto"
              />
              <span className="font-bold text-lg">Portal Pratagy</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 Portal Pratagy. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}