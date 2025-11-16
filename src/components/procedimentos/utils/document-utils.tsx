import { Document } from '@/types/document'
import { statusOptions, documentTypes } from '@/constants/document'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react'

export const getStatusIcon = (status: Document['status']) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'inactive':
      return <XCircle className="h-5 w-5 text-gray-500" />
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />
    case 'expired':
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

export const getStatusBadge = (status: Document['status']) => {
  const statusOption = statusOptions.find(opt => opt.value === status)
  return (
    <Badge variant="outline" className="flex items-center space-x-1">
      {getStatusIcon(status)}
      <span>{statusOption?.label || status}</span>
    </Badge>
  )
}

export const getTypeLabel = (type: Document['type']) => {
  const typeOption = documentTypes.find(opt => opt.value === type)
  return typeOption?.label || type
}

export const getFileIcon = (document: Document) => {
  // Primeiro tenta pegar a extensão do campo fileType do documento
  let fileExtension = document.fileType?.toLowerCase() || ''
  
  // Se não tiver fileType, tenta extrair do título
  if (!fileExtension) {
    const fileName = document.title || ''
    fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
  }
  
  // Usar imagens para PDF e DOCX
  if (fileExtension === 'pdf') {
    return (
      <div className="w-16 h-16 rounded flex items-center justify-center">
        <img src="/pdf.png" alt="PDF" className="w-16 h-16 object-contain" />
      </div>
    )
  }
  
  if (fileExtension === 'docx' || fileExtension === 'doc') {
    return (
      <div className="w-16 h-16 rounded flex items-center justify-center">
        <img src="/docx-file.png" alt="DOCX" className="w-16 h-16 object-contain" />
      </div>
    )
  }
  
  // Para outros tipos, usar ícone padrão
  const getFileTypeInfo = (extension: string) => {
    switch (extension) {
      case 'doc':
        return { 
          icon: 'bxs-file-doc', 
          color: 'text-blue-600', 
          bg: 'bg-blue-50',
          label: 'DOC' 
        }
      case 'xls':
      case 'xlsx':
        return { 
          icon: 'bxs-file-doc', 
          color: 'text-green-600', 
          bg: 'bg-green-50',
          label: 'XLS' 
        }
      case 'ppt':
      case 'pptx':
        return { 
          icon: 'bxs-file-ppt', 
          color: 'text-orange-600', 
          bg: 'bg-orange-50',
          label: 'PPT' 
        }
      case 'txt':
        return { 
          icon: 'bxs-file-txt', 
          color: 'text-gray-600', 
          bg: 'bg-gray-50',
          label: 'TXT' 
        }
      default:
        return { 
          icon: 'bxs-file', 
          color: 'text-gray-600', 
          bg: 'bg-gray-50',
          label: 'FILE' 
        }
    }
  }
  
  const fileInfo = getFileTypeInfo(fileExtension)
  
  return (
    <div className={`w-16 h-16 ${fileInfo.bg} rounded flex items-center justify-center`}>
      <i className={`bx ${fileInfo.icon} ${fileInfo.color} text-3xl`}></i>
    </div>
  )
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export const truncateFileName = (fileName: string, maxLength: number = 30): string => {
  if (fileName.length <= maxLength) return fileName
  
  // Extrai a extensão
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot === -1) {
    // Sem extensão, apenas trunca
    return fileName.substring(0, maxLength - 3) + '...'
  }
  
  const extension = fileName.substring(lastDot)
  const nameWithoutExt = fileName.substring(0, lastDot)
  const availableLength = maxLength - extension.length - 3 
  
  if (nameWithoutExt.length <= availableLength) return fileName
  
  return nameWithoutExt.substring(0, availableLength) + '...' + extension
}

export const getDirectoryFromType = (type: Document['type']): string => {
  const directoryMap: Record<Document['type'], string> = {
    'procedure': 'Procedimentos',
    'instruction': 'Instruções de Trabalho',
    'form': 'Formulários',
    'policy': 'Políticas',
    'manual': 'Manuais',
    'record': 'Registros',
    'other': 'Outros'
  }
  return directoryMap[type] || 'Outros'
}

/**
 * Retorna o nome da pasta baseado no folderPath do documento
 * Se não houver folderPath, retorna o diretório baseado no tipo
 */
export const getDirectoryFromFolderPath = (document: Document): string => {
  // Se o documento tem folderPath, extrair o nome da pasta do caminho
  if (document.folderPath) {
    const pathParts = document.folderPath.split('/').filter(Boolean)
    // Retornar o último elemento do caminho (nome da pasta)
    return pathParts[pathParts.length - 1] || document.folderPath
  }
  
  // Se não tem folderPath, usar o diretório baseado no tipo (fallback)
  return getDirectoryFromType(document.type)
}

export const getExpirationStatus = (expiryDate: string | null): { 
  status: 'valid' | 'warning' | 'expired', 
  daysUntilExpiry: number,
  bgColor: string 
} => {
  if (!expiryDate) {
    return { status: 'valid', daysUntilExpiry: Infinity, bgColor: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' }
  }
  // Parse YYYY-MM-DD as local date to avoid timezone shifts
  let expiry: Date
  if (/^\d{4}-\d{2}-\d{2}/.test(expiryDate)) {
    const [y, m, d] = expiryDate.split('T')[0].split('-').map(Number)
    expiry = new Date(y, (m || 1) - 1, d || 1)
  } else {
    expiry = new Date(expiryDate)
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return { status: 'expired', daysUntilExpiry: diffDays, bgColor: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' }
  } else if (diffDays <= 30) {
    return { status: 'warning', daysUntilExpiry: diffDays, bgColor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' }
  } else {
    return { status: 'valid', daysUntilExpiry: diffDays, bgColor: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' }
  }
}

export const formatDate = (dateString: string): string => {
  if (!dateString) return '—'
  // If ISO date like YYYY-MM-DD, format by string parts to avoid TZ issues
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    const [y, m, d] = dateString.split('T')[0].split('-')
    return `${d}/${m}/${y}`
  }
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
  if (!text) return '—'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

