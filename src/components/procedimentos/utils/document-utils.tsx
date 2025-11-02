import { Document } from '@/types/document'
import { statusOptions, documentTypes } from '@/constants/document'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react'

export const getStatusIcon = (status: Document['status']) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'inactive':
      return <XCircle className="h-4 w-4 text-gray-500" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'expired':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    default:
      return <FileText className="h-4 w-4" />
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
  const availableLength = maxLength - extension.length - 3 // 3 para "..."
  
  if (nameWithoutExt.length <= availableLength) return fileName
  
  return nameWithoutExt.substring(0, availableLength) + '...' + extension
}

