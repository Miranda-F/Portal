// Types and interfaces for RH (Human Resources) module

export interface Job {
  id: string
  title: string
  description?: string
  requirements?: string
  department: string
  salary?: string
  maxApplications?: number
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  status: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}

export interface Sector {
  id: string
  name: string
  description?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}

export interface Employee {
  id?: string
  cpf: string
  name: string
  email: string
  phone?: string
  address?: string
  position: string
  sectorId: string
  admissionDate: string
  salary: string
  employmentType: 'CLT' | 'PJ' | 'INTERNSHIP' | 'TRAINEE'
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
  birthDate?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  educationLevel?: string
  maritalStatus?: string
  emergencyContact?: string
  emergencyPhone?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface Training {
  id: string
  title: string
  description?: string
  instructor?: string
  duration?: number
  modality: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  startDate?: string
  endDate?: string
  participants?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Stats {
  totalColaboradores: number
  admissõesMes: number
  desligamentosMes: number
  vagasAbertas: number
  treinamentosMes: number
  avaliacoesPendentes: number
}

export interface Activity {
  id: number
  type: 'admissao' | 'promocao' | 'treinamento' | 'avaliacao'
  employee: string
  date: string
  description: string
}

export interface Deadline {
  id: number
  type: 'exame' | 'treinamento' | 'avaliacao'
  employee: string
  deadline: string
  description: string
}

export interface JobForm {
  title: string
  description: string
  requirements: string
  department: string
  salary: string
  maxApplications: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  status: 'ACTIVE' | 'INACTIVE'
}

export interface EmployeeForm {
  cpf: string
  name: string
  email: string
  phone: string
  address: string
  position: string
  sectorId: string
  admissionDate: string
  salary: string
  employmentType: 'CLT' | 'PJ' | 'INTERNSHIP' | 'TRAINEE'
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
  birthDate: string
  gender: string
  educationLevel: string
  maritalStatus: string
  emergencyContact: string
  emergencyPhone: string
  notes: string
}

export type TabValue = 'colaboradores' | 'vagas' | 'treinamento' | 'indicadores'