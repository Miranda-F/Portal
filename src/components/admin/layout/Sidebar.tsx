'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Users, 
  Building, 
  Users2, 
  FileSearch, 
  Menu, 
  Home,
  LogOut
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link'

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
    <aside className={`transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-72'
    } bg-muted/30 dark:bg-neutral-900 border-r`}>
      <div className="flex flex-col h-full">
        {/* Brand / User */}
        <div className="p-4 border-b">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src="/logo-portal-pratagy.webp" alt="Logo" />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">Portal Admin</p>
                  <p className="text-xs text-muted-foreground">Bem-vindo</p>
                </div>
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'} rounded-xl`}
            onClick={() => onTabChange("dashboard")}
            title={sidebarCollapsed ? "Dashboard" : ""}
          >
            <Home className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Dashboard</span>}
          </Button>
          
          <Button
            variant={activeTab === "general" ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'} rounded-xl`}
            onClick={() => onTabChange("general")}
            title={sidebarCollapsed ? "Geral" : ""}
          >
            <Settings className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Geral</span>}
          </Button>
          
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'} rounded-xl`}
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
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'} rounded-xl`}
            onClick={() => onTabChange("sectors")}
            title={sidebarCollapsed ? "Setores" : ""}
          >
            <Building className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Setores</span>}
          </Button>
          
          <Button
            variant={activeTab === "groups" ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'} rounded-xl`}
            onClick={() => onTabChange("groups")}
            title={sidebarCollapsed ? "Grupos" : ""}
          >
            <Users2 className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Grupos</span>}
          </Button>
          
  
          
          <Button
            variant={activeTab === "audit-logs" ? "default" : "ghost"}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'} rounded-xl`}
            onClick={() => onTabChange("audit-logs")}
            title={sidebarCollapsed ? "Logs de auditoria" : ""}
          >
            <FileSearch className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Logs de auditoria</span>}
          </Button>
          
  
  
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'} rounded-xl`}
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </div>
    </aside>
  )
}