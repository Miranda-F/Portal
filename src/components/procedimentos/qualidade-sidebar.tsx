'use client'

import { useState } from 'react'
import {
  LayoutGrid,
  Folder,
  FileText,
  Home,
  ChevronRight,
  ChevronLeft,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SidebarItem {
  id: string
  title: string
  icon: React.ReactNode
  href?: string
  badge?: string
  onClick?: () => void
  children?: {
    id: string
    title: string
    description?: string
    icon?: React.ReactNode
    href?: string
    badge?: string
  }[]
}

const getSidebarItems = (activeSection: string, onSectionChange: (section: string) => void): SidebarItem[] => [
  {
    id: 'home',
    title: 'Página Inicial',
    icon: <Home className="h-4 w-4" />,
    href: '/usuario'
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <LayoutGrid className="h-4 w-4" />,
    onClick: () => onSectionChange('dashboard')
  },
  {
    id: 'documents',
    title: 'Lista Mestra',
    icon: <FileText className="h-4 w-4" />,
    onClick: () => onSectionChange('documents')
  },
  {
    id: 'folders',
    title: 'Documentos',
    icon: <Folder className="h-4 w-4" />,
    onClick: () => onSectionChange('folders')
  },
  {
    id: 'access-control',
    title: 'Controle de Acesso',
    icon: <Shield className="h-4 w-4" />,
    onClick: () => onSectionChange('access-control')
  }
]

interface QualidadeSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function QualidadeSidebar({ activeSection, onSectionChange }: QualidadeSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const sidebarItems = getSidebarItems(activeSection, onSectionChange)

  const handleNavigation = (item: any) => {
    if (item.onClick) {
      item.onClick()
    } else if (item.href) {
      window.location.href = item.href
    }
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
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Top spacing for toggle button */}
        <div className="pt-16"></div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sidebarItems.map((item) => (
            <div key={item.id}>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-center h-auto p-3 text-left font-medium hover:bg-primary/5 transition-colors",
                        activeSection === item.id && "bg-primary/5"
                      )}
                      onClick={() => handleNavigation(item)}
                    >
                      <div className={cn(
                        "text-primary/70",
                        activeSection === item.id && "text-primary"
                      )}>
                        {item.icon}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto p-3 text-left font-medium hover:bg-primary/5 transition-colors",
                    activeSection === item.id && "bg-primary/5"
                  )}
                  onClick={() => handleNavigation(item)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "text-primary/70",
                      activeSection === item.id && "text-primary"
                    )}>
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Button>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  )
}