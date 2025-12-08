"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Briefcase,
  GraduationCap,
  BarChart3,
  Calendar,
  FileCheck,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  RotateCcw
} from "lucide-react"
import { useRHStats } from "@/hooks/use-rh"
import { Stats, Activity, Deadline } from "@/types/rh"

interface RHIndicatorsProps {
  activeTab: string
}

export default function RHIndicators({ activeTab }: RHIndicatorsProps) {
  const { stats, activities, deadlines, loading } = useRHStats()
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'year' | 'month' | 'period'>('all')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString())
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  // Generate years for dropdown (current year and 3 years back)
  const getYears = (): string[] => {
    const currentYear = new Date().getFullYear()
    const years: string[] = []
    for (let i = 0; i <= 3; i++) {
      years.push((currentYear - i).toString())
    }
    return years
  }

  // Generate months for dropdown
  const getMonths = () => {
    return [
      { value: '1', label: 'Janeiro' },
      { value: '2', label: 'Fevereiro' },
      { value: '3', label: 'Março' },
      { value: '4', label: 'Abril' },
      { value: '5', label: 'Maio' },
      { value: '6', label: 'Junho' },
      { value: '7', label: 'Julho' },
      { value: '8', label: 'Agosto' },
      { value: '9', label: 'Setembro' },
      { value: '10', label: 'Outubro' },
      { value: '11', label: 'Novembro' },
      { value: '12', label: 'Dezembro' }
    ]
  }

  const handleClearFilters = () => {
    setFilterType('all')
    setSelectedYear(new Date().getFullYear().toString())
    setSelectedMonth((new Date().getMonth() + 1).toString())
    setPeriodStart('')
    setPeriodEnd('')
  }

  const hasActiveFilters = filterType !== 'all'

  const getFilterDescription = () => {
    switch (filterType) {
      case 'year':
        return `Ano: ${selectedYear}`
      case 'month':
        const monthName = getMonths().find(m => m.value === selectedMonth)?.label || selectedMonth
        return `${monthName} de ${selectedYear}`
      case 'period':
        if (periodStart && periodEnd) {
          return `Período: ${new Date(periodStart).toLocaleDateString('pt-BR')} a ${new Date(periodEnd).toLocaleDateString('pt-BR')}`
        } else if (periodStart) {
          return `A partir de: ${new Date(periodStart).toLocaleDateString('pt-BR')}`
        } else if (periodEnd) {
          return `Até: ${new Date(periodEnd).toLocaleDateString('pt-BR')}`
        }
        return 'Período personalizado'
      default:
        return 'Todos os períodos'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "admissao": return <UserPlus className="h-4 w-4 text-green-600" />
      case "promocao": return <Award className="h-4 w-4 text-blue-600" />
      case "treinamento": return <GraduationCap className="h-4 w-4 text-purple-600" />
      case "avaliacao": return <FileCheck className="h-4 w-4 text-orange-600" />
      default: return <FileCheck className="h-4 w-4 text-gray-600" />
    }
  }

  const getDeadlineIcon = (type: string) => {
    switch (type) {
      case "exame": return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "treinamento": return <GraduationCap className="h-4 w-4 text-purple-600" />
      case "avaliacao": return <FileCheck className="h-4 w-4 text-orange-600" />
      default: return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "admissao": return "Admissão"
      case "promocao": return "Promoção"
      case "treinamento": return "Treinamento"
      case "avaliacao": return "Avaliação"
      default: return type
    }
  }

  const getDeadlineTypeLabel = (type: string) => {
    switch (type) {
      case "exame": return "Exame"
      case "treinamento": return "Treinamento"
      case "avaliacao": return "Avaliação"
      default: return type
    }
  }

  const isDeadlineUrgent = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard de RH</h2>
          <p className="text-muted-foreground">
            {hasActiveFilters ? getFilterDescription() : 'Visão geral dos indicadores de Recursos Humanos'}
          </p>
        </div>
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="text-sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Date Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Filter Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-type">Tipo de Filtro</Label>
                <Select 
                  value={filterType} 
                  onValueChange={(value: 'all' | 'year' | 'month' | 'period') => setFilterType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="year">Por Ano</SelectItem>
                    <SelectItem value="month">Por Mês</SelectItem>
                    <SelectItem value="period">Período Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              {filterType === 'year' && (
                <div className="space-y-2">
                  <Label htmlFor="year-filter">Ano</Label>
                  <Select 
                    value={selectedYear} 
                    onValueChange={setSelectedYear}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {getYears().map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Month and Year Filter */}
              {filterType === 'month' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="month-filter">Mês</Label>
                    <Select 
                      value={selectedMonth} 
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                      <SelectContent>
                        {getMonths().map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year-filter-month">Ano</Label>
                    <Select 
                      value={selectedYear} 
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {getYears().map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Period Filter */}
              {filterType === 'period' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="period-start">Data Início</Label>
                    <Input
                      id="period-start"
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period-end">Data Fim</Label>
                    <Input
                      id="period-end"
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalColaboradores}</div>
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
            <div className="text-2xl font-bold">{stats.admissõesMes}</div>
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
            <div className="text-2xl font-bold">{stats.desligamentosMes}</div>
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
            <div className="text-2xl font-bold">{stats.vagasAbertas}</div>
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
            <div className="text-2xl font-bold">{stats.treinamentosMes}</div>
            <p className="text-xs text-muted-foreground">
              Neste mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avaliacoesPendentes}</div>
            <p className="text-xs text-muted-foreground">
              Pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Employee Distribution by Sector */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Setor</CardTitle>
            <CardDescription>
              Quantidade de colaboradores por setor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tecnologia</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">35%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Vendas</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">RH</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">15%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Financeiro</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">12%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Marketing</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-pink-600 h-2 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">8%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Outros</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Turnover Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Turnover</CardTitle>
            <CardDescription>
              Evolução mensal do turnover
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Janeiro</span>
                <Badge variant="outline">1.2%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fevereiro</span>
                <Badge variant="outline">0.8%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Março</span>
                <Badge variant="outline">1.5%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Abril</span>
                <Badge variant="outline">2.1%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Maio</span>
                <Badge variant="outline">1.8%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Junho</span>
                <Badge className="bg-green-100 text-green-800">1.3%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Deadlines */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas atividades do departamento de RH
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.employee}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-400">
                    {new Date(activity.date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Prazos Próximos</CardTitle>
            <CardDescription>
              Próximos prazos e compromissos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getDeadlineIcon(deadline.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {deadline.employee}
                    </p>
                    <p className="text-sm text-gray-500">
                      {deadline.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={isDeadlineUrgent(deadline.deadline) ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {new Date(deadline.deadline).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Separation Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Separation Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Emita seus desligamentos</CardTitle>
            <CardDescription>
              Análise de desligamentos e rotatividade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xs text-muted-foreground">Neste mês</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <p className="text-sm text-muted-foreground">Menos de um ano de casa</p>
                <p className="text-xs text-muted-foreground">Neste mês</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <p className="text-sm text-muted-foreground">Em período de experiência</p>
                <p className="text-xs text-muted-foreground">Neste mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Turnover Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Rotatividade</CardTitle>
            <CardDescription>
              Taxa de rotatividade mensal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <p className="text-sm text-muted-foreground">Neste mês</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-red-600">
                    <span className="text-2xl font-bold">-100%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">vs mês anterior</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          Ver análise demissional
        </Button>
      </div>
    </div>
  )
}