'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, Building, Users2, User, UserCheck, X, Calendar, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import React from "react"

interface DashboardTabProps {
  users: any[]
  sectors: any[]
  groups: any[]
  events: any[]
  currentUser?: any
}

export default function DashboardTab({
  users,
  sectors,
  groups,
  events,
  currentUser
}: DashboardTabProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Adicionar CSS para animação
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes growUp {
        from {
          transform: scaleY(0);
        }
        to {
          transform: scaleY(1);
        }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  const [selectedMonth, setSelectedMonth] = useState('Mês')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Função para renderizar uma barra do mês
  const renderMonthBar = (month: string, index: number) => {
    // Mapear meses para números
    const monthMap: { [key: string]: number } = {
      'JAN': 0, 'FEV': 1, 'MAR': 2, 'ABR': 3, 'MAI': 4, 'JUN': 5,
      'JUL': 6, 'AGO': 7, 'SET': 8, 'OUT': 9, 'NOV': 10, 'DEZ': 11
    }
    
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const targetMonth = monthMap[month]
    
    // Se o mês for futuro, não mostrar dados
    if (targetMonth > currentMonth) {
      return (
        <div key={month} className={`flex flex-col items-center gap-1 ${selectedMonth === 'Mês' ? 'flex-1' : 'w-8'}`}>
          <div className="w-full flex flex-col justify-end gap-1" style={{height: '240px'}}>
            <div className="w-full h-1 bg-gray-200 rounded-full opacity-50"></div>
          </div>
          <span className="text-xs text-muted-foreground opacity-50">{month}</span>
        </div>
      )
    }
    
    // Calcular dados reais para o mês
    const monthStart = new Date(currentYear, targetMonth, 1)
    const monthEnd = new Date(currentYear, targetMonth + 1, 0)
    
    // Usuários criados neste mês
    const usersCreatedThisMonth = users.filter(user => {
      const createdAt = new Date(user.createdAt)
      return createdAt >= monthStart && createdAt <= monthEnd
    })
    
    // Usuários que fizeram login neste mês (se tiveram lastLogin)
    const usersActiveThisMonth = users.filter(user => {
      if (!user.lastLogin) return false
      const lastLogin = new Date(user.lastLogin)
      return lastLogin >= monthStart && lastLogin <= monthEnd
    })
    
    // Para o mês atual, usar dados atuais
    let active = 0
    let inactive = 0
    
    if (targetMonth === currentMonth) {
      // Mês atual: usar dados reais atuais de todos os usuários
      active = users.filter(u => u.approved).length
      inactive = users.filter(u => !u.approved).length
    } else {
      // Meses passados: usar dados históricos
      active = usersActiveThisMonth.length
      inactive = usersCreatedThisMonth.length - active
    }
    
    // Se não há dados para o mês, mostrar barra mínima
    const total = active + inactive
    if (total === 0) {
      return (
        <div key={month} className={`flex flex-col items-center gap-1 ${selectedMonth === 'Mês' ? 'flex-1' : 'w-8'}`}>
          <div className="w-full flex flex-col justify-end gap-1" style={{height: '240px'}}>
            <div className="w-full h-1 bg-gray-200 rounded-full"></div>
          </div>
          <span className="text-xs text-muted-foreground">{month}</span>
        </div>
      )
    }

    // Calcular altura baseada no número real de usuários
    const maxValue = Math.max(totalUsers, 10) // Mínimo de 10 para visualização
    const activeHeight = (active / maxValue) * 100
    const inactiveHeight = (inactive / maxValue) * 100

    // Calcular percentuais corretos
    const activePercentBar = Math.round((active / total) * 100)
    const inactivePercentBar = Math.round((inactive / total) * 100)
    
    return (
      <div key={month} className={`flex flex-col items-center gap-1 ${selectedMonth === 'Mês' ? 'flex-1' : 'w-8'}`}>
        <div className="w-full flex flex-col justify-end gap-1" style={{height: '240px'}}>
          <div
            className="w-full bg-gray-300 cursor-pointer hover:opacity-80 transition-all duration-1000 ease-out"
            style={{
              height: `${inactiveHeight}%`, 
              borderRadius: '20px',
              transform: 'scaleY(0)',
              transformOrigin: 'bottom',
              animation: 'growUp 1.2s ease-out forwards',
              animationDelay: '0.3s'
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setTooltip({
                visible: true,
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
                content: `${inactive} inativos (${inactivePercentBar}%)`
              })
            }}
            onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
          ></div>
          <div
            className="w-full cursor-pointer hover:opacity-80 transition-all duration-1000 ease-out"
            style={{
              height: `${activeHeight}%`, 
              backgroundColor: '#202126', 
              borderRadius: '20px',
              transform: 'scaleY(0)',
              transformOrigin: 'bottom',
              animation: 'growUp 1.2s ease-out forwards'
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setTooltip({
                visible: true,
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
                content: `${active} ativos (${activePercentBar}%)`
              })
            }}
            onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
          ></div>
        </div>
        <span className="text-xs text-muted-foreground">{month}</span>
      </div>
    )
  }
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string }>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  })
  
  // Dados reais do sistema
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.approved).length
  const inactiveUsers = users.filter(u => !u.approved).length
  
  // Calculando percentuais baseados nos dados reais
  const activePercent = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
  const inactivePercent = totalUsers > 0 ? Math.round((inactiveUsers / totalUsers) * 100) : 0

  // Definir cores: roxo sempre é o menor percentual
  const purplePercent = Math.min(activePercent, inactivePercent) // Menor valor = roxo
  const blackPercent = Math.max(activePercent, inactivePercent)   // Maior valor = preto
  
  // Função para determinar saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return 'Bom dia'
    if (hour >= 12 && hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }
  
  return (
    <div className="space-y-6 bg-[#f6f6f6] dark:bg-black min-h-screen w-full">
      {/* Faixa superior cinza ocupando até metade dos cards */}
      <section className="relative">
        {/* background escuro em largura total (full-bleed) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 h-48 sm:h-56 md:h-64 w-screen bg-neutral-900 dark:bg-black" />
        {/* Saudação */}
        <div className="relative text-white p-6">
          <p className="text-base opacity-80">Olá, {currentUser?.name || 'Usuário'}</p>
          <h2 className="text-2xl sm:text-3xl font-semibold">{getGreeting()}</h2>
        </div>

        {/* Stats Cards sobrepondo metade na faixa */}
        <div className="relative grid gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" style={{maxWidth: '1600px'}}>
          <Card className="xl:col-span-1" style={{height: '200px'}}>
          <CardHeader className="space-y-0 pb-0" style={{padding: '24px', height: '100%'}}>
            <div className="w-full">
            <div className="h-16 w-16 rounded-full bg-violet-100 text-black flex items-center justify-center" style={{marginTop: '-12px'}}>
              <Users className="h-8 w-8" />
            </div>
            </div>
            <div className="space-y-0">
              <CardTitle className="text-sm font-medium" style={{color: '#8a8a8a'}}>Total Usuários</CardTitle>
              <div className="text-3xl md:text-4xl font-bold">{totalUsers}</div>
            </div>
          </CardHeader>
        </Card>
        <Card style={{height: '200px'}}>
          <CardHeader className="space-y-0 pb-0" style={{padding: '24px', height: '100%'}}>
            <div className="w-full">
            <div className="h-16 w-16 rounded-full bg-blue-100 text-black flex items-center justify-center" style={{marginTop: '-12px'}}>
              <UserCheck className="h-8 w-8" />
            </div>
            </div>
            <div className="space-y-0">
              <CardTitle className="text-sm font-medium" style={{color: '#8a8a8a'}}>Usuários Ativos</CardTitle>
              <div className="text-3xl md:text-4xl font-bold">{activeUsers}</div>
            </div>
          </CardHeader>
        </Card>
        <Card className="xl:col-span-1" style={{height: '200px'}}>
          <CardContent className="pt-4" style={{height: '100%'}}>
            <div className="flex items-center justify-center gap-4">
              <div className="relative h-32 w-32">
                {/* Gráfico de donut com segmentos de espessuras diferentes */}
                <div className="relative h-full w-full rounded-full overflow-hidden p-2">
                  {/* Camada 1: Cinza mais espesso */}
                  <div
                    className="absolute inset-0 rounded-full transition-all duration-500"
                    style={{
                      background: `conic-gradient(from 0deg, #d1d5db 0% ${purplePercent}%, transparent ${purplePercent}% ${purplePercent + 2}%, transparent ${purplePercent + 2}% ${100 - 2}%, transparent ${100 - 2}% 100%)`
                    }}
                  />
                  {/* Camada 2: Preto mais fino sobrepondo o cinza */}
                  <div
                    className="absolute inset-1 rounded-full transition-all duration-500"
                    style={{
                      background: `conic-gradient(from 0deg, transparent 0% ${purplePercent + 2}%, #111111 ${purplePercent + 2}% ${100 - 2}%, transparent ${100 - 2}% 100%)`
                    }}
                  />
                  <div className="absolute inset-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalUsers}</div>
                    <div className="text-[10px] text-muted-foreground -mt-1">Usuários</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                  <span>{purplePercent}% {activePercent < inactivePercent ? 'Ativos' : 'Inativos'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-black"></span>
                  <span>{blackPercent}% {activePercent > inactivePercent ? 'Ativos' : 'Inativos'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </section>


      {/* Conteúdo principal em 2 colunas: gráfico/atividade + resumo */}
      <div className="flex gap-4" style={{maxWidth: '1600px', width: '100%'}}>
        <Card style={{width: '700px', flexShrink: 0}}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Atividade Mensal</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Número de usuários ativos vs inativos por mês
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#202126'}}></div>
                  <span>Ativos</span>
              </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span>Inativos</span>
                </div>
                <div className="relative flex items-center gap-2">
                  <div 
                    className="text-xs border rounded-[50px] px-2 py-1 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between gap-2 border-gray-300 dark:border-gray-600" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="text-gray-900 dark:text-gray-100">{selectedMonth}</span>
                    <svg className={`w-3 h-3 text-black dark:text-white transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {selectedMonth !== 'Mês' && (
                    <button
                      onClick={() => setSelectedMonth('Mês')}
                      className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200"
                    >
                      <X className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                    </button>
                  )}
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 w-32 max-h-32 overflow-y-auto">
                      {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((month) => (
                        <div
                          key={month}
                          className="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap text-gray-900 dark:text-gray-100"
                          onClick={() => {
                            // Se clicar no mesmo mês, remove o filtro
                            if (selectedMonth === month) {
                              setSelectedMonth('Mês')
                            } else {
                              setSelectedMonth(month)
                            }
                            setIsDropdownOpen(false)
                          }}
                        >
                          {month}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
                </div>
          </CardHeader>
          <CardContent>
            <div className="flex mt-6">
              {/* Indicadores do eixo Y */}
              <div className="flex flex-col h-64 pr-3 text-xs text-muted-foreground" style={{height: '240px', marginTop: '-15px', gap: '40px'}}>
                <span title="Máximo de usuários">{Math.max(totalUsers, 10)}</span>
                <span title="75% do total">{Math.round(Math.max(totalUsers, 10) * 0.75)}</span>
                <span title="50% do total">{Math.round(Math.max(totalUsers, 10) * 0.5)}</span>
                <span title="25% do total">{Math.round(Math.max(totalUsers, 10) * 0.25)}</span>
                <span title="Nenhum usuário">0</span>
              </div>
              
              {/* Gráfico */}
              <div className="flex-1 flex items-end justify-between gap-3" style={{height: '240px'}}>
              {(() => {
                // Se um mês específico foi selecionado, mostrar apenas esse mês na posição original
                if (selectedMonth !== 'Mês') {
                  const monthMap: { [key: string]: string } = {
                    'Janeiro': 'JAN',
                    'Fevereiro': 'FEV', 
                    'Março': 'MAR',
                    'Abril': 'ABR',
                    'Maio': 'MAI',
                    'Junho': 'JUN',
                    'Julho': 'JUL',
                    'Agosto': 'AGO',
                    'Setembro': 'SET',
                    'Outubro': 'OUT',
                    'Novembro': 'NOV',
                    'Dezembro': 'DEZ'
                  }
                  const monthIndex = Object.keys(monthMap).indexOf(selectedMonth)
                  
                  // Criar array com espaços vazios para manter posição
                  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
                  return months.map((month, index) => {
                    if (index === monthIndex) {
                      return renderMonthBar(month, index)
                    } else {
                      // Espaço vazio para manter posição
                      return <div key={month} className="flex flex-col items-center gap-1 flex-1">
                        <div className="w-full" style={{height: '240px'}}></div>
                    <span className="text-xs text-muted-foreground">{month}</span>
                </div>
                    }
                  })
                } else {
                  // Mostrar todos os meses
                  return ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'].map((month, index) => {
                    return renderMonthBar(month, index)
                  })
                }
              })()}
              </div>
            </div>
            
            {/* Tooltip */}
            {tooltip.visible && (
              <div 
                className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm pointer-events-none"
                style={{
                  left: tooltip.x - 50,
                  top: tooltip.y - 40,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="font-semibold text-gray-800">{tooltip.content.split(' ')[0]}</div>
                <div className="text-gray-600 text-xs">{tooltip.content.split(' ').slice(1).join(' ')}</div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-4" style={{flex: 1, minWidth: '400px'}}>
          <Card style={{height: '380px'}}>
            <CardHeader>
              <CardTitle>Notícias & Eventos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                {/* Eventos */}
                {events.slice(0, 3).map((event, index) => {
                  const eventDate = new Date(event.date)
                  const day = eventDate.getDate().toString().padStart(2, '0')
                  const month = eventDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()
                  
                  return (
                    <div key={index} className="flex gap-3 h-16">
                  <div 
                    className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center min-w-[50px] flex flex-col justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      setSelectedItem(event)
                      setIsModalOpen(true)
                    }}
                  >
                        <div className="font-bold text-lg text-gray-900 dark:text-gray-100">{day}</div>
                        <div className="text-xs text-gray-900 dark:text-gray-100">{month}</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="font-semibold text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">{event.description?.substring(0, 50)}...</div>
                  </div>
                </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Usuários Ativos</p>
                    <p className="text-xs text-gray-500">Último login</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-black dark:text-white">{activeUsers}</div>
                  <div className="text-xs text-gray-500">{activePercent}% do total</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Usuários Inativos</p>
                    <p className="text-xs text-gray-500">Precisam de atenção</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-black dark:text-white">{inactiveUsers}</div>
                  <div className="text-xs text-gray-500">{inactivePercent}% do total</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Building className="h-4 w-4 text-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Total de Setores</p>
                    <p className="text-xs text-gray-500">Organização</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-black dark:text-white">{sectors.length}</div>
                  <div className="text-xs text-gray-500">{groups.length} grupos</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Usuários Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 4).map((user, index) => {
                const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
                const sectorColors = [
                  { bg: '#ede9f7', color: '#7c3aed' },
                  { bg: '#d2f3fc', color: '#0369a1' },
                  { bg: '#e7ece6', color: '#166534' },
                  { bg: '#f1f5f9', color: '#475569' },
                  { bg: '#fef3c7', color: '#d97706' },
                  { bg: '#fce7f3', color: '#be185d' },
                  { bg: '#e0f2fe', color: '#0891b2' },
                  { bg: '#f0fdf4', color: '#16a34a' }
                ]
                
                // Usar o ID do setor para determinar a cor (consistente para o mesmo setor)
                const sectorId = user.sector?.id || 'no-sector'
                const sectorIndex = sectorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                const color = sectorColors[sectorIndex % sectorColors.length]
                
                return (
                  <div key={user.id || index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">{initials}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{user.name || 'Usuário'}</p>
                        <p className="text-xs text-gray-500">{user.email || 'usuario@exemplo.com'}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: color.bg, color: 'black'}}>
                      {user.sector?.name || 'Sem setor'}
                    </div>
                  </div>
                )
              })}
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 rounded-lg" style={{backgroundColor: '#ede9f7'}}>
              <div className="text-3xl font-bold text-black">{sectors.length}</div>
              <div className="text-sm text-muted-foreground">Total Setores</div>
              </div>
            <div className="text-center p-4 rounded-lg" style={{backgroundColor: '#d2f3fc'}}>
              <div className="text-3xl font-bold text-black">{groups.length}</div>
              <div className="text-sm text-muted-foreground">Total Grupos</div>
              </div>
            <div className="text-center p-4 rounded-lg" style={{backgroundColor: '#e7ece6'}}>
              <div className="text-3xl font-bold text-black">{users.filter(u=>u.approved).length}</div>
              <div className="text-sm text-muted-foreground">Usuários Aprovados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de informações completas */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedItem.title}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  {selectedItem.date ? 
                    new Date(selectedItem.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) :
                    new Date(selectedItem.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })
                  }
                </span>
              </div>
              
              <div className="text-gray-700 dark:text-gray-300">
                {selectedItem.description || selectedItem.content}
              </div>
              
              {selectedItem.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="w-4 h-4" />
                  <span>{selectedItem.location}</span>
                </div>
              )}
              
              {selectedItem.author && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span>Por: {selectedItem.author}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}