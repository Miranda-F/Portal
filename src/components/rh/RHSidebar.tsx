'use client'

import { Button } from "@/components/ui/button"
import { 
  Users, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  BarChart3,
  ChevronRight
} from "lucide-react"
import Link from 'next/link'

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
  const menuItems = [
    {
      id: "colaboradores",
      label: "Colaboradores",
      icon: Users,
      description: "Gestão de colaboradores",
      action: () => setActiveTab("colaboradores")
    },
    {
      id: "vagas",
      label: "Vagas",
      icon: Briefcase,
      description: "Recrutamento e seleção",
      action: () => setActiveTab("vagas")
    },
    {
      id: "treinamento",
      label: "Treinamentos",
      icon: GraduationCap,
      description: "Capacitação e desenvolvimento",
      action: () => setActiveTab("treinamento")
    },
    {
      id: "eventos",
      label: "Eventos",
      icon: Calendar,
      description: "Eventos corporativos",
      href: "/eventos",
      isExternal: true
    },
    {
      id: "indicadores",
      label: "Indicadores",
      icon: BarChart3,
      description: "Métricas e relatórios",
      action: () => setActiveTab("indicadores")
    }
  ]

  return (
    <aside className={`bg-background border-r transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-end p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          if (item.isExternal) {
            return (
              <Link key={item.id} href={item.href!}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <Icon className="h-4 w-4" />
                  {!sidebarCollapsed && (
                    <div className="ml-2 text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  )}
                </Button>
              </Link>
            )
          }
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
              onClick={item.action}
              title={sidebarCollapsed ? item.label : ""}
            >
              <Icon className="h-4 w-4" />
              {!sidebarCollapsed && (
                <div className="ml-2 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              )}
            </Button>
          )
        })}
        </nav>
      </div>
    </aside>
  )
}