export interface Sector {
  id: string
  name: string
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
  _count: {
    users: number
  }
}

export interface Document {
  id: string
  code: string
  title: string
  version: string
  issueDate: string
  reviewDate: string
  nextReviewDate: string
  responsibleSector: string
  status: 'active' | 'inactive' | 'pending' | 'expired'
  type: 'procedure' | 'instruction' | 'form' | 'policy' | 'manual' | 'record' | 'other'
  description: string
  approver: string
  createdBy: string
  createdAt: string
  updatedAt: string
  fileUrl?: string
  fileSize?: number
  fileType?: string
  accessLevel: 'public' | 'restricted' | 'confidential'
}

export interface DocumentVersion {
  id: string
  documentId: string
  version: string
  changes: string
  changedBy: string
  changedAt: string
  status: 'draft' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
}

export interface DocumentApproval {
  id: string
  documentId: string
  documentVersion: string
  requestedBy: string
  requestedAt: string
  approver: string
  status: 'pending' | 'approved' | 'rejected'
  approvedAt?: string
  rejectionReason?: string
}

export interface DocumentAccess {
  id: string
  documentId: string
  userId: string
  userName: string
  action: 'viewed' | 'downloaded' | 'edited' | 'approved' | 'rejected'
  timestamp: string
  ipAddress?: string
}

export interface DocumentFormData {
  code: string
  title: string
  version: string
  issueDate: string
  responsibleSector: string
  type: Document['type']
  description: string
  file: File | null
}

export interface VersionFormData {
  version: string
  changes: string
}

export interface ApprovalFormData {
  approver: string
  status: 'approved' | 'rejected'
  rejectionReason: string
}

export type DocumentType = Document['type']
export type DocumentStatus = Document['status']
export type AccessLevel = Document['accessLevel']
export type ApprovalStatus = DocumentApproval['status']
export type VersionStatus = DocumentVersion['status']
export type AccessAction = DocumentAccess['action']