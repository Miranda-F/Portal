"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Building2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Sector {
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

interface SectorSearchSelectorProps {
  selectedSectors: Sector[]
  onSectorsChange: (sectors: Sector[]) => void
  placeholder?: string
  disabled?: boolean
}

export function SectorSearchSelector({ 
  selectedSectors, 
  onSectorsChange, 
  placeholder = "Buscar setores...",
  disabled = false 
}: SectorSearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Sector[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Função para buscar setores
  const searchSectors = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/sectors?search=${encodeURIComponent(query)}&status=active`)
      if (response.ok) {
        const sectors = await response.json()
        // Filtrar setores já selecionados
        const filteredSectors = sectors.filter((sector: Sector) => 
          !selectedSectors.some(selected => selected.id === sector.id)
        )
        setSearchResults(filteredSectors)
      }
    } catch (error) {
      console.error('Error searching sectors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchSectors(searchTerm)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedSectors])

  // Fechar resultados quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addSector = (sector: Sector) => {
    onSectorsChange([...selectedSectors, sector])
    setSearchTerm("")
    setSearchResults([])
    setShowResults(false)
  }

  const removeSector = (sectorId: string) => {
    onSectorsChange(selectedSectors.filter(sector => sector.id !== sectorId))
  }

  return (
    <div className="space-y-3" ref={searchRef}>
      {/* Campo de busca */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            disabled={disabled}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => {
                setSearchTerm("")
                setSearchResults([])
                setShowResults(false)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Resultados da busca */}
        {showResults && (searchTerm || searchResults.length > 0) && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border max-h-60 overflow-auto">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                  Buscando...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  {searchResults.map((sector) => (
                    <div
                      key={sector.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => addSector(sector)}
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sector.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sector._count.users} usuário(s)
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum setor encontrado</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Setores selecionados */}
      {selectedSectors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Setores selecionados ({selectedSectors.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSectors.map((sector) => (
              <Badge
                key={sector.id}
                variant="secondary"
                className="flex items-center gap-2 pl-2 pr-1 py-1"
              >
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs max-w-32 truncate">{sector.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeSector(sector.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}