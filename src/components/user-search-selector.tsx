"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, UserPlus, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface User {
  id: string
  name: string
  email: string
  photoUrl?: string | null
  sector?: {
    id: string
    name: string
  }
}

interface UserSearchSelectorProps {
  selectedUsers: User[]
  onUsersChange: (users: User[]) => void
  placeholder?: string
  disabled?: boolean
}

export function UserSearchSelector({ 
  selectedUsers, 
  onUsersChange, 
  placeholder = "Buscar usuários...",
  disabled = false 
}: UserSearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Função para buscar usuários
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}&status=active`)
      if (response.ok) {
        const users = await response.json()
        // Filtrar usuários já selecionados
        const filteredUsers = users.filter((user: User) => 
          !selectedUsers.some(selected => selected.id === user.id)
        )
        setSearchResults(filteredUsers)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchUsers(searchTerm)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedUsers])

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

  const addUser = (user: User) => {
    onUsersChange([...selectedUsers, user])
    setSearchTerm("")
    setSearchResults([])
    setShowResults(false)
  }

  const removeUser = (userId: string) => {
    onUsersChange(selectedUsers.filter(user => user.id !== userId))
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
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
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => addUser(user)}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {user.photoUrl ? (
                          <AvatarImage src={user.photoUrl} alt={user.name} />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        {user.sector && (
                          <p className="text-xs text-muted-foreground">{user.sector.name}</p>
                        )}
                      </div>
                      <UserPlus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum usuário encontrado</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Usuários selecionados */}
      {selectedUsers.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <Badge
                key={user.id}
                variant="secondary"
                className="flex items-center gap-2 pl-2 pr-1 py-1"
              >
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    {user.photoUrl ? (
                      <AvatarImage src={user.photoUrl} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="text-[8px]">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs max-w-32 truncate">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeUser(user.id)}
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