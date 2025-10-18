'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, LabelList } from "recharts"
import { useTrainingStats, type TrainingStats } from "./useTrainingStats"

interface AdminTrainingStatsProps {
  trainings: any[]
}

export default function AdminTrainingStats({
  trainings
}: AdminTrainingStatsProps) {
  
  const trainingStats: TrainingStats = useTrainingStats(trainings)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Treinamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingStats.totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Prazo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{trainingStats.validCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{trainingStats.expiredCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vence no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{trainingStats.pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Training Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Treinamentos por Mês</CardTitle>
            <CardDescription>Quantidade de treinamentos criados por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainingStats.monthlyData}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="treinamentos" fill="hsl(221, 83%, 53%)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Status</CardTitle>
            <CardDescription>Proporção de treinamentos por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trainingStats.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trainingStats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Expiry Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vencimentos por Mês</CardTitle>
            <CardDescription>Quantidade de treinamentos que vencem por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainingStats.expiryData}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="vencimentos" fill="hsl(346, 77%, 49%)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Expired by Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Treinamentos Vencidos por Tipo</CardTitle>
            <CardDescription>Quantidade de treinamentos vencidos por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trainingStats.expiredByTypeConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainingStats.expiredByTypeData} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="tipo" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quantidade" fill="#ef4444" />
                  <LabelList dataKey="quantidade" position="right" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sector Distribution Chart */}
      {trainingStats.sectorData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Treinamentos por Setor e Tipo</CardTitle>
            <CardDescription>Distribuição de treinamentos por setor e tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trainingStats.sectorChartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainingStats.sectorData}>
                  <XAxis dataKey="tipo" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {Object.keys(trainingStats.sectorChartConfig).map((key) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={trainingStats.sectorChartConfig[key].color}
                      stackId="a"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}