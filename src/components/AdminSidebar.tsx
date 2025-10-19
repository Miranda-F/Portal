'use client'

import { Button } from "@/components/ui/button"
import { 
  Users, 
  Building, 
  Calendar, 
  FileText, 
  Users2, 
  FileSearch, 
  FileSignature, 
  GraduationCap, 
  ChevronRight, 
  Settings 
} from "lucide-react"
import Link from 'next/link'

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  trainingSubmenuOpen: boolean
  setTrainingSubmenuOpen: (open: boolean) => void
  trainingHorizontalMenuOpen: boolean
  setTrainingHorizontalMenuOpen: (open: boolean) => void
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  trainingSubmenuOpen,
  setTrainingSubmenuOpen,
  trainingHorizontalMenuOpen,
  setTrainingHorizontalMenuOpen
}: AdminSidebarProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Painel Admin</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <Button
          variant={activeTab === "dashboard" ? "default" : "ghost"}
          className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
          onClick={() => {
            setActiveTab("dashboard")
            setTrainingSubmenuOpen(false)
            setTrainingHorizontalMenuOpen(false)
          }}
          title={sidebarCollapsed ? "Dashboard" : ""}
        >
          <Settings className="h-4 w-4" />
          {!sidebarCollapsed && <span className="ml-2">Dashboard</span>}
        </Button>

        <Button
          variant={activeTab === "users" ? "default" : "ghost"}
          className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
          onClick={() => {
            setActiveTab("users")
            setTrainingSubmenuOpen(false)
            setTrainingHorizontalMenuOpen(false)
          }}
          title={sidebarCollapsed ? "Usuários" : ""}
        >
          <Users className="h-4 w-4" />
          {!sidebarCollapsed && <span className="ml-2">Usuários</span>}
        </Button>

        <Button
          variant={activeTab === "sectors" ? "default" : "ghost"}
          className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
          onClick={() => {
            setActiveTab("sectors")
            setTrainingSubmenuOpen(false)
            setTrainingHorizontalMenuOpen(false)
          }}
          title={sidebarCollapsed ? "Setores" : ""}
        >
          <Building className="h-4 w-4" />
          {!sidebarCollapsed && <span className="ml-2">Setores</span>}
        </Button>

        <Button
          variant={activeTab === "groups" ? "default" : "ghost"}
          className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
          onClick={() => {
            setActiveTab("groups")
            setTrainingSubmenuOpen(false)
            setTrainingHorizontalMenuOpen(false)
          }}
          title={sidebarCollapsed ? "Grupos" : ""}
        >
          <Users2 className="h-4 w-4" />
          {!sidebarCollapsed && <span className="ml-2">Grupos</span>}
        </Button>

        <Button
          variant={activeTab === "events" ? "default" : "ghost"}
          className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
          onClick={() => {
            setActiveTab("events")
            setTrainingSubmenuOpen(false)
            setTrainingHorizontalMenuOpen(false)
          }}
          title={sidebarCollapsed ? "Eventos" : ""}
        >
          <Calendar className="h-4 w-4" />
          {!sidebarCollapsed && <span className="ml-2">Eventos</span>}
        </Button>

        <Button
          variant={activeTab === "audit-logs" ? "default" : "ghost"}
          className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
          onClick={() => {
            setActiveTab("audit-logs")
            setTrainingSubmenuOpen(false)
            setTrainingHorizontalMenuOpen(false)
          }}
          title={sidebarCollapsed ? "Logs de auditoria" : ""}
        >
          <FileSearch className="h-4 w-4" />
          {!sidebarCollapsed && <span className="ml-2">Logs de auditoria</span>}
        </Button>

        <Link href="/procedimentos">
          <Button
            variant="ghost"
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => {
              setTrainingSubmenuOpen(false)
              setTrainingHorizontalMenuOpen(false)
            }}
            title={sidebarCollapsed ? "Procedimentos" : ""}
          >
            <FileSignature className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Procedimentos</span>}
          </Button>
        </Link>

        {/* Submenu de Controle de Treinamentos */}
        <div className="space-y-1 relative">
          <Button
            variant={activeTab === "trainings" || trainingSubmenuOpen ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => {
              if (!sidebarCollapsed) {
                setTrainingSubmenuOpen(!trainingSubmenuOpen)
              } else {
                // No modo colapsado, abre o menu horizontal
                setTrainingHorizontalMenuOpen(!trainingHorizontalMenuOpen)
              }
            }}
            title={sidebarCollapsed ? "Controle de Treinamentos" : ""}
          >
            <GraduationCap className="h-4 w-4" />
            {!sidebarCollapsed && (
              <>
                <span className="ml-2">Controle de Treinamentos</span>
                <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${trainingSubmenuOpen ? 'rotate-90' : ''}`} />
              </>
            )}
          </Button>

          {/* Submenu items */}
          {!sidebarCollapsed && trainingSubmenuOpen && (
            <div className="ml-4 space-y-1">
              <Button
                variant={activeTab === "trainings" ? "default" : "ghost"}
                className="w-full justify-start px-3"
                onClick={() => {
                  setActiveTab("trainings")
                  setTrainingHorizontalMenuOpen(false)
                }}
              >
                <span className="ml-2">Treinamentos</span>
              </Button>
              <Button
                variant={activeTab === "training-stats" ? "default" : "ghost"}
                className="w-full justify-start px-3"
                onClick={() => {
                  setActiveTab("training-stats")
                  setTrainingHorizontalMenuOpen(false)
                }}
              >
                <span className="ml-2">Estatísticas</span>
              </Button>
            </div>
          )}

          {/* Menu horizontal para modo colapsado */}
          {sidebarCollapsed && trainingHorizontalMenuOpen && (
            <div 
              className="absolute left-full top-0 ml-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 w-48"
              style={{
                top: 'var(--menu-top-position, 0px)'
              }}
            >
              <div className="p-2 space-y-1">
                <Button
                  variant={activeTab === "trainings" ? "default" : "ghost"}
                  className="w-full justify-start px-3"
                  onClick={() => {
                    setActiveTab("trainings")
                    setTrainingHorizontalMenuOpen(false)
                  }}
                >
                  <span className="ml-2">Treinamentos</span>
                </Button>
                <Button
                  variant={activeTab === "training-stats" ? "default" : "ghost"}
                  className="w-full justify-start px-3"
                  onClick={() => {
                    setActiveTab("training-stats")
                    setTrainingHorizontalMenuOpen(false)
                  }}
                >
                  <span className="ml-2">Estatísticas</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button
          variant={activeTab === "general" ? "default" : "ghost"}
          className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
          onClick={() => {
            setActiveTab("general")
            setTrainingSubmenuOpen(false)
            setTrainingHorizontalMenuOpen(false)
          }}
          title={sidebarCollapsed ? "Configurações Gerais" : ""}
        >
          <Settings className="h-4 w-4" />
          {!sidebarCollapsed && <span className="ml-2">Configurações Gerais</span>}
        </Button>
      </nav>
    </div>
  )
}