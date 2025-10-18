import { Document, Sector, DocumentFormData } from '@/types/document'
import { DocumentValidator } from '@/lib/validators/document-validator'

export interface DocumentServiceResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export class DocumentService {
  private static readonly BASE_URL = '/api/admin/procedures'

  static async fetchDocuments(): Promise<DocumentServiceResponse<Document[]>> {
    try {
      const response = await fetch(this.BASE_URL)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const documentsData = await response.json()
      
      // Transform API data to match the Document interface
      const transformedDocuments = documentsData.map((doc: any) => ({
        id: doc.id,
        code: doc.title.substring(0, 10) || "DOC-" + doc.id.substring(0, 4),
        title: doc.title,
        version: "1.0",
        issueDate: doc.documentDate ? new Date(doc.documentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reviewDate: doc.documentDate ? new Date(doc.documentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        nextReviewDate: doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        responsibleSector: doc.sector?.name || "",
        status: doc.status === 'PUBLISHED' ? 'active' : doc.status === 'DRAFT' ? 'pending' : 'inactive',
        type: doc.type === 'MANAGEMENT_PROCEDURE' ? 'procedure' : 'instruction',
        description: doc.content || "",
        approver: "",
        createdBy: doc.createdBy?.name || "Unknown",
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        fileType: doc.fileName?.split('.').pop() || "",
        accessLevel: "public"
      }))

      return {
        data: transformedDocuments,
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
      // Validate form data
      const validation = DocumentValidator.validateDocumentForm(formData, false)
      if (!validation.isValid) {
        return {
          data: null,
          error: validation.errors.map(e => e.message).join(', '),
          success: false
        }
      }

      // Create FormData for API request
      const apiFormData = new FormData()
      apiFormData.append('title', formData.title)
      apiFormData.append('content', formData.description)
      apiFormData.append('type', formData.type === 'procedure' ? 'MANAGEMENT_PROCEDURE' : 'WORK_INSTRUCTION')
      apiFormData.append('status', 'PUBLISHED')
      apiFormData.append('documentDate', formData.issueDate)
      
      // Find sector ID from sector name
      const sector = sectors.find(s => s.name === formData.responsibleSector)
      if (sector) {
        apiFormData.append('sectorId', sector.id)
      }
      
      if (formData.file) {
        // Sanitize file name for security
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
      
      // Transform the response to match Document interface
      const newDocument: Document = {
        id: data.id,
        code: formData.code,
        title: data.title,
        version: "1.0",
        issueDate: data.documentDate ? new Date(data.documentDate).toISOString().split('T')[0] : formData.issueDate,
        reviewDate: data.documentDate ? new Date(data.documentDate).toISOString().split('T')[0] : formData.issueDate,
        nextReviewDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : new Date(formData.issueDate),
        responsibleSector: data.sector?.name || formData.responsibleSector,
        status: 'active',
        type: formData.type,
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
      // Validate form data (editing mode)
      const validation = DocumentValidator.validateDocumentForm(formData, true)
      if (!validation.isValid) {
        return {
          data: null,
          error: validation.errors.map(e => e.message).join(', '),
          success: false
        }
      }

      // Create FormData for API request
      const apiFormData = new FormData()
      apiFormData.append('title', formData.title)
      apiFormData.append('content', formData.description)
      apiFormData.append('type', formData.type === 'procedure' ? 'MANAGEMENT_PROCEDURE' : 'WORK_INSTRUCTION')
      apiFormData.append('status', 'PUBLISHED')
      apiFormData.append('documentDate', formData.issueDate)
      
      // Find sector ID from sector name
      const sector = sectors.find(s => s.name === formData.responsibleSector)
      if (sector) {
        apiFormData.append('sectorId', sector.id)
      }
      
      if (formData.file) {
        // Sanitize file name for security
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
      
      // Transform the response to match Document interface
      const updatedDocument: Document = {
        id: data.id,
        code: formData.code,
        title: data.title,
        version: formData.version,
        issueDate: data.documentDate ? new Date(data.documentDate).toISOString().split('T')[0] : formData.issueDate,
        reviewDate: data.documentDate ? new Date(data.documentDate).toISOString().split('T')[0] : formData.issueDate,
        nextReviewDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : new Date(formData.issueDate),
        responsibleSector: data.sector?.name || formData.responsibleSector,
        status: 'active',
        type: formData.type,
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