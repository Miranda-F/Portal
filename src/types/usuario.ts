export interface Procedure {
  id: string
  title: string
  content: string
  type: 'MANAGEMENT_PROCEDURE' | 'WORK_INSTRUCTION'
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  createdBy: {
    id: string
    name: string
    email: string
  }
}

export interface Job {
  id: string
  title: string
  description: string
  department: string
  email: string
  phone?: string
  requirements?: string
  salary?: string
  location?: string
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'REMOTE'
  status: 'ACTIVE' | 'INACTIVE' | 'FILLED'
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  maxAttendees?: number
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}