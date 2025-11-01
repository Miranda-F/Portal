'use client'

import { Document } from '@/types/document'
import { 
  X, 
  Download,
  Edit, 
  Trash2, 
  History, 
  FileText,
  Calendar,
  User,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTypeLabel } from './utils/document-utils'

interface ProcedimentosFileDetailsProps {
  document: Document
  onClose: () => void
  onEdit: (document: Document) => void
  onDelete: (document: Document) => void
  onDownload: (document: Document) => void
  onViewHistory: (document: Document) => void
}

export function ProcedimentosFileDetails({
  document,
  onClose,
  onEdit,
  onDelete,
  onDownload,
  onViewHistory
}: ProcedimentosFileDetailsProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (document: Document) => {
    // Primeiro tenta pegar a extensão do campo fileType do documento
    let fileExtension = document.fileType?.toLowerCase() || ''
    
    // Se não tiver fileType, tenta extrair do título
    if (!fileExtension) {
      const fileName = document.title || ''
      fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
    }
    
    // Ícones e cores baseados no tipo de arquivo usando Boxicons sólidos
    const getFileTypeInfo = (extension: string) => {
      switch (extension) {
        case 'pdf':
          return { 
            icon: 'bxs-file-pdf', 
            color: 'text-red-600', 
            bg: 'bg-red-50',
            label: 'PDF' 
          }
        case 'doc':
        case 'docx':
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
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'svg':
          return { 
            icon: 'bxs-image', 
            color: 'text-purple-600', 
            bg: 'bg-purple-50',
            label: 'IMG' 
          }
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
          return { 
            icon: 'bxs-video', 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50',
            label: 'VID' 
          }
        case 'zip':
        case 'rar':
        case '7z':
          return { 
            icon: 'bxs-archive', 
            color: 'text-yellow-600', 
            bg: 'bg-yellow-50',
            label: 'ZIP' 
          }
        case 'mp3':
        case 'wav':
        case 'flac':
          return { 
            icon: 'bxs-music', 
            color: 'text-pink-600', 
            bg: 'bg-pink-50',
            label: 'AUD' 
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
    
    // Usar imagens para PDF e DOCX
    if (fileExtension === 'pdf') {
      return (
        <div className="w-16 h-16 rounded-lg flex items-center justify-center">
          <img src="/pdf.png" alt="PDF" className="w-16 h-16 object-contain" />
        </div>
      )
    }
    
    if (fileExtension === 'docx' || fileExtension === 'doc') {
      return (
        <div className="w-16 h-16 rounded-lg flex items-center justify-center">
          <img src="/docx-file.png" alt="DOCX" className="w-16 h-16 object-contain" />
        </div>
      )
    }
    
    // Para outros tipos, manter o ícone original
    return (
        <div className={`w-16 h-16 ${fileInfo.bg} rounded-lg flex items-center justify-center`}>
          <i className={`bx ${fileInfo.icon} ${fileInfo.color} text-4xl`}></i>
        </div>
    )
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: Document['status']) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'inactive':
        return 'Inativo'
      case 'pending':
        return 'Pendente'
      case 'expired':
        return 'Expirado'
      default:
        return status
    }
  }


  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-600 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Detalhes do Arquivo</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* File Icon and Basic Info */}
        <div className="text-center">
          {getFileIcon(document)}
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
              {document.title}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(document.fileSize || 0)}
              </span>
              <Badge className={getStatusColor(document.status)}>
                {getStatusLabel(document.status)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Descrição</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {document.description || 'Este é um documento importante do sistema de procedimentos da empresa. Contém informações essenciais para o funcionamento adequado dos processos internos.'}
          </p>
        </div>

        {/* File Details */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Tag className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Tipo</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{getTypeLabel(document.type as any)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Setor Responsável</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{document.responsibleSector}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Adicionado por</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{document.createdBy || 'Sistema'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Criado em</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(document.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Versão</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{document.version}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(document)}
              className="flex items-center justify-center gap-2"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewHistory(document)}
              className="flex items-center justify-center gap-2"
            >
              <History className="h-4 w-4" />
              <span>Histórico</span>
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(document)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(document)}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Excluir</span>
          </Button>
        </div>

      </div>
    </div>
  )
}
