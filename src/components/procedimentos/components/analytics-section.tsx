'use client'

import { useState, useEffect } from 'react'
import { Document } from '@/types/document'
import { documentTypes } from '@/constants/document'
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CommonHeader } from './common-header'
import { getTypeLabel } from '../utils/document-utils'

interface AnalyticsSectionProps {
  allDocuments: Document[]
  setActiveSection: (section: string) => void
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | null
  logout: () => void
}

export function AnalyticsSection({
  allDocuments,
  setActiveSection,
  user,
  logout
}: AnalyticsSectionProps) {
  // Estados para Analytics
  const [docSelectedMonth, setDocSelectedMonth] = useState('Mês')
  const [docDropdownOpen, setDocDropdownOpen] = useState(false)
  const [docTooltip, setDocTooltip] = useState<{ visible: boolean; x: number; y: number; content: string }>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  })

  // Estado para calendário do card de crescimento
  const [calendarMonthDate, setCalendarMonthDate] = useState(new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(new Date())

  // Paginação da grade de documentos no Analytics
  const [analyticsPage, setAnalyticsPage] = useState(1)
  const analyticsPerPage = 8

  // Animação growUp para barras 
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes growUp {
        from { transform: scaleY(0); }
        to { transform: scaleY(1); }
      }
      @keyframes progressRing {
        from { stroke-dasharray: 0 100; }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0); }
        to { transform: scale(1); }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  // Calcular estatísticas de documentos
  // tt: IMPORTANTE: Verificar expirado dinamicamente baseado em expiryDate/nextReviewDate :p
  const now = new Date()
  const totalDocs = allDocuments.length
  const activeDocs = allDocuments.filter(d => {
    if (d.status === 'expired') return false
    // Re-verificar se expirou baseado na data
    if (d.nextReviewDate) {
      const reviewDate = new Date(d.nextReviewDate)
      if (reviewDate < now) return false
    }
    return d.status === 'active'
  }).length
  const pendingDocs = allDocuments.filter(d => {
    if (d.status === 'expired') return false
    // Re-verificar se expirou baseado na data
    if (d.nextReviewDate) {
      const reviewDate = new Date(d.nextReviewDate)
      if (reviewDate < now) return false
    }
    return d.status === 'pending'
  }).length
  // archived é tratado como inactive, então conta ambos
  const inactiveDocs = allDocuments.filter(d => {
    if (d.status === 'expired') return false
    // Re-verificar se expirou baseado na data
    if (d.nextReviewDate) {
      const reviewDate = new Date(d.nextReviewDate)
      if (reviewDate < now) return false
    }
    return d.status === 'inactive' || d.status === 'archived'
  }).length
  // Contar expirados: documentos com status expired OU com nextReviewDate no passado
  const expiredDocs = allDocuments.filter(d => {
    if (d.status === 'expired') return true
    // Verificar se tem data de expiração no passado
    if (d.nextReviewDate) {
      const reviewDate = new Date(d.nextReviewDate)
      return reviewDate < now
    }
    return false
  }).length

  // Renderizador de barras mensais (estilo do dashboard administrativo) para documentos
  const renderDocMonthBar = (month: string, index: number, totalDocsForScale: number) => {
    const monthMap: { [key: string]: number } = {
      'JAN': 0, 'FEV': 1, 'MAR': 2, 'ABR': 3, 'MAI': 4, 'JUN': 5,
      'JUL': 6, 'AGO': 7, 'SET': 8, 'OUT': 9, 'NOV': 10, 'DEZ': 11
    }
    const currentMonth = new Date().getMonth()
    const targetMonth = monthMap[month]

    // meses futuros sem dados
    if (targetMonth > currentMonth) {
      return (
        <div key={month} className={`flex flex-col items-center gap-1 ${docSelectedMonth === 'Mês' ? 'flex-1' : 'w-8'}`}>
          <div className="w-full flex flex-col justify-end gap-1" style={{ height: '240px' }}>
            <div className="w-full h-1 bg-gray-200 rounded-full opacity-50"></div>
          </div>
          <span className="text-xs text-muted-foreground opacity-50">{month}</span>
        </div>
      )
    }

    // Documentos no mês
    const docsInMonth = allDocuments.filter(d => {
      const createdAt = new Date(d.createdAt)
      return createdAt.getMonth() === targetMonth
    })

    const now = new Date()
    const active = docsInMonth.filter(d => {
      if (d.status === 'expired') return false
      if (d.nextReviewDate) {
        const reviewDate = new Date(d.nextReviewDate)
        if (reviewDate < now) return false
      }
      return d.status === 'active'
    }).length
    const pending = docsInMonth.filter(d => {
      if (d.status === 'expired') return false
      if (d.nextReviewDate) {
        const reviewDate = new Date(d.nextReviewDate)
        if (reviewDate < now) return false
      }
      return d.status === 'pending'
    }).length
    // archived é tratado como inactive, então conta junto
    const inactive = docsInMonth.filter(d => {
      if (d.status === 'expired') return false
      if (d.nextReviewDate) {
        const reviewDate = new Date(d.nextReviewDate)
        if (reviewDate < now) return false
      }
      return d.status === 'inactive' || d.status === 'archived'
    }).length
    // Contar expirados: documentos com status expired OU com nextReviewDate no passado
    const expired = docsInMonth.filter(d => {
      if (d.status === 'expired') return true
      if (d.nextReviewDate) {
        const reviewDate = new Date(d.nextReviewDate)
        return reviewDate < now
      }
      return false
    }).length

    const total = active + pending + inactive + expired
    if (total === 0) {
      return (
        <div key={month} className={`flex flex-col items-center gap-1 ${docSelectedMonth === 'Mês' ? 'flex-1' : 'w-8'}`}>
          <div className="w-full flex flex-col justify-end gap-1" style={{ height: '240px' }}>
            <div className="w-full h-1 bg-gray-200 rounded-full"></div>
          </div>
          <span className="text-xs text-muted-foreground">{month}</span>
        </div>
      )
    }

    const maxValue = Math.max(totalDocsForScale, 10)
    const inactiveHeight = (inactive / maxValue) * 100
    const pendingHeight = (pending / maxValue) * 100
    const expiredHeight = (expired / maxValue) * 100
    const activeHeight = (active / maxValue) * 100

    const inactivePercentBar = Math.round((inactive / total) * 100)
    const pendingPercentBar = Math.round((pending / total) * 100)
    const expiredPercentBar = Math.round((expired / total) * 100)
    const activePercentBar = Math.round((active / total) * 100)

    return (
      <div key={month} className={`flex flex-col items-center gap-1 ${docSelectedMonth === 'Mês' ? 'flex-1' : 'w-8'}`}>
        <div className="w-full flex flex-col justify-end gap-1" style={{ height: '240px' }}>
          {/* Inativos (cinza) */}
          <div
            className="w-full bg-gray-300 cursor-pointer hover:opacity-80 transition-all duration-1000 ease-out"
            style={{
              height: `${inactiveHeight}%`,
              borderRadius: '20px',
              transform: 'scaleY(0)',
              transformOrigin: 'bottom',
              animation: 'growUp 1.2s ease-out forwards',
              animationDelay: '0.2s'
            }}
            onMouseEnter={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
              setDocTooltip({ visible: true, x: rect.left + rect.width / 2, y: rect.top - 10, content: `${inactive} inativos (${inactivePercentBar}%)` })
            }}
            onMouseLeave={() => setDocTooltip(prev => ({ ...prev, visible: false }))}
          ></div>
          {/* Pendentes (amarelo) */}
          <div
            className="w-full cursor-pointer hover:opacity-80 transition-all duration-1000 ease-out"
            style={{
              height: `${pendingHeight}%`,
              backgroundColor: '#eab308',
              borderRadius: '20px',
              transform: 'scaleY(0)',
              transformOrigin: 'bottom',
              animation: 'growUp 1.2s ease-out forwards',
              animationDelay: '0.25s'
            }}
            onMouseEnter={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
              setDocTooltip({ visible: true, x: rect.left + rect.width / 2, y: rect.top - 10, content: `${pending} pendentes (${pendingPercentBar}%)` })
            }}
            onMouseLeave={() => setDocTooltip(prev => ({ ...prev, visible: false }))}
          ></div>
          {/* Expirados (vermelho) */}
          <div
            className="w-full cursor-pointer hover:opacity-80 transition-all duration-1000 ease-out"
            style={{
              height: `${expiredHeight}%`,
              backgroundColor: '#ef4444',
              borderRadius: '20px',
              transform: 'scaleY(0)',
              transformOrigin: 'bottom',
              animation: 'growUp 1.2s ease-out forwards',
              animationDelay: '0.3s'
            }}
            onMouseEnter={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
              setDocTooltip({ visible: true, x: rect.left + rect.width / 2, y: rect.top - 10, content: `${expired} expirados (${expiredPercentBar}%)` })
            }}
            onMouseLeave={() => setDocTooltip(prev => ({ ...prev, visible: false }))}
          ></div>
          {/* Ativos (verde/preto) */}
          <div
            className="w-full cursor-pointer hover:opacity-80 transition-all duration-1000 ease-out"
            style={{
              height: `${activeHeight}%`,
              backgroundColor: '#202126',
              borderRadius: '20px',
              transform: 'scaleY(0)',
              transformOrigin: 'bottom',
              animation: 'growUp 1.2s ease-out forwards',
              animationDelay: '0.35s'
            }}
            onMouseEnter={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
              setDocTooltip({ visible: true, x: rect.left + rect.width / 2, y: rect.top - 10, content: `${active} ativos (${activePercentBar}%)` })
            }}
            onMouseLeave={() => setDocTooltip(prev => ({ ...prev, visible: false }))}
          ></div>
        </div>
        <span className="text-xs text-muted-foreground">{month}</span>
      </div>
    )
  }

  // Documentos adicionados (ordenados por data) para a grade com paginação
  const documentsSorted = allDocuments.slice().sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  const totalAnalyticsPages = Math.max(1, Math.ceil(documentsSorted.length / analyticsPerPage))
  const currentAnalyticsPage = Math.min(analyticsPage, totalAnalyticsPages)
  const analyticsStart = (currentAnalyticsPage - 1) * analyticsPerPage
  const analyticsEnd = analyticsStart + analyticsPerPage
  const analyticsDocuments = documentsSorted.slice(analyticsStart, analyticsEnd)

  // Métricas para card de crescimento e mini calendário (com navegação por mês)
  const monthRef = calendarMonthDate
  // Dia selecionado no mês atual; se não houver, usar dia 15 do mês atual
  const selectedInMonth = (selectedCalendarDate &&
    selectedCalendarDate.getFullYear() === monthRef.getFullYear() &&
    selectedCalendarDate.getMonth() === monthRef.getMonth())
    ? selectedCalendarDate
    : new Date(monthRef.getFullYear(), monthRef.getMonth(), 15)

  // Intervalo do dia selecionado
  const startOfSelectedDay = new Date(selectedInMonth.getFullYear(), selectedInMonth.getMonth(), selectedInMonth.getDate(), 0, 0, 0, 0)
  const endOfSelectedDay = new Date(selectedInMonth.getFullYear(), selectedInMonth.getMonth(), selectedInMonth.getDate(), 23, 59, 59, 999)

  // Mesmo dia no mês anterior (com clamp para meses com menos dias)
  const lastDayPrevMonth = new Date(selectedInMonth.getFullYear(), selectedInMonth.getMonth(), 0).getDate()
  const prevDay = Math.min(selectedInMonth.getDate(), lastDayPrevMonth)
  const prevMonthSameDay = new Date(selectedInMonth.getFullYear(), selectedInMonth.getMonth() - 1, prevDay)
  const startOfPrevDay = new Date(prevMonthSameDay.getFullYear(), prevMonthSameDay.getMonth(), prevMonthSameDay.getDate(), 0, 0, 0, 0)
  const endOfPrevDay = new Date(prevMonthSameDay.getFullYear(), prevMonthSameDay.getMonth(), prevMonthSameDay.getDate(), 23, 59, 59, 999)

  const createdCurrentDay = allDocuments.filter(d => {
    const dt = new Date(d.createdAt)
    return dt >= startOfSelectedDay && dt <= endOfSelectedDay
  }).length
  const createdPrevDay = allDocuments.filter(d => {
    const dt = new Date(d.createdAt)
    return dt >= startOfPrevDay && dt <= endOfPrevDay
  }).length

  const growthDelta = createdPrevDay === 0
    ? (createdCurrentDay > 0 ? 100 : 0)
    : ((createdCurrentDay - createdPrevDay) / createdPrevDay) * 100
  const growthDeltaRounded = Math.round(growthDelta * 10) / 10
  const progressPercent = Math.max(0, Math.min(100, Math.round((createdCurrentDay / Math.max(createdPrevDay, 1)) * 100)))

  // Centro da semana exibida: dia selecionado no mês atual, senão dia 15 do mês
  const centerDate = selectedInMonth

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const daysAround = [-2, -1, 0, 1, 2].map(offset => {
    const d = new Date(centerDate as Date)
    d.setDate((centerDate as Date).getDate() + offset)
    return {
      label: weekDays[d.getDay()],
      num: d.getDate(),
      date: d,
      isSelected:
        d.getFullYear() === selectedInMonth.getFullYear() &&
        d.getMonth() === selectedInMonth.getMonth() &&
        d.getDate() === selectedInMonth.getDate()
    }
  })
  const monthTitle = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(monthRef)

  // Padrão de cores estável por setor (mesmo setor, mesmas cores sempre)
  const getSectorColorClasses = (sector: string) => {
    const palette = [
      { bg: 'bg-sky-100', text: 'text-sky-800', darkBg: 'dark:bg-sky-900/30', darkText: 'dark:text-sky-200' },
      { bg: 'bg-emerald-100', text: 'text-emerald-800', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-200' },
      { bg: 'bg-indigo-100', text: 'text-indigo-800', darkBg: 'dark:bg-indigo-900/30', darkText: 'dark:text-indigo-200' },
      { bg: 'bg-amber-100', text: 'text-amber-800', darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-200' },
      { bg: 'bg-rose-100', text: 'text-rose-800', darkBg: 'dark:bg-rose-900/30', darkText: 'dark:text-rose-200' },
      { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-200' },
    ]
    let hash = 0
    for (let i = 0; i < sector.length; i++) {
      hash = (hash * 31 + sector.charCodeAt(i)) >>> 0
    }
    const c = palette[hash % palette.length]
    return `${c.bg} ${c.text} ${c.darkBg} ${c.darkText}`
  }

  // Bottom Metrics calculations
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const createdThisMonth = allDocuments.filter(d => {
    const dt = new Date(d.createdAt)
    return dt >= startOfMonth && dt <= endOfMonth
  }).length

  // Mês anterior
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const createdLastMonth = allDocuments.filter(d => {
    const dt = new Date(d.createdAt)
    return dt >= startOfLastMonth && dt <= endOfLastMonth
  }).length

  // Insights: Top setores, tipo mais comum
  const sectorCounts: Record<string, number> = {}
  const typeCounts: Record<string, number> = {}

  allDocuments.forEach(d => {
    const sector = d.responsibleSector || 'Sem setor'
    sectorCounts[sector] = (sectorCounts[sector] || 0) + 1

    const type = String(d.type || 'other')
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })
  const topSectors = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)
  const baseTypeList = documentTypes.map(dt => ({
    type: String(dt.value),
    label: dt.label,
    count: typeCounts[String(dt.value)] || 0
  }))
  const extraTypeList = Object.keys(typeCounts)
    .filter(t => !baseTypeList.some(b => b.type === t))
    .map(t => ({ type: t, label: t.charAt(0).toUpperCase() + t.slice(1), count: typeCounts[t] }))
  const typesCountList = [...baseTypeList, ...extraTypeList].sort((a, b) => b.count - a.count)
  const maxTypeCount = Math.max(1, ...typesCountList.map(t => t.count))

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <CommonHeader
        title="Analytics"
        description="Análises e estatísticas dos documentos"
        user={user}
        logout={logout}
      />

      {/* Stats Cards - estilo neutro e padronizado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="text-center bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center">
              <FileText className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Total de Documentos</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{totalDocs}</div>
          </CardContent>
        </Card>

        <Card className="text-center bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Ativos</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{activeDocs}</div>
          </CardContent>
        </Card>

        <Card className="text-center bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Pendentes</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingDocs}</div>
          </CardContent>
        </Card>

        <Card className="text-center bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900/40 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Inativos</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{inactiveDocs}</div>
          </CardContent>
        </Card>

        <Card className="text-center bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Expirados</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{expiredDocs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade Mensal (estilo administrativo) */}
        {/* Atividade Mensal (estilo administrativo) */}
        <Card className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Atividade Mensal</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Ativos, Inativos, Pendentes e Expirados por mês</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#202126' }}></div>
                  <span>Ativos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span>Inativos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                  <span>Pendentes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                  <span>Expirados</span>
                </div>
                <div className="relative flex items-center gap-2">
                  <div
                    className="text-xs border rounded-[50px] px-2 py-1 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between gap-2 border-gray-300 dark:border-gray-600"
                    onClick={() => setDocDropdownOpen(!docDropdownOpen)}
                  >
                    <span className="text-gray-900 dark:text-gray-100">{docSelectedMonth}</span>
                    <svg className={`w-3 h-3 text-black dark:text-white transition-transform duration-200 ${docDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {docSelectedMonth !== 'Mês' && (
                    <button
                      onClick={() => setDocSelectedMonth('Mês')}
                      className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200"
                    >
                      <X className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                    </button>
                  )}
                  {docDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 w-32 max-h-32 overflow-y-auto">
                      {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((month) => (
                        <div
                          key={month}
                          className="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap text-gray-900 dark:text-gray-100"
                          onClick={() => {
                            if (docSelectedMonth === month) {
                              setDocSelectedMonth('Mês')
                            } else {
                              setDocSelectedMonth(month)
                            }
                            setDocDropdownOpen(false)
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
              <div className="flex flex-col h-64 pr-3 text-xs text-muted-foreground" style={{ height: '240px', marginTop: '-15px', gap: '40px' }}>
                <span>{Math.max(totalDocs, 10)}</span>
                <span>{Math.round(Math.max(totalDocs, 10) * 0.75)}</span>
                <span>{Math.round(Math.max(totalDocs, 10) * 0.5)}</span>
                <span>{Math.round(Math.max(totalDocs, 10) * 0.25)}</span>
                <span>0</span>
              </div>
              {/* Gráfico */}
              <div className="flex-1 flex items-end justify-between gap-3" style={{ height: '240px' }}>
                {(() => {
                  if (docSelectedMonth !== 'Mês') {
                    const monthIndex = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].indexOf(docSelectedMonth)
                    const monthsShort = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
                    return monthsShort.map((m, idx) => {
                      if (idx === monthIndex) {
                        return renderDocMonthBar(m, idx, totalDocs)
                      }
                      return <div key={m} className="flex flex-col items-center gap-1 flex-1"><div className="w-full" style={{ height: '240px' }}></div><span className="text-xs text-muted-foreground">{m}</span></div>
                    })
                  }
                  return ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'].map((m, idx) => renderDocMonthBar(m, idx, totalDocs))
                })()}
              </div>
            </div>
            {/* Tooltip */}
            {docTooltip.visible && (
              <div
                className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm pointer-events-none"
                style={{ left: docTooltip.x - 50, top: docTooltip.y - 40, transform: 'translateX(-50%)' }}
              >
                <div className="font-semibold text-gray-800">{docTooltip.content.split(' ')[0]}</div>
                <div className="text-gray-600 text-xs">{docTooltip.content.split(' ').slice(1).join(' ')}</div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Card de crescimento (mini-calendário + progresso) com visual do exemplo */}
        {/* Card de crescimento (mini-calendário + progresso) com visual do exemplo */}
        <Card className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-center text-sm font-medium gap-3">
              <button
                className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Mês anterior"
                onClick={() => setCalendarMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <span className="capitalize px-1 text-base md:text-lg font-semibold">{monthTitle}</span>
              <button
                className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Próximo mês"
                onClick={() => setCalendarMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Faixa de dias */}
            <div className="grid grid-cols-5 gap-3 relative">
              {daysAround.map((d, idx) => {
                return (
                  <div
                    key={`${d.date.getTime()}`}
                    className="text-center relative"
                  >
                    <button
                      onClick={() => setSelectedCalendarDate(d.date)}
                      className="w-full relative"
                    >
                      <div
                        className={`inline-flex flex-col items-center justify-center rounded-2xl h-32 w-16 ${d.isSelected
                          ? 'bg-gray-300/80 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-lg'
                          : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100/30 dark:hover:bg-gray-800/30'
                          }`}
                        style={{
                          transition: 'background-color 0.5s ease-out, transform 0.5s ease-out, box-shadow 0.5s ease-out, color 0.5s ease-out',
                          transform: d.isSelected ? 'scale(1.08)' : 'scale(1)'
                        }}
                      >
                        <span
                          className={`text-[10px] mb-0.5 ${d.isSelected
                            ? 'font-semibold'
                            : 'font-medium text-muted-foreground'
                            }`}
                          style={{
                            transition: 'font-weight 0.5s ease-out, color 0.5s ease-out'
                          }}
                        >
                          {d.label}
                        </span>
                        <span
                          className={`text-sm ${d.isSelected
                            ? 'font-bold'
                            : 'font-medium'
                            }`}
                          style={{
                            transition: 'font-weight 0.5s ease-out'
                          }}
                        >
                          {d.num}
                        </span>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Bloco de crescimento */}
            <div className="mt-18 md:mt-20 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Crescimento de documentos</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <TrendingUp className={[growthDeltaRounded >= 0 ? 'text-emerald-500' : 'text-red-500', 'h-3.5 w-3.5'].join(' ')} />
                  <span className={growthDeltaRounded >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>{growthDeltaRounded >= 0 ? '+' : ''}{growthDeltaRounded}%</span>
                  <span>vs mês passado</span>
                </div>
              </div>
              <div className="relative h-20 w-20">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${growthDeltaRounded >= 0 ? '#6b7280' : '#ef4444'} 0% ${progressPercent}%, #e5e7eb ${progressPercent}% 100%)`,
                    animation: 'fadeIn 0.6s ease-out, scaleIn 1.2s ease-out'
                  }}
                />
                <div
                  className="absolute inset-2 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-sm font-semibold"
                  style={{
                    animation: 'fadeIn 0.8s ease-out'
                  }}
                >
                  {progressPercent}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Metrics (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Quantidade por classificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {typesCountList.length > 0 ? typesCountList.map(t => (
                <div key={t.type} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-28 truncate">{t.label}</span>
                  <div className="flex-1 h-2 rounded bg-gray-100 dark:bg-gray-800">
                    <div className="h-2 rounded bg-blue-500" style={{ width: `${Math.round((t.count / maxTypeCount) * 100)}%` }} />
                  </div>
                  <span className="text-xs w-6 text-right">{t.count}</span>
                </div>
              )) : <span className="text-sm text-muted-foreground">—</span>}
            </div>
          </CardContent>
        </Card>

        {/* Donut (resumo por status) movido aqui */}
        {/* Donut (resumo por status) movido aqui */}
        <Card className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Resumo</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-center gap-4">
              {(() => {
                const pActive = totalDocs > 0 ? (activeDocs / totalDocs) * 100 : 0
                const pInactive = totalDocs > 0 ? (inactiveDocs / totalDocs) * 100 : 0
                const pPending = totalDocs > 0 ? (pendingDocs / totalDocs) * 100 : 0
                const pExpired = totalDocs > 0 ? (expiredDocs / totalDocs) * 100 : 0
                const c1 = pActive
                const c2 = pActive + pInactive
                const c3 = pActive + pInactive + pPending
                return (
                  <>
                    <div className="relative h-36 w-36">
                      <div className="relative h-full w-full rounded-full overflow-hidden p-2">
                        <div
                          className="absolute inset-2 rounded-full transition-all duration-500"
                          style={{
                            background: `conic-gradient(#111111 0% ${c1}%, #d1d5db ${c1}% ${c2}%, #eab308 ${c2}% ${c3}%, #ef4444 ${c3}% 100%)`
                          }}
                        />
                        <div className="absolute inset-6 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalDocs}</div>
                            <div className="text-xs text-muted-foreground -mt-1">Docs</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full bg-black"></span>
                        <span>{Math.round(pActive)}% Ativos</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                        <span>{Math.round(pInactive)}% Inativos</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#eab308' }}></span>
                        <span>{Math.round(pPending)}% Pendentes</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#ef4444' }}></span>
                        <span>{Math.round(pExpired)}% Expirados</span>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden min-h-[380px] bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="space-y-0 pb-3">
            <div className="flex items-center">
              <CardTitle className="text-base font-semibold">Top setores</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-4">
              <div>
                <div className="space-y-3 flex flex-col items-center">
                  {topSectors.length > 0 ? topSectors.map(([name, count]) => (
                    <div
                      key={name}
                      className={[
                        'w-56 rounded-full py-2 text-sm font-medium text-center',
                        getSectorColorClasses(name),
                        'text-gray-900 dark:text-gray-100'
                      ].join(' ')}
                    >
                      {name} · {count}
                    </div>
                  )) : <span>—</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade de documentos adicionados com paginação */}
      <Card className="mt-6 bg-white dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Documentos adicionados</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => setAnalyticsPage(1)} title="Atualizar">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => setActiveSection('documents')} title="Ver documentos">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Documento</th>
                  <th className="py-2 pr-4">Adicionado por</th>
                  <th className="py-2 pr-4">Código</th>
                  <th className="py-2 pr-4">Setor</th>
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-0 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analyticsDocuments.map(doc => (
                  <tr key={doc.id} className="align-middle hover:bg-muted/30">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[280px]">{doc.title}</div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">{doc.createdBy || '—'}</td>
                    <td className="py-3 pr-4">{doc.code || '—'}</td>
                    <td className="py-3 pr-4">{doc.responsibleSector}</td>
                    <td className="py-3 pr-4">{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 pr-0 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {getTypeLabel(doc.type)}
                      </span>
                    </td>
                  </tr>
                ))}
                {analyticsDocuments.length === 0 && (
                  <tr>
                    <td className="py-6 text-center text-muted-foreground" colSpan={6}>Sem documentos</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-muted-foreground">Página {currentAnalyticsPage} de {totalAnalyticsPages}</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnalyticsPage(p => Math.max(1, p - 1))}
                disabled={currentAnalyticsPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnalyticsPage(p => Math.min(totalAnalyticsPages, p + 1))}
                disabled={currentAnalyticsPage === totalAnalyticsPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

