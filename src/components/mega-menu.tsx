"use client"

import { useState } from "react"
import { ChevronDown, Menu, X, Building2, FileText, MessageSquare, Phone, Mail, MapPin, Users, Target, Network, Settings, Briefcase, Calendar, BookOpen, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"

interface MegaMenuItem {
  id: string
  title: string
  icon: React.ReactNode
  description?: string
  href?: string
  children?: {
    id: string
    title: string
    description?: string
    icon?: React.ReactNode
    href?: string
    badge?: string
  }[]
}

const megaMenuItems: MegaMenuItem[] = [
  {
    id: "institucional",
    title: "Nossa Empresa",
    icon: <Building2 className="h-4 w-4" />,
    description: "Conheça nossa história e estrutura",
    children: [
      {
        id: "sobre",
        title: "Sobre o Pratagy",
        description: "Nossa história e identidade",
        icon: <Building2 className="h-4 w-4" />,
        href: "/sobre-pratagy"
      },
      {
        id: "missao",
        title: "Missão, Visão e Valores",
        description: "Nossos princípios e diretrizes",
        icon: <Target className="h-4 w-4" />,
        href: "/sobre-pratagy#nossa-identidade"
      },
      {
        id: "organograma",
        title: "Organograma",
        description: "Estrutura organizacional",
        icon: <Network className="h-4 w-4" />,
        href: "/organograma"
      }
    ]
  },
  {
    id: "funcionalidades",
    title: "Funcionalidades",
    icon: <Settings className="h-4 w-4" />,
    description: "Explore as ferramentas do portal",
    children: [
      {
        id: "procedimentos",
        title: "Procedimentos",
        description: "Documentos e processos da qualidade",
        icon: <FileText className="h-4 w-4" />,
        href: "/procedimentos"
      },
      {
        id: "vagas",
        title: "Vagas",
        description: "Oportunidades de trabalho",
        icon: <Briefcase className="h-4 w-4" />,
        href: "/rh?tab=vagas"
      },
      {
        id: "eventos",
        title: "Eventos",
        description: "Eventos corporativos e treinamentos",
        icon: <Calendar className="h-4 w-4" />,
        href: "/eventos"
      },
      {
        id: "rh",
        title: "Recursos Humanos",
        description: "Gestão de colaboradores",
        icon: <UserCheck className="h-4 w-4" />,
        href: "/rh"
      }
    ]
  },
  {
    id: "fale-conosco",
    title: "Fale Conosco",
    icon: <MessageSquare className="h-4 w-4" />,
    description: "Entre em contato conosco",
    children: [
      {
        id: "contato",
        title: "Contato",
        description: "Informações de contato",
        icon: <Phone className="h-4 w-4" />,
        href: "/contato"
      },
      {
        id: "ouvidoria",
        title: "Ouvidoria",
        description: "Canal de denúncias e sugestões",
        icon: <Mail className="h-4 w-4" />,
        href: "/ouvidoria"
      }
    ]
  }
]

export function MegaMenu({ hideNossaEmpresa = false }: { hideNossaEmpresa?: boolean }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filter menu items based on props
  const filteredMenuItems = hideNossaEmpresa 
    ? megaMenuItems.filter(item => item.id !== "institucional")
    : megaMenuItems

  const handleDropdownToggle = (itemId: string) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId)
  }

  const handleDropdownEnter = (itemId: string) => {
    if (!isMobile) {
      setOpenDropdown(itemId)
    }
  }

  const handleDropdownLeave = () => {
    if (!isMobile) {
      setOpenDropdown(null)
    }
  }

  const handleMobileItemClick = (href?: string) => {
    if (href) {
      window.location.href = href
    }
    setMobileMenuOpen(false)
    setOpenDropdown(null)
  }

  if (isMobile) {
    return (
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Menu Portal
            </SheetTitle>
            <SheetDescription>
              Navegue pelas opções do portal
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {filteredMenuItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-3"
                  onClick={() => handleDropdownToggle(item.id)}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <div className="text-left">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                </Button>
                
                {openDropdown === item.id && item.children && (
                  <div className="ml-4 space-y-1 border-l-2 border-primary/20 pl-4">
                    {item.children.map((child) => (
                      <Button
                        key={child.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 text-left"
                        onClick={() => handleMobileItemClick(child.href)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          {child.icon && (
                            <div className="text-primary/70">
                              {child.icon}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{child.title}</div>
                            <div className="text-xs text-muted-foreground">{child.description}</div>
                          </div>
                          {child.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {child.badge}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {filteredMenuItems.map((item) => (
        <DropdownMenu
          key={item.id}
          open={openDropdown === item.id}
          onOpenChange={(open) => {
            if (!open) setOpenDropdown(null)
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 px-3 text-sm font-medium transition-colors hover:text-primary hover:bg-primary/5 relative group"
              onMouseEnter={() => handleDropdownEnter(item.id)}
              onMouseLeave={handleDropdownLeave}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                {item.title}
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === item.id ? 'rotate-180' : ''}`} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            align="start"
            className="w-80 p-0 bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg"
            sideOffset={8}
            onMouseEnter={() => handleDropdownEnter(item.id)}
            onMouseLeave={handleDropdownLeave}
          >
            <div className="p-2">
              {item.children?.map((child, index) => (
                <div key={child.id}>
                  <DropdownMenuItem
                    className="w-full p-3 cursor-pointer transition-colors hover:bg-primary/5 focus:bg-primary/5 rounded-md"
                    onClick={() => {
                      if (child.href) {
                        window.location.href = child.href
                      }
                    }}
                  >
                    <div className="flex items-start gap-3 w-full">
                      {child.icon && (
                        <div className="text-primary/70 mt-0.5">
                          {child.icon}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-tight">{child.title}</div>
                        <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                          {child.description}
                        </div>
                      </div>
                      {child.badge && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {child.badge}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                  
                  {index < (item.children?.length || 0) - 1 && (
                    <div className="mx-3 my-1 h-px bg-border/30" />
                  )}
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </nav>
  )
}