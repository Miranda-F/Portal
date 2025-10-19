import { Document, DocumentVersion, DocumentApproval, DocumentAccess } from '@/types/document'

export const mockDocuments: Document[] = [
  {
    id: "1",
    code: "PGQ-001",
    title: "Procedimento de Controle de Documentos",
    version: "2.0",
    issueDate: "2024-01-15",
    reviewDate: "2024-01-10",
    nextReviewDate: "2025-01-15",
    responsibleSector: "Qualidade",
    status: "active",
    type: "procedure",
    description: "Procedimento para controle de documentos do sistema de gestão da qualidade",
    approver: "João Silva",
    createdBy: "Maria Santos",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
    accessLevel: "public"
  },
  {
    id: "2",
    code: "IT-002",
    title: "Instrução de Trabalho para Calibração de Equipamentos",
    version: "1.0",
    issueDate: "2024-02-01",
    reviewDate: "2024-01-28",
    nextReviewDate: "2025-02-01",
    responsibleSector: "Manutenção",
    status: "active",
    type: "instruction",
    description: "Instrução detalhada para calibração de equipamentos de medição",
    approver: "Carlos Oliveira",
    createdBy: "Ana Costa",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-01",
    accessLevel: "restricted"
  },
  {
    id: "3",
    code: "FR-003",
    title: "Formulário de Registro de Não Conformidade",
    version: "3.0",
    issueDate: "2023-12-01",
    reviewDate: "2023-11-28",
    nextReviewDate: "2024-12-01",
    responsibleSector: "Qualidade",
    status: "expired",
    type: "form",
    description: "Formulário para registro de não conformidades encontradas",
    approver: "João Silva",
    createdBy: "Pedro Lima",
    createdAt: "2023-12-01",
    updatedAt: "2023-12-01",
    accessLevel: "public"
  }
]

export const mockVersions: DocumentVersion[] = [
  {
    id: "1",
    documentId: "1",
    version: "1.0",
    changes: "Versão inicial do procedimento",
    changedBy: "Maria Santos",
    changedAt: "2023-06-01",
    status: "approved",
    approvedBy: "João Silva",
    approvedAt: "2023-06-01"
  },
  {
    id: "2",
    documentId: "1",
    version: "2.0",
    changes: "Atualização conforme ISO 9001:2015",
    changedBy: "Maria Santos",
    changedAt: "2024-01-10",
    status: "approved",
    approvedBy: "João Silva",
    approvedAt: "2024-01-15"
  }
]

export const mockApprovals: DocumentApproval[] = [
  {
    id: "1",
    documentId: "1",
    documentVersion: "2.0",
    requestedBy: "Maria Santos",
    requestedAt: "2024-01-10",
    approver: "João Silva",
    status: "approved",
    approvedAt: "2024-01-15"
  }
]

export const mockAccess: DocumentAccess[] = [
  {
    id: "1",
    documentId: "1",
    userId: "1",
    userName: "Maria Santos",
    action: "edited",
    timestamp: "2024-01-10"
  },
  {
    id: "2",
    documentId: "1",
    userId: "2",
    userName: "João Silva",
    action: "approved",
    timestamp: "2024-01-15"
  },
  {
    id: "3",
    documentId: "1",
    userId: "3",
    userName: "Ana Costa",
    action: "viewed",
    timestamp: "2024-01-20"
  }
]