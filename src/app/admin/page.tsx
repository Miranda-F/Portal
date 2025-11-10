'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useAdminData } from '@/hooks/admin/useAdminData'
import DashboardTab from '@/components/admin/tabs/DashboardTab'
import GeneralTab from '@/components/admin/tabs/GeneralTab'
import UsersTab from '@/components/admin/tabs/UsersTab'
import SectorsTab from '@/components/admin/tabs/SectorsTab'
// Sidebar removido para usar navbar no header
import AuditLogsSection from '@/components/audit-logs-section'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { LogOut, Search, Plus, User, Building, Users, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const { data, loading, updateUsers, updateSectors, refreshData } = useAdminData()
  
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Função de busca
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    
    try {
      // Busca em usuários
      const userResults = data.users.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.sector?.name.toLowerCase().includes(query.toLowerCase())
      ).map(user => ({
        type: 'user',
        id: user.id,
        title: user.name,
        subtitle: user.email,
        sector: user.sector?.name,
        avatar: user.avatar
      }))

      // Busca em setores
      const sectorResults = data.sectors.filter(sector => 
        sector.name.toLowerCase().includes(query.toLowerCase()) ||
        sector.description?.toLowerCase().includes(query.toLowerCase())
      ).map(sector => ({
        type: 'sector',
        id: sector.id,
        title: sector.name,
        subtitle: sector.description || 'Sem descrição',
        count: sector.users?.length || 0
      }))

      // Busca em grupos
      const groupResults = data.groups.filter(group => 
        group.name.toLowerCase().includes(query.toLowerCase()) ||
        group.description?.toLowerCase().includes(query.toLowerCase())
      ).map(group => ({
        type: 'group',
        id: group.id,
        title: group.name,
        subtitle: group.description || 'Sem descrição',
        count: group.users?.length || 0
      }))

      // Busca em eventos
      const eventResults = data.events.filter(event => 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description?.toLowerCase().includes(query.toLowerCase())
      ).map(event => ({
        type: 'event',
        id: event.id,
        title: event.title,
        subtitle: event.description || 'Sem descrição',
        date: event.date
      }))

      setSearchResults([
        ...userResults.slice(0, 3),
        ...sectorResults.slice(0, 2),
        ...groupResults.slice(0, 2),
        ...eventResults.slice(0, 2)
      ])
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

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
    <div className="flex h-screen bg-[#f6f6f6] dark:bg-black">
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#f6f6f6] dark:bg-black">
        {/* Header com busca e ações */}
         <div className="bg-neutral-900 text-white border-b border-neutral-800 px-6 py-4">
           <div className="flex items-center gap-4">
             {/* Logo Grupo */}
             <div className="flex items-center h-12">
               <img 
                 src="/grupo.png" 
                 alt="Logo Grupo" 
                 className="h-48 w-48 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                 onClick={() => window.location.href = '/usuario'}
               />
             </div>
             
             {/* Navbar de abas - lado esquerdo */}
             <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" className={`${activeTab === 'dashboard' ? 'bg-white/10' : ''} text-white`} size="sm" onClick={() => setActiveTab('dashboard')}>Dashboard</Button>
              <Button variant="ghost" className={`${activeTab === 'general' ? 'bg-white/10' : ''} text-white`} size="sm" onClick={() => setActiveTab('general')}>Geral</Button>
              <Button variant="ghost" className={`${activeTab === 'users' ? 'bg-white/10' : ''} text-white`} size="sm" onClick={() => setActiveTab('users')}>Usuários</Button>
              <Button variant="ghost" className={`${activeTab === 'sectors' ? 'bg-white/10' : ''} text-white`} size="sm" onClick={() => setActiveTab('sectors')}>Setores</Button>
              <Button variant="ghost" className={`${activeTab === 'groups' ? 'bg-white/10' : ''} text-white`} size="sm" onClick={() => setActiveTab('groups')}>Grupos</Button>
              <Button variant="ghost" className={`${activeTab === 'audit-logs' ? 'bg-white/10' : ''} text-white`} size="sm" onClick={() => setActiveTab('audit-logs')}>Logs</Button>
            </nav>
            
            {/* Search e ações - lado direito */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="relative" ref={searchRef}>
                {searchOpen ? (
                  <div className="relative w-80 animate-in slide-in-from-right-2 duration-200">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar usuários, setores, grupos..." 
                      className="pl-9 bg-white/10 border-white/10 text-white placeholder:text-white/60"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    
                    {/* Dropdown de resultados */}
                    {searchQuery && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                        {searchLoading ? (
                          <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-sm">Buscando...</p>
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="p-2">
                            {searchResults.map((result, index) => (
                              <div
                                key={`${result.type}-${result.id}`}
                                className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                                onClick={() => {
                                  if (result.type === 'user') {
                                    setActiveTab('users')
                                  } else if (result.type === 'sector') {
                                    setActiveTab('sectors')
                                  } else if (result.type === 'group') {
                                    setActiveTab('groups')
                                  }
                                  setSearchOpen(false)
                                  setSearchQuery('')
                                }}
                              >
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                  {result.type === 'user' && <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                                  {result.type === 'sector' && <Building className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                                  {result.type === 'group' && <Users className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                                  {result.type === 'event' && <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {result.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {result.subtitle}
                                  </p>
                                  {result.sector && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                      {result.sector}
                                    </p>
                                  )}
                                  {result.count !== undefined && (
                                    <p className="text-xs text-gray-500">
                                      {result.count} {result.count === 1 ? 'membro' : 'membros'}
                                    </p>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {result.type === 'user' && 'Usuário'}
                                  {result.type === 'sector' && 'Setor'}
                                  {result.type === 'group' && 'Grupo'}
                                  {result.type === 'event' && 'Evento'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <p className="text-sm">Nenhum resultado encontrado</p>
                            <p className="text-xs mt-1">Tente buscar por nome, email ou setor</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchOpen(true)}
                    className="text-white hover:bg-white/10 transition-colors duration-150 rounded-full p-2"
                    style={{backgroundColor: '#313236'}}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div style={{backgroundColor: '#313236'}} className="rounded-full">
                  <ThemeToggle />
                </div>
                <div className="relative" ref={profileDropdownRef}>
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-white/10 rounded-lg px-3 py-2 transition-colors duration-150" 
                    style={{backgroundColor: '#313236'}}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-white text-sm font-medium">
                      {user?.name || 'Usuário'}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <div 
                    className={`absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transition-all duration-200 ease-in-out ${
                      profileDropdownOpen 
                        ? 'opacity-100 scale-100 translate-y-0' 
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
                    style={{ width: '200px' }}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'usuario@exemplo.com'}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        window.location.href = '/'
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`mx-auto max-w-[1400px] py-6 transition-all duration-300 px-6 md:px-8 min-h-screen space-y-6 bg-[#f6f6f6] dark:bg-black w-full`}>
          {/* Tab Content */}
          {activeTab === "dashboard" && (
            <DashboardTab
              users={data.users}
              sectors={data.sectors}
              groups={data.groups}
              events={data.events}
              currentUser={user}
            />
          )}

          {activeTab === "general" && (
            <GeneralTab activeTab={activeTab} />
          )}

          {activeTab === "users" && (
            <UsersTab
              employees={data.employees}
              sectors={data.sectors}
              onSectorsChange={updateSectors}
              onRefreshData={refreshData}
              onUsersChange={updateUsers}
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
              </div>
              <AuditLogsSection activeTab={activeTab} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}