'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useAdminData } from '@/hooks/admin/useAdminData'
import DashboardTab from '@/components/admin/tabs/DashboardTab'
import GeneralTab from '@/components/admin/tabs/GeneralTab'
import UsersTab from '@/components/admin/tabs/UsersTab'
import SectorsTab from '@/components/admin/tabs/SectorsTab'
import Sidebar from '@/components/admin/layout/Sidebar'
import AuditLogsSection from '@/components/audit-logs-section'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const { data, loading, updateUsers, updateSectors } = useAdminData()
  
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        pendingUsersCount={data.pendingUsers.length}
        logout={logout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header com botões de tema e sair */}
        <div className="bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout()
                  window.location.href = '/'
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        <div className={`container mx-auto py-8 transition-all duration-300 ${sidebarCollapsed ? 'px-6' : 'px-6'} min-h-screen`}>
          {/* Tab Content */}
          {activeTab === "dashboard" && (
            <DashboardTab
              users={data.users}
              sectors={data.sectors}
              groups={data.groups}
              pendingUsers={data.pendingUsers}
            />
          )}

          {activeTab === "general" && (
            <GeneralTab activeTab={activeTab} />
          )}

          {activeTab === "users" && (
            <UsersTab
              users={data.users}
              employees={data.employees}
              sectors={data.sectors}
              onUsersChange={updateUsers}
              onSectorsChange={updateSectors}
            />
          )}

          {activeTab === "sectors" && (
            <SectorsTab
              sectors={data.sectors}
              onSectorsChange={updateSectors}
            />
          )}

          {activeTab === "groups" && (
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <h2 className="text-xl font-semibold whitespace-nowrap">Gerenciamento de Grupos</h2>
                </div>
              </div>
              <div className="text-center py-12">
                <p className="text-muted-foreground">Funcionalidade de grupos em desenvolvimento.</p>
              </div>
            </div>
          )}

  

          {activeTab === "audit-logs" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
                <p className="text-muted-foreground">
                  Histórico de ações e eventos no sistema
                </p>
              </div>
              <AuditLogsSection />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}