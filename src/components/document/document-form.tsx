'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUp, X } from "lucide-react"
import { DocumentFormData, Sector } from '@/types/document'
import { documentTypes } from '@/constants/document'

interface DocumentFormProps {
  formData: DocumentFormData
  setFormData: (data: DocumentFormData) => void
  sectors: Sector[]
  isEditing?: boolean
}

export function DocumentForm({ formData, setFormData, sectors, isEditing = false }: DocumentFormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({ ...formData, file })
  }

  const removeFile = () => {
    setFormData({ ...formData, file: null })
  }

  return (
    <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={isEditing ? "edit-code" : "code"}>Código *</Label>
          <Input
            id={isEditing ? "edit-code" : "code"}
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Ex: PGQ-001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={isEditing ? "edit-title" : "title"}>Título *</Label>
          <Input
            id={isEditing ? "edit-title" : "title"}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título do documento"
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={isEditing ? "edit-version" : "version"}>Versão *</Label>
          <Input
            id={isEditing ? "edit-version" : "version"}
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            placeholder="1.0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={isEditing ? "edit-issueDate" : "issueDate"}>Data de Criação *</Label>
          <Input
            id={isEditing ? "edit-issueDate" : "issueDate"}
            type="date"
            value={formData.issueDate}
            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={isEditing ? "edit-type" : "type"}>Tipo *</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({ ...formData, type: value as DocumentFormData['type'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={isEditing ? "edit-responsibleSector" : "responsibleSector"}>Setor *</Label>
          <Select 
            value={formData.responsibleSector} 
            onValueChange={(value) => setFormData({ ...formData, responsibleSector: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              {sectors.filter(sector => sector.active).map(sector => (
                <SelectItem key={sector.id} value={sector.name}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEditing ? "edit-description" : "description"}>Descrição</Label>
        <Textarea
          id={isEditing ? "edit-description" : "description"}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição do documento"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEditing ? "edit-file" : "file"}>Anexar Documento</Label>
        <div className="flex items-center space-x-2">
          <Input
            id={isEditing ? "edit-file" : "file"}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(isEditing ? "edit-file" : "file")?.click()}
            className="flex items-center space-x-2"
          >
            <FileUp className="h-4 w-4" />
            <span>Selecionar Arquivo</span>
          </Button>
          {formData.file && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT. Tamanho máximo: 10MB
        </p>
      </div>
    </div>
  )
}