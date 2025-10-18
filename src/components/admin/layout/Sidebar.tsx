'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Building, 
  Users2, 
  FileSearch, 
  Menu, 
  LogIn
} from "lucide-react"
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  sidebarCollapsed: boolean
  onSidebarToggle: () => void
  pendingUsersCount: number
  logout: () => void
}

export default function Sidebar({
  activeTab,
  onTabChange,
  sidebarCollapsed,
  onSidebarToggle,
  pendingUsersCount,
  logout
}: SidebarProps) {
  return (
    <aside className={`bg-background border-r transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="p-2"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => onTabChange("dashboard")}
            title={sidebarCollapsed ? "Dashboard" : ""}
          >
            <LayoutDashboard className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Dashboard</span>}
          </Button>
          
          <Button
            variant={activeTab === "general" ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => onTabChange("general")}
            title={sidebarCollapsed ? "Geral" : ""}
          >
            <Settings className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Geral</span>}
          </Button>
          
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => onTabChange("users")}
            title={sidebarCollapsed ? "Usuários" : ""}
          >
            <div className="flex items-center">
              <Users className="h-4 w-4" />
              {!sidebarCollapsed && (
                <>
                  <span className="ml-2">Usuários</span>
                  {pendingUsersCount > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {pendingUsersCount}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </Button>
          
          <Button
            variant={activeTab === "sectors" ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => onTabChange("sectors")}
            title={sidebarCollapsed ? "Setores" : ""}
          >
            <Building className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Setores</span>}
          </Button>
          
          <Button
            variant={activeTab === "groups" ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => onTabChange("groups")}
            title={sidebarCollapsed ? "Grupos" : ""}
          >
            <Users2 className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Grupos</span>}
          </Button>
          
  
          
          <Button
            variant={activeTab === "audit-logs" ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
            onClick={() => onTabChange("audit-logs")}
            title={sidebarCollapsed ? "Logs de auditoria" : ""}
          >
            <FileSearch className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Logs de auditoria</span>}
          </Button>
          
  
  
        </nav>

        {/* Footer */}
        <div className="p-4 border-t space-y-2">
          {!sidebarCollapsed && (
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full p-2"
            onClick={() => {
              logout()
              window.location.href = '/'
            }}
            title="Sair"
          >
            <LogIn className="h-4 w-4" />
          </Button>
          {sidebarCollapsed && (
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}