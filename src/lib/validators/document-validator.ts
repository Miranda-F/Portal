import { DocumentFormData } from '@/types/document'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export class DocumentValidator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private static readonly ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]

  static validateDocumentForm(formData: DocumentFormData, isEditing: boolean = false): ValidationResult {
    const errors: ValidationError[] = []

    // Validate code
    if (!formData.code.trim()) {
      errors.push({ field: 'code', message: 'O código do documento é obrigatório.' })
    } else if (formData.code.length > 50) {
      errors.push({ field: 'code', message: 'O código do documento não pode ter mais de 50 caracteres.' })
    }

    // Validate title
    if (!formData.title.trim()) {
      errors.push({ field: 'title', message: 'O título do documento é obrigatório.' })
    } else if (formData.title.length > 200) {
      errors.push({ field: 'title', message: 'O título do documento não pode ter mais de 200 caracteres.' })
    }

    // Validate version
    if (!formData.version.trim()) {
      errors.push({ field: 'version', message: 'A versão do documento é obrigatória.' })
    } else if (!/^\d+\.\d+$/.test(formData.version)) {
      errors.push({ field: 'version', message: 'A versão deve seguir o formato X.Y (ex: 1.0).' })
    }

    // Validate issue date
    if (!formData.issueDate) {
      errors.push({ field: 'issueDate', message: 'A data de emissão é obrigatória.' })
    } else {
      const issueDate = new Date(formData.issueDate)
      if (isNaN(issueDate.getTime())) {
        errors.push({ field: 'issueDate', message: 'Data de emissão inválida.' })
      } else if (issueDate > new Date()) {
        errors.push({ field: 'issueDate', message: 'A data de emissão não pode ser futura.' })
      }
    }

    // Validate responsible sector
    if (!formData.responsibleSector.trim()) {
      errors.push({ field: 'responsibleSector', message: 'O setor responsável é obrigatório.' })
    }

    // Validate type
    if (!formData.type) {
      errors.push({ field: 'type', message: 'O tipo do documento é obrigatório.' })
    }

    // Validate description
    if (formData.description && formData.description.length > 5000) {
      errors.push({ field: 'description', message: 'A descrição não pode ter mais de 5000 caracteres.' })
    }

    // Validate file (only required for new documents)
    if (!isEditing && !formData.file) {
      errors.push({ field: 'file', message: 'O anexo do documento é obrigatório.' })
    } else if (formData.file) {
      this.validateFile(formData.file, errors)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private static validateFile(file: File, errors: ValidationError[]): void {
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push({ field: 'file', message: 'O arquivo não pode ser maior que 10MB.' })
    }

    // Validate file type
    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push({ 
        field: 'file', 
        message: 'Tipo de arquivo não suportado. Use PDF, DOC, DOCX, XLS, XLSX ou TXT.' 
      })
    }

    // Validate file name for security
    const fileName = file.name.toLowerCase()
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      errors.push({ field: 'file', message: 'Nome de arquivo inválido.' })
    }

    // Check for potentially dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs', '.ps1']
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      errors.push({ field: 'file', message: 'Tipo de arquivo não permitido por segurança.' })
    }
  }

  static sanitizeFileName(fileName: string): string {
    // Remove path traversal attempts
    let sanitized = fileName.replace(/\.\./g, '').replace(/[\/\\]/g, '_')
    
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>:"|?*]/g, '_')
    
    // Limit length
    if (sanitized.length > 255) {
      const extension = sanitized.includes('.') ? sanitized.split('.').pop() : ''
      const nameWithoutExt = sanitized.includes('.') ? 
        sanitized.substring(0, sanitized.lastIndexOf('.')) : sanitized
      sanitized = nameWithoutExt.substring(0, 255 - (extension.length + 1)) + '.' + extension
    }
    
    return sanitized
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}