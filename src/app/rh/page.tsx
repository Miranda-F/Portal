"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  UserPlus, 
  Search, 
  FileText, 
  TrendingUp, 
  Briefcase,
  GraduationCap,
  BarChart3
} from "lucide-react"
import JobsManagement from "@/components/rh/JobsManagement"
import EmployeesManagement from "@/components/rh/EmployeesManagement"
import TrainingManagement from "@/components/rh/TrainingManagement"
import EventsManagement from "@/components/rh/EventsManagement"
import RHIndicators from "@/components/rh/RHIndicators"
import RHSidebar from "@/components/rh/RHSidebar"
import { TabValue } from "@/types/rh"
import { useRHStats } from "@/hooks/use-rh"

export default function RHPage() {
  const searchParams = useSearchParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { stats } = useRHStats()

  // pega aba da url ou usa indicadores como padrao
  const getInitialTab = (): TabValue => {
    const tab = searchParams.get('tab') as TabValue
    if (tab && ['colaboradores', 'vagas', 'treinamento', 'indicadores', 'eventos'].includes(tab)) {
      return tab
    }
    return "indicadores"
  }

  const [activeTab, setActiveTab] = useState<TabValue>(getInitialTab())

  // Wrapper function to match expected type
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab as TabValue)
  }

  // atualiza aba quando url mudar
  useEffect(() => {
    const tab = searchParams.get('tab') as TabValue
    if (tab && ['colaboradores', 'vagas', 'treinamento', 'indicadores', 'eventos'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const renderContent = () => {
    switch (activeTab) {
      case "indicadores":
        return <RHIndicators activeTab={activeTab} />
      case "colaboradores":
        return <EmployeesManagement activeTab={activeTab} />
      case "vagas":
        return <JobsManagement activeTab={activeTab} />
      case "treinamento":
        return <TrainingManagement activeTab={activeTab} />
      case "eventos":
        return <EventsManagement activeTab={activeTab} />
      default:
        return <RHIndicators activeTab={activeTab} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <RHSidebar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className={`container mx-auto py-6 space-y-6 transition-all duration-300 ${sidebarCollapsed ? 'px-6' : 'px-6'} min-h-screen`}>
          {/* Conteúdo Dinâmico */}
          {renderContent()}
        </div>
      </main>
    </div>
  )
}