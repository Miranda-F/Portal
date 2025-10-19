import { useState } from 'react'
import { Document } from '@/types/document'

interface UseDocumentFiltersProps {
  documents: Document[]
}

export function useDocumentFilters({ documents }: UseDocumentFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sectorFilter, setSectorFilter] = useState("all")

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.responsibleSector.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    const matchesType = typeFilter === "all" || doc.type === typeFilter
    const matchesSector = sectorFilter === "all" || doc.responsibleSector === sectorFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesSector
  })

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    setSectorFilter("all")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || typeFilter !== "all" || sectorFilter !== "all"

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    sectorFilter,
    setSectorFilter,
    filteredDocuments,
    resetFilters,
    hasActiveFilters
  }
}