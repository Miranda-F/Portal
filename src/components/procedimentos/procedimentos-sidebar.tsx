'use client'

import { useState } from 'react'
import { 
  LayoutGrid, 
  Folder, 
  FileText,
  BarChart3,
  Menu
} from 'lucide-react'

interface ProcedimentosSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function ProcedimentosSidebar({ activeSection, onSectionChange }: ProcedimentosSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const menuItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { id: 'documents', icon: FileText, label: 'Documentos' },
    { id: 'folders', icon: Folder, label: 'Pastas' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
  ]

  return (
    <div className={`${isExpanded ? 'w-64' : 'w-16'} bg-black transition-all duration-300 flex flex-col`}>
      {/* Logo and Toggle Button */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-gray-800">
        {isExpanded && (
          <img 
            src="/grupo.png" 
            alt="Logo Grupo" 
            className="h-32 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.location.href = '/usuario'}
          />
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg p-2 transition-colors ${isExpanded ? 'ml-auto' : 'mx-auto'}`}
          title={isExpanded ? "Colapsar" : "Expandir"}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col space-y-2 px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`${isExpanded ? 'justify-start px-3 gap-3' : 'justify-center'} w-full h-12 rounded-lg flex items-center transition-colors ${
                isActive 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
