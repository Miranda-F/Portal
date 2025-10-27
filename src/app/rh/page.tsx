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
import RHIndicators from "@/components/rh/RHIndicators"
import RHSidebar from "@/components/rh/RHSidebar"
import { TabValue } from "@/types/rh"

export default function RHPage() {
  const searchParams = useSearchParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // pega aba da url ou usa colaboradores como padrao
  const getInitialTab = (): TabValue => {
    const tab = searchParams.get('tab') as TabValue
    if (tab && ['colaboradores', 'vagas', 'treinamento', 'indicadores'].includes(tab)) {
      return tab
    }
    return "colaboradores"
  }

  const [activeTab, setActiveTab] = useState<TabValue>(getInitialTab())

  // atualiza aba quando url mudar
  useEffect(() => {
    const tab = searchParams.get('tab') as TabValue
    if (tab && ['colaboradores', 'vagas', 'treinamento', 'indicadores'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const renderContent = () => {
    switch (activeTab) {
      case "colaboradores":
        return <EmployeesManagement activeTab={activeTab} />
      case "vagas":
        return <JobsManagement activeTab={activeTab} />
      case "treinamento":
        return <TrainingManagement activeTab={activeTab} />
      case "indicadores":
        return <RHIndicators activeTab={activeTab} />
      default:
        return <EmployeesManagement activeTab={activeTab} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <RHSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className={`container mx-auto py-6 space-y-6 transition-all duration-300 ${sidebarCollapsed ? 'px-6' : 'px-6'} min-h-screen`}>
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Recursos Humanos</h1>
              <p className="text-muted-foreground">
                Gestão completa de colaboradores, recrutamento e desenvolvimento
              </p>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Colaboradores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  +2% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admissões</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Neste mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Desligamentos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Neste mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vagas Abertas</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando candidatos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Treinamentos</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">
                  Neste mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  Pendentes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Dinâmico */}
          {renderContent()}
        </div>
      </main>
    </div>
  )
}