"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import { getInitials } from "@/lib/utils"
import {
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Home
} from "lucide-react"

interface SidebarItem {
  id: string
  title: string
  icon: React.ReactNode
  description?: string
  href?: string
  isExternal?: boolean
  badge?: string
  onClick?: () => void
}

const getSidebarItems = (setActiveTab: (tab: string) => void): SidebarItem[] => [
  {
    id: "home",
    title: "Página inicial",
    icon: <Home className="h-4 w-4" />,
    href: "/usuario"
  },
  {
    id: "indicadores",
    title: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    description: "Métricas e relatórios",
    onClick: () => setActiveTab("indicadores")
  },
  {
    id: "colaboradores",
    title: "Colaboradores",
    icon: <Users className="h-4 w-4" />,
    description: "Gestão de colaboradores",
    onClick: () => setActiveTab("colaboradores")
  },
  {
    id: "vagas",
    title: "Vagas",
    icon: <Briefcase className="h-4 w-4" />,
    description: "Recrutamento e seleção",
    onClick: () => setActiveTab("vagas")
  },
  {
    id: "treinamento",
    title: "Treinamentos",
    icon: <GraduationCap className="h-4 w-4" />,
    description: "Capacitação e desenvolvimento",
    onClick: () => setActiveTab("treinamento")
  },
  {
    id: "eventos",
    title: "Eventos",
    icon: <Calendar className="h-4 w-4" />,
    description: "Eventos corporativos",
    onClick: () => setActiveTab("eventos")
  }
]

interface RHSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export default function RHSidebar({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed
}: RHSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(sidebarCollapsed)
  const { user } = useAuth()
  const sidebarItems = getSidebarItems(setActiveTab)

  const isActive = (item: SidebarItem) => {
    if (item.href) {
      return false // External links or navigation links are not considered active
    }
    return activeTab === item.id
  }

  // Sincronizar o estado interno com o estado do pai
  useEffect(() => {
    setIsCollapsed(sidebarCollapsed)
  }, [sidebarCollapsed])

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    setSidebarCollapsed(newCollapsed)
  }

  const handleNavigation = (item: SidebarItem) => {
    if (item.onClick) {
      item.onClick()
    } else if (item.href) {
      if (item.isExternal) {
        window.location.href = item.href
      } else {
        window.location.href = item.href
      }
    }
  }

  const getFirstName = (fullName?: string) => {
    if (!fullName) return "Usuário"
    return fullName.split(" ")[0]
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "bg-white dark:bg-slate-900 border-r border-border/40 flex flex-col transition-all duration-300",
        "shadow-sm relative",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Toggle Button */}
        <div className="absolute -right-3 top-6 z-10">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full bg-white dark:bg-slate-900 border-2 shadow-md hover:shadow-lg transition-all"
            onClick={handleToggleCollapse}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Welcome Card */}
        <div className={cn(
          "p-4 border-b border-border/40 transition-all duration-300",
          isCollapsed ? "px-2 pt-16" : "px-4 pt-16"
        )}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-sm border-2 border-yellow-400 shadow-md">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-sm">
                  <p className="font-medium">Bem-vindo(a),</p>
                  <p className="font-bold">{getFirstName(user?.name)}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-3 rounded-lg border border-border/50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-base border-2 border-yellow-400 shadow-md flex-shrink-0">
                {user?.name ? getInitials(user.name) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Bem-vindo(a),</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {getFirstName(user?.name)}
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sidebarItems.map((item) => (
            <div key={item.id}>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-center h-auto p-3 text-left font-medium hover:bg-primary/5 transition-colors"
                    >
                      <div className={isActive(item) ? "text-primary-foreground" : "text-primary/70"}>
                        {item.icon}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-sm">
                      <p className="font-semibold">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <Button
                    variant={isActive(item) ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-auto p-3 text-left font-medium",
                      "hover:bg-primary/5 transition-colors",
                      isActive(item) && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleNavigation(item)}
                  >
                    <div className="flex items-start gap-2.5 w-full">
                      <div className={isActive(item) ? "text-primary-foreground mt-0.5" : "text-primary/60 mt-0.5"}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-tight">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  )
}