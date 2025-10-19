/**
 * Utilitários para classes de cores dinâmicas
 * Centraliza a lógica de cores para diferentes tipos e status
 */

export interface ColorMap {
  [key: string]: string
}

export interface ColorConfig {
  jobType: ColorMap
  eventType: ColorMap
  procedureType: ColorMap
  procedureStatus: ColorMap
  jobApplicationStatus: ColorMap
  trainingStatus: ColorMap
  employeeStatus: ColorMap
}

/**
 * Configuração padrão de cores para diferentes tipos e status
 */
export const defaultColorConfig: ColorConfig = {
  jobType: {
    FULL_TIME: 'bg-blue-100 text-blue-800',
    PART_TIME: 'bg-green-100 text-green-800',
    INTERNSHIP: 'bg-yellow-100 text-yellow-800',
    CONTRACT: 'bg-purple-100 text-purple-800',
    REMOTE: 'bg-orange-100 text-orange-800',
  },
  eventType: {
    UPCOMING: 'bg-blue-100 text-blue-800',
    ONGOING: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  },
  procedureType: {
    MANAGEMENT_PROCEDURE: 'bg-blue-100 text-blue-800',
    WORK_INSTRUCTION: 'bg-green-100 text-green-800',
  },
  procedureStatus: {
    PUBLISHED: 'bg-green-100 text-green-800',
    DRAFT: 'bg-yellow-100 text-yellow-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
  },
  jobApplicationStatus: {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  },
  trainingStatus: {
    VALID: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
  },
  employeeStatus: {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-red-100 text-red-800',
    ON_LEAVE: 'bg-yellow-100 text-yellow-800',
  },
}

/**
 * Função genérica para obter classe de cor baseada no tipo e status
 * @param type O tipo do item (jobType, eventType, etc.)
 * @param value O valor específico (FULL_TIME, UPCOMING, etc.)
 * @param customConfig Configuração customizada de cores (opcional)
 * @returns Classe CSS para a cor
 */
export function getColorClass(
  type: keyof ColorConfig, 
  value: string, 
  customConfig?: Partial<ColorConfig>
): string {
  const config = { ...defaultColorConfig, ...customConfig }
  const colorMap = config[type]
  
  return colorMap[value] || colorMap['default'] || 'bg-gray-100 text-gray-800'
}

/**
 * Funções específicas para cada tipo (para compatibilidade e facilidade de uso)
 */
export function getJobTypeColor(type: string): string {
  return getColorClass('jobType', type)
}

export function getEventTypeColor(status: string): string {
  return getColorClass('eventType', status)
}

export function getProcedureTypeColor(type: string): string {
  return getColorClass('procedureType', type)
}

export function getProcedureStatusColor(status: string): string {
  return getColorClass('procedureStatus', status)
}

export function getJobApplicationStatusColor(status: string): string {
  return getColorClass('jobApplicationStatus', status)
}

export function getTrainingStatusColor(status: string): string {
  return getColorClass('trainingStatus', status)
}

export function getEmployeeStatusColor(status: string): string {
  return getColorClass('employeeStatus', status)
}