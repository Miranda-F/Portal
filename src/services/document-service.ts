import { Document, Sector, DocumentFormData } from '@/types/document'
import { DocumentValidator } from '@/lib/validators/document-validator'

export interface DocumentServiceResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export class DocumentService {
  private static readonly BASE_URL = '/api/admin/procedures'

  /**
   * Determina o status do documento mapeando SOMENTE o status do backend,
   * mantendo 'expired' quando a data já passou. NÃO usa "pendente" por proximidade.
   */
  private static determineDocumentStatus(backendStatus: string, expiryDate: string | null | undefined): Document['status'] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (expiryDate) {
      const expiry = new Date(expiryDate)
      expiry.setHours(0, 0, 0, 0)
      if (expiry.getTime() < today.getTime()) {
        return 'expired'
      }
    }

    if (backendStatus === 'PUBLISHED') return 'active'
    if (backendStatus === 'DRAFT') return 'pending'
    if (backendStatus === 'ARCHIVED') return 'inactive'
    return 'inactive'
  }

  static async fetchDocuments(): Promise<DocumentServiceResponse<Document[]>> {
    try {
      const response = await fetch(this.BASE_URL)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const documentsData = await response.json()
      
      // Transformar dados da API para corresponder à interface Document
        const transformedDocuments = documentsData.map((doc: any) => {
        // Determinar status usando a função helper
        const status = this.determineDocumentStatus(doc.status, doc.expiryDate)
        return ({
        id: doc.id,
        code: doc.title.substring(0, 10) || "DOC-" + doc.id.substring(0, 4),
        title: doc.title,
        version: doc.version || "1.0", // Usar versão do backend (calculada do histórico)
        issueDate: doc.documentDate ? new Date(doc.documentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reviewDate: doc.documentDate ? new Date(doc.documentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        nextReviewDate: doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        responsibleSector: doc.sector?.name || "",
        status,
        type: doc.type === 'MANAGEMENT_PROCEDURE' ? 'procedure' : 'instruction',
        description: doc.content || "",
        approver: "",
        createdBy: doc.createdBy?.name || "Unknown",
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        fileType: doc.fileName?.split('.').pop() || "",
        accessLevel: "public",
        folderPath: doc.folderPath || null
      })})

      // Remover mocks conhecidos (títulos como "Mock Doc ...")
      const cleanedDocuments = transformedDocuments.filter((d: any) => !/^mock\s+doc/i.test(d.title || ''))

      return {
        data: cleanedDocuments,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }
    }
  }

  static async createDocument(formData: DocumentFormData, sectors: Sector[]): Promise<DocumentServiceResponse<Document>> {
    try {
      // Validar dados do formulário
      const validation = DocumentValidator.validateDocumentForm(formData, false)
      if (!validation.isValid) {
        return {
          data: null,
          error: validation.errors.map(e => e.message).join(', '),
          success: false
        }
      }

      // Criar FormData para requisição da API
      // Sempre usar a data atual para criação (não permitir alteração)
      const today = new Date().toISOString().split('T')[0]
      
      const apiFormData = new FormData()
      apiFormData.append('title', formData.title)
      apiFormData.append('content', formData.description)
      // Validar tipo (já validado no DocumentValidator, mas verificamos aqui também)
      if (!formData.type) {
        return {
          data: null,
          error: 'O tipo do documento é obrigatório.',
          success: false
        }
      }
      
      // Mapear tipo corretamente
      const typeMapping: Record<string, string> = {
        'procedure': 'MANAGEMENT_PROCEDURE',
        'instruction': 'WORK_INSTRUCTION',
        'form': 'WORK_INSTRUCTION',
        'policy': 'WORK_INSTRUCTION',
        'manual': 'WORK_INSTRUCTION',
        'record': 'WORK_INSTRUCTION',
        'other': 'WORK_INSTRUCTION'
      }
      apiFormData.append('type', typeMapping[formData.type] || 'WORK_INSTRUCTION')
      apiFormData.append('status', 'PUBLISHED')
      apiFormData.append('documentDate', today)
      
      // Adicionar data de vencimento se fornecida
      if (formData.nextReviewDate) {
        apiFormData.append('expiryDate', formData.nextReviewDate)
      } else {
        // Garantir status ativo na criação: definir 31 dias à frente
        const base = new Date(today)
        base.setDate(base.getDate() + 31)
        apiFormData.append('expiryDate', base.toISOString().split('T')[0])
      }
      
      // Encontrar ID do setor a partir do nome do setor
      const sector = sectors.find(s => s.name === formData.responsibleSector)
      if (sector) {
        apiFormData.append('sectorId', sector.id)
      }
      
      // Adicionar folderPath se fornecido
      if (formData.folderPath) {
        apiFormData.append('folderPath', formData.folderPath)
      }
      
      if (formData.file) {
        // Limpar nome do arquivo para segurança
        const sanitizedFileName = DocumentValidator.sanitizeFileName(formData.file.name)
        const sanitizedFile = new File([formData.file], sanitizedFileName, {
          type: formData.file.type
        })
        apiFormData.append('file', sanitizedFile)
      }

      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        body: apiFormData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Transformar a resposta para corresponder à interface Document
      // Na criação, sempre usar status 'active' (ignorar regra de 30 dias)
      const newDocument: Document = {
        id: data.id,
        code: formData.code,
        title: data.title,
        version: data.version || "1.0",
        issueDate: data.documentDate ? new Date(data.documentDate).toISOString().split('T')[0] : formData.issueDate,
        reviewDate: data.documentDate ? new Date(data.documentDate).toISOString().split('T')[0] : formData.issueDate,
        nextReviewDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : (formData.nextReviewDate || new Date(formData.issueDate).toISOString().split('T')[0]),
        responsibleSector: data.sector?.name || formData.responsibleSector,
        status: 'active', // Sempre criar com status ativo
        type: (formData.type || 'procedure') as Document['type'],
        description: data.content || "",
        approver: "",
        createdBy: data.createdBy?.name || "Unknown",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileName?.split('.').pop() || "",
        accessLevel: "public",
        folderPath: data.folderPath || undefined
      }

      return {
        data: newDocument,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error creating document:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }
    }
  }

  static async updateDocument(id: string, formData: DocumentFormData, sectors: Sector[]): Promise<DocumentServiceResponse<Document>> {
    try {
      // Validar dados do formulário (modo de edição)
      const validation = DocumentValidator.validateDocumentForm(formData, true)
      if (!validation.isValid) {
        return {
          data: null,
          error: validation.errors.map(e => e.message).join(', '),
          success: false
        }
      }

      // Validar tipo (já validado no DocumentValidator, mas verificamos aqui também)
      if (!formData.type) {
        return {
          data: null,
          error: 'O tipo do documento é obrigatório.',
          success: false
        }
      }
      
      // Criar FormData para requisição da API
      const apiFormData = new FormData()
      apiFormData.append('title', formData.title)
      apiFormData.append('content', formData.description)
      
      // Mapear tipo corretamente
      const typeMapping: Record<string, string> = {
        'procedure': 'MANAGEMENT_PROCEDURE',
        'instruction': 'WORK_INSTRUCTION',
        'form': 'WORK_INSTRUCTION',
        'policy': 'WORK_INSTRUCTION',
        'manual': 'WORK_INSTRUCTION',
        'record': 'WORK_INSTRUCTION',
        'other': 'WORK_INSTRUCTION'
      }
      
      // Mapeia status do frontend para backend
      if (formData.status === 'inactive') {
        apiFormData.append('type', 'WORK_INSTRUCTION') // "other" mapeado para WORK_INSTRUCTION
        apiFormData.append('status', 'ARCHIVED')
      } else if (formData.status === 'expired') {
        // Para expirado, mantém o tipo e status original, mas define expiryDate no passado
        apiFormData.append('type', typeMapping[formData.type] || 'WORK_INSTRUCTION')
        apiFormData.append('status', 'PUBLISHED') // Mantém como PUBLISHED, o expired é calculado pela data
        // Define expiryDate para ontem para garantir que está expirado
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        apiFormData.append('expiryDate', yesterday.toISOString().split('T')[0])
      } else {
        apiFormData.append('type', typeMapping[formData.type] || 'WORK_INSTRUCTION')
        apiFormData.append('status', formData.status === 'pending' ? 'DRAFT' : 'PUBLISHED')
      }
      
      // Não permitir alterar a data de criação na edição
      // A data de criação permanece a mesma do documento original
      // Não enviar documentDate no update para manter a data original
      
      // Não permitir alterar data de vencimento por aqui; reaprazamento é via fluxo dedicado
      
      // Encontrar ID do setor a partir do nome do setor
      const sector = sectors.find(s => s.name === formData.responsibleSector)
      if (sector) {
        apiFormData.append('sectorId', sector.id)
      }
      
      // Adicionar folderPath se fornecido (ou string vazia para remover)
      if (formData.folderPath !== undefined) {
        apiFormData.append('folderPath', formData.folderPath || '')
      }
      
      if (formData.file) {
        // Limpar nome do arquivo para segurança
        const sanitizedFileName = DocumentValidator.sanitizeFileName(formData.file.name)
        const sanitizedFile = new File([formData.file], sanitizedFileName, {
          type: formData.file.type
        })
        apiFormData.append('file', sanitizedFile)
      }

      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        body: apiFormData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Transformar a resposta para corresponder à interface Document
      // Na edição, SEMPRE usar o status escolhido pelo usuário (ignorar regra de 30 dias)
      // A regra de 30 dias só se aplica na listagem, não na edição manual
      // Se o usuário escolheu um status, usar esse status diretamente
      let status: Document['status'] = 'active'
      if (formData.status) {
        status = formData.status
      } else {
        // Se não foi escolhido, aplicar a regra de 30 dias
        status = this.determineDocumentStatus(data.status || 'PUBLISHED', data.expiryDate)
      }
      
      // Se o status for inativo, o tipo deve ser "other"
      const documentType = status === 'inactive' ? 'other' : (formData.type || (data.type === 'MANAGEMENT_PROCEDURE' ? 'procedure' : 'instruction'))
      
      const updatedDocument: Document = {
        id: data.id,
        code: formData.code,
        title: data.title,
        version: data.version || "1.0", // Versão sempre vem do backend, calculada do histórico
        issueDate: data.documentDate ? new Date(data.documentDate).toISOString().split('T')[0] : formData.issueDate,
        reviewDate: data.documentDate ? new Date(data.documentDate).toISOString().split('T')[0] : formData.issueDate,
        nextReviewDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : new Date(formData.issueDate).toISOString().split('T')[0],
        responsibleSector: data.sector?.name || formData.responsibleSector,
        status,
        type: documentType,
        description: data.content || "",
        approver: "",
        createdBy: data.createdBy?.name || "Unknown",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileName?.split('.').pop() || "",
        accessLevel: "public",
        folderPath: data.folderPath || undefined
      }

      return {
        data: updatedDocument,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error updating document:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }
    }
  }

  static async deleteDocument(id: string): Promise<DocumentServiceResponse<boolean>> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return {
        data: true,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }
    }
  }

  static async rescheduleDocument(id: string, newExpiryDate: string): Promise<DocumentServiceResponse<Document>> {
    try {
      const formData = new FormData()
      formData.append('expiryDate', newExpiryDate)

      const response = await fetch(`${this.BASE_URL}/${id}/reschedule`, {
        method: 'PUT',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Transformar a resposta para corresponder à interface Document
      const status = this.determineDocumentStatus(data.status || 'PUBLISHED', data.expiryDate)
      
      const updatedDocument: Document = {
        id: data.id,
        code: data.title?.substring(0, 10) || `DOC-${data.id.substring(0, 4)}`,
        title: data.title,
        version: data.version || "1.0",
        issueDate: data.documentDate ? new Date(data.documentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reviewDate: data.documentDate ? new Date(data.documentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        nextReviewDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        responsibleSector: data.sector?.name || "",
        status,
        type: data.type === 'MANAGEMENT_PROCEDURE' ? 'procedure' : 'instruction',
        description: data.content || "",
        approver: "",
        createdBy: data.createdBy?.name || "Unknown",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileName?.split('.').pop() || "",
        accessLevel: "public"
      }

      return {
        data: updatedDocument,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error rescheduling document:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }
    }
  }

  static async logAccess(id: string, action: 'VIEWED' | 'DOWNLOADED' | 'EDITED'): Promise<void> {
    try {
      const url = `${this.BASE_URL}/${id}/access`
      const payload = JSON.stringify({ action })

      // Preferir sendBeacon para garantir envio mesmo com navegação/download
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const blob = new Blob([payload], { type: 'application/json' })
        const ok = (navigator as any).sendBeacon(url, blob)
        if (ok) return
        // fallback para fetch caso sendBeacon retorne false
      }

      // Fallback: fetch com keepalive para não ser cancelado em navegação
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      })
    } catch (e) {
      // Falha em log não deve quebrar UX
      console.warn('Failed to log document access:', e)
    }
  }

  static async fetchSectors(): Promise<DocumentServiceResponse<Sector[]>> {
    try {
      const response = await fetch('/api/admin/sectors')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const sectorsData = await response.json()
      return {
        data: sectorsData,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error fetching sectors:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }
    }
  }
}