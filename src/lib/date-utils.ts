/**
 * Utilitários para manipulação de datas, evitando problemas de timezone
 */

/**
 * Cria uma data a partir de uma string no formato "YYYY-MM-DD" como meia-noite UTC
 * Isso garante que a data seja salva corretamente no banco e possa ser formatada sem deslocamento
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) {
    throw new Error('Date string is required')
  }
  
  // Parse manual para evitar problemas de timezone
  const [year, month, day] = dateStr.split('-').map(Number)
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`)
  }
  
  // Criar data como meia-noite UTC para garantir consistência
  // Isso garante que "2025-12-18" seja sempre "2025-12-18T00:00:00Z" UTC
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  
  return date
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 * Aceita tanto Date quanto string ISO
 */
export function formatDateBR(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  let datePart: string
  
  if (typeof date === 'string') {
    // Se já é uma string ISO, extrair diretamente a parte da data
    datePart = date.split('T')[0] // "2025-12-18"
  } else {
    // Se é um Date, converter para ISO string primeiro
    // Mas usar UTC para garantir consistência
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${day}/${month}/${year}`
  }
  
  // Extrair ano, mês e dia da string "YYYY-MM-DD"
  const [year, month, day] = datePart.split('-')
  
  // Retornar no formato brasileiro (DD/MM/YYYY)
  return `${day}/${month}/${year}`
}

/**
 * Formata uma data para o formato brasileiro com hora (DD/MM/YYYY, HH:MM)
 */
export function formatDateTimeBR(date: Date | null | undefined): string {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return `${day}/${month}/${year}, ${hours}:${minutes}`
}

