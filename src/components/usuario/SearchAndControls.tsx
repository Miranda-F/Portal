"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, List, Grid3X3 } from "lucide-react"

interface SearchAndControlsProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  viewMode: "cards" | "list"
  onViewModeChange: (mode: "cards" | "list") => void
}

export function SearchAndControls({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange
}: SearchAndControlsProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar procedimentos, vagas ou eventos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("cards")}
            className="flex items-center gap-1"
          >
            <Grid3X3 className="h-4 w-4" />
            <span>Cards</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="flex items-center gap-1"
          >
            <List className="h-4 w-4" />
            <span>Lista</span>
          </Button>
        </div>
      </div>
    </div>
  )
}