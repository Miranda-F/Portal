import { DocumentType, DocumentStatus, AccessLevel } from '@/types/document'

export const documentTypes = [
  { value: 'procedure', label: 'Procedimento' },
  { value: 'instruction', label: 'Instrução de Trabalho' },
  { value: 'form', label: 'Formulário' },
  { value: 'policy', label: 'Política' },
  { value: 'manual', label: 'Manual' },
  { value: 'record', label: 'Registro' },
  { value: 'other', label: 'Outro' }
] as const

export const statusOptions = [
  { value: 'active', label: 'Ativo', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inativo', color: 'bg-gray-500' },
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-500' },
  { value: 'expired', label: 'Vencido', color: 'bg-red-500' }
] as const

export const accessLevels = [
  { value: 'public', label: 'Público' },
  { value: 'restricted', label: 'Restrito' },
  { value: 'confidential', label: 'Confidencial' }
] as const

export const defaultDocumentForm = {
  code: "",
  title: "",
  version: "1.0",
  issueDate: new Date().toISOString().split('T')[0],
  responsibleSector: "",
  type: "" as DocumentType | "",
  description: "",
  file: null as File | null,
  folderPath: undefined as string | undefined
}

export const defaultVersionForm = {
  version: "",
  changes: ""
}

export const defaultApprovalForm = {
  approver: "",
  status: "approved" as 'approved' | 'rejected',
  rejectionReason: ""
}