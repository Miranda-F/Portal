"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Users, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Group {
  id: string
  name: string
  description?: string
  active: boolean
  _count: {
    users: number
    publications: number
  }
}

interface GroupSearchSelectorProps {
  selectedGroups: Group[]
  onGroupsChange: (groups: Group[]) => void
  placeholder?: string
  disabled?: boolean
}

export function GroupSearchSelector({
  selectedGroups,
  onGroupsChange,
  placeholder = "Buscar grupos...",
  disabled = false,
}: GroupSearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()

  // Função para buscar grupos com debounce
  const searchGroups = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        search: term,
        active: "true",
      })

      const response = await fetch(`/api/admin/groups?${params}`)
      if (response.ok) {
        const groups = await response.json()
        // Filtrar grupos já selecionados
        const filteredGroups = groups.filter(
          (group: Group) => !selectedGroups.some(selected => selected.id === group.id)
        )
        setSearchResults(filteredGroups)
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível buscar grupos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao buscar grupos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível buscar grupos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [selectedGroups, toast])

  // Efeito para debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchGroups(searchTerm)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchGroups])

  const handleAddGroup = (group: Group) => {
    onGroupsChange([...selectedGroups, group])
    setSearchTerm("")
    setSearchResults([])
    setShowResults(false)
  }

  const handleRemoveGroup = (groupId: string) => {
    onGroupsChange(selectedGroups.filter(group => group.id !== groupId))
  }

  return (
    <div className="space-y-3">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
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
      </div>

      {/* Resultados da busca */}
      {showResults && (searchTerm || searchResults.length > 0) && (
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Buscando grupos...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm ? "Nenhum grupo encontrado" : "Digite para buscar grupos"}
                </div>
              ) : (
                <div className="divide-y">
                  {searchResults.map((group) => (
                    <div
                      key={group.id}
                      className="p-3 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleAddGroup(group)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{group.name}</p>
                            {group.description && (
                              <p className="text-sm text-muted-foreground">
                                {group.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {group._count.users} membros
                          </Badge>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grupos selecionados */}
      {selectedGroups.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Grupos selecionados ({selectedGroups.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedGroups.map((group) => (
              <Badge
                key={group.id}
                variant="secondary"
                className="flex items-center space-x-2 px-3 py-1"
              >
                <Users className="h-3 w-3" />
                <span>{group.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveGroup(group.id)}
                  className="ml-1 hover:text-destructive transition-colors"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}