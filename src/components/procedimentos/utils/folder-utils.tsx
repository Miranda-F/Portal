import { Document } from '@/types/document'
import { documentTypes } from '@/constants/document'
import { FileText } from 'lucide-react'

export const calculateFolderData = (allDocuments: Document[]) => {
  // Contar documentos por tipo usando allDocuments para não ser afetado por filtros de outras seções
  const typeCounts = allDocuments.reduce((acc, doc) => {
    const type = (doc.type as string) || 'other'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Estilos por tipo (cores e ícones)
  const getFolderStyle = (type: string) => {
    switch (type) {
      case 'procedure':
        return { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-300', icon: FileText, badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200' }
      case 'instruction':
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-300', icon: FileText, badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200' }
      case 'form':
        return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-300', icon: FileText, badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200' }
      case 'policy':
        return { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-600 dark:text-violet-300', icon: FileText, badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200' }
      case 'manual':
        return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-300', icon: FileText, badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200' }
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300', icon: FileText, badge: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200' }
    }
  }

  // Conjunto base vindo de documentTypes
  const baseTypes = documentTypes.map(dt => String(dt.value)) as string[]
  // Tipos adicionais presentes nos documentos mas não listados em documentTypes
  const extraTypes = Object.keys(typeCounts).filter(t => !baseTypes.includes(t))

  const allTypes = [...baseTypes, ...extraTypes]

  return allTypes.map((type) => {
    const style = getFolderStyle(type)
    const typeOption = documentTypes.find(dt => dt.value === type)
    const name = typeOption?.label || (type.charAt(0).toUpperCase() + type.slice(1))
    return {
      type,
      name,
      count: typeCounts[type] || 0,
      icon: style.icon,
      bg: style.bg,
      text: style.text,
      badge: style.badge
    }
  })
}

