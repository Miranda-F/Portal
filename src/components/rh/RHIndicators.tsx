"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Phone
} from "lucide-react"
import { useRHStats } from "@/hooks/use-rh"
import { Stats, Activity, Deadline } from "@/types/rh"

interface RHIndicatorsProps {
  activeTab: string
}

export default function RHIndicators({ activeTab }: RHIndicatorsProps) {
  const { stats, activities, deadlines, loading } = useRHStats()

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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Indicadores de RH</h2>
        <p className="text-muted-foreground">
          Acompanhe as métricas e indicadores do departamento de Recursos Humanos
        </p>
      </div>

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

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Desempenho</CardTitle>
          <CardDescription>
            Indicadores de desempenho por área
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Área</TableHead>
                  <TableHead>Produtividade</TableHead>
                  <TableHead>Satisfação</TableHead>
                  <TableHead>Engajamento</TableHead>
                  <TableHead>Absenteísmo</TableHead>
                  <TableHead>Tendência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Tecnologia</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">92%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">88%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">85%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">2.1%</Badge>
                  </TableCell>
                  <TableCell>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Vendas</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">87%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">78%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">82%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">3.5%</Badge>
                  </TableCell>
                  <TableCell>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">RH</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">90%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">91%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">89%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">1.8%</Badge>
                  </TableCell>
                  <TableCell>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Financeiro</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">85%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">83%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">76%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">2.3%</Badge>
                  </TableCell>
                  <TableCell>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Marketing</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">78%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">85%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">72%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">4.1%</Badge>
                  </TableCell>
                  <TableCell>
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}