'use client'

export interface TrainingStats {
  totalCount: number
  validCount: number
  expiredCount: number
  pendingCount: number
  monthlyData: { mes: string; treinamentos: number }[]
  expiryData: { mes: string; vencimentos: number }[]
  sectorData: any[]
  sectorChartConfig: Record<string, { label: string; color: string }>
  expiredByTypeData: { tipo: string; quantidade: number }[]
  expiredByTypeConfig: { quantidade: { label: string; color: string } }
  statusData: { name: string; value: number; color: string }[]
}

export function useTrainingStats(trainings: any[]) {
  const calculateTrainingStats = (): TrainingStats => {
    // Garantir que trainings seja um array válido
    const validTrainings = Array.isArray(trainings) ? trainings : []
    
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Contar treinamentos por status
    const validCount = validTrainings.filter(t => t.status === 'VALID').length
    const expiredCount = validTrainings.filter(t => t.status === 'EXPIRED').length
    const pendingCount = validTrainings.filter(t => t.status === 'PENDING').length
    const totalCount = validTrainings.length
    
    // Calcular treinamentos por mês (todos os 12 meses do ano)
    const monthlyData = []
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    for (let month = 0; month < 12; month++) {
      const monthName = monthNames[month]
      
      const monthTrainings = validTrainings.filter(t => {
        try {
          const trainingDate = new Date(t.createdAt || t.deadline)
          return trainingDate.getMonth() === month && trainingDate.getFullYear() === currentYear
        } catch {
          return false
        }
      }).length
      
      monthlyData.push({ mes: monthName, treinamentos: monthTrainings })
    }
    
    // Calcular vencimentos por mês (todos os 12 meses do ano)
    const expiryData = []
    for (let month = 0; month < 12; month++) {
      const monthName = monthNames[month]
      
      const monthExpiries = validTrainings.filter(t => {
        try {
          const deadline = new Date(t.deadline)
          return deadline.getMonth() === month && deadline.getFullYear() === currentYear
        } catch {
          return false
        }
      }).length
      
      expiryData.push({ mes: monthName, vencimentos: monthExpiries })
    }
    
    // Calcular dados por setor (usando setores reais do sistema)
    const sectorStats: Record<string, Record<string, number>> = {}
    const allSectors = new Set<string>()
    
    // Coletar todos os setores únicos
    validTrainings.forEach(training => {
      try {
        const sectorName = training.sector?.name || 'Não especificado'
        if (sectorName && typeof sectorName === 'string') {
          allSectors.add(sectorName)
        }
      } catch {
        allSectors.add('Não especificado')
      }
    })
    
    // Agrupar treinamentos por tipo e setor real
    validTrainings.forEach(training => {
      try {
        const sectorName = training.sector?.name || 'Não especificado'
        const trainingType = training.title.includes('NR 10') ? 'NR 10' : 
                            training.title.includes('NR 35') ? 'NR 35' : 'Outros'
        
        if (!sectorStats[trainingType]) {
          sectorStats[trainingType] = {}
        }
        
        sectorStats[trainingType][sectorName] = (sectorStats[trainingType][sectorName] || 0) + 1
      } catch {
        // Em caso de erro, ignorar este treinamento
      }
    })
    
    // Criar dados para o gráfico com setores dinâmicos
    const sectorData = Object.entries(sectorStats).map(([tipo, setoresMap]) => {
      const setorData: any = { tipo }
      
      // Adicionar todos os setores encontrados
      Array.from(allSectors).forEach(sectorName => {
        // Converter nome do setor para chave válida (remover espaços e caracteres especiais)
        const sectorKey = sectorName.toLowerCase().replace(/[^a-z0-9]/g, '_')
        // Garantir que o valor seja um número válido, caso contrário usar 0
        const rawValue = setoresMap[sectorName] || 0
        const value = typeof rawValue === 'number' && !isNaN(rawValue) && isFinite(rawValue) ? rawValue : 0
        setorData[sectorKey] = value
      })
      
      return setorData
    })
    
    // Validar e limpar os dados finais antes de retornar
    const cleanedSectorData = sectorData.map(item => {
      const cleanedItem: any = { tipo: item.tipo }
      Object.keys(item).forEach(key => {
        if (key !== 'tipo') {
          const value = item[key]
          cleanedItem[key] = typeof value === 'number' && !isNaN(value) && isFinite(value) ? value : 0
        }
      })
      return cleanedItem
    })
    
    // Criar configuração dinâmica para o gráfico
    const sectorChartConfig: Record<string, { label: string; color: string }> = {}
    const colors = [
      "hsl(221, 83%, 53%)",   // Azul
      "hsl(142, 76%, 36%)",   // Verde
      "hsl(346, 77%, 49%)",   // Rosa
      "hsl(24, 100%, 50%)",   // Laranja
      "hsl(280, 65%, 60%)",   // Roxo
      "hsl(194, 95%, 45%)",   // Ciano
      "hsl(43, 96%, 56%)",    // Amarelo
      "hsl(0, 72%, 51%)",     // Vermelho
    ]
    
    Array.from(allSectors).forEach((sectorName, index) => {
      if (sectorName && typeof sectorName === 'string' && sectorName.trim()) {
        const sectorKey = sectorName.toLowerCase().replace(/[^a-z0-9]/g, '_')
        sectorChartConfig[sectorKey] = {
          label: sectorName,
          color: colors[index % colors.length]
        }
      }
    })
    
    // Calcular treinamentos vencidos por tipo
    const expiredByTypeStats: Record<string, number> = {}
    
    // Agrupar treinamentos vencidos por tipo (usando o título exato do treinamento)
    validTrainings.forEach(training => {
      try {
        if (training.status === 'EXPIRED') {
          // Usar o título exato do treinamento como tipo
          const trainingType = training.title || 'Sem título'
          
          // Limitar o tamanho do nome para evitar nomes muito longos no gráfico
          const displayName = trainingType.length > 30 
            ? trainingType.substring(0, 30) + '...' 
            : trainingType
          
          expiredByTypeStats[displayName] = (expiredByTypeStats[displayName] || 0) + 1
        }
      } catch {
        // Em caso de erro, ignorar este treinamento
      }
    })
    
    // Criar dados para o gráfico de treinamentos vencidos por tipo
    const expiredByTypeData = Object.entries(expiredByTypeStats)
      .map(([tipo, quantidade]) => ({
        tipo,
        quantidade: typeof quantidade === 'number' && !isNaN(quantidade) && isFinite(quantidade) ? quantidade : 0
      }))
      .sort((a, b) => b.quantidade - a.quantidade) // Ordenar por quantidade (maior para menor)
    
    // Criar configuração para o gráfico de treinamentos vencidos por tipo
    const expiredByTypeConfig = {
      quantidade: {
        label: 'Quantidade de Colaboradores',
        color: '#ef4444' // Vermelho para treinamentos vencidos
      }
    }
    
    return {
      totalCount,
      validCount,
      expiredCount,
      pendingCount,
      monthlyData,
      expiryData,
      sectorData: cleanedSectorData,
      sectorChartConfig,
      expiredByTypeData,
      expiredByTypeConfig,
      statusData: [
        { name: 'No Prazo', value: validCount, color: 'hsl(180, 100%, 50%)' }, // Cor azul/ciano
        { name: 'Vencido', value: expiredCount, color: 'hsl(0, 100%, 50%)' }, // Cor vermelha
        { name: 'Vence no Mês', value: pendingCount, color: 'hsl(60, 100%, 50%)' }, // Cor amarela
      ]
    }
  }

  return calculateTrainingStats()
}