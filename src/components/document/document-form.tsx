'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUp, X, Folder } from "lucide-react"
import { DocumentFormData, Sector } from '@/types/document'
import { documentTypes, statusOptions } from '@/constants/document'

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

  // Se está editando e status for inativo, mostra campo de classificação
  const showClassificationField = isEditing && formData.status === 'inactive'

  return (
    <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={isEditing ? "edit-code" : "code"}>Código *</Label>
          <Input
            id={isEditing ? "edit-code" : "code"}
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="Ex: PGQ-001"
            style={{ textTransform: 'uppercase' }}
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
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label>Versão</Label>
              <Input
                value={formData.version || '1.0'}
                disabled
                className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                A versão é calculada automaticamente baseada no histórico de alterações.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Data de Criação</Label>
              <Input
                type="date"
                value={formData.issueDate}
                disabled
                className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                A data de criação não pode ser alterada.
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="version">Versão *</Label>
            <Input
              id="version"
              value={formData.version || '1.0'}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="1.0"
            />
            <p className="text-xs text-muted-foreground">
              Versão inicial do documento. Será calculada automaticamente após a criação.
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEditing ? "edit-nextReviewDate" : "nextReviewDate"}>Data de Vencimento/Revisão *</Label>
        <Input
          id={isEditing ? "edit-nextReviewDate" : "nextReviewDate"}
          type="date"
          value={formData.nextReviewDate || ''}
          onChange={(e) => setFormData({ ...formData, nextReviewDate: e.target.value })}
          min={isEditing ? formData.issueDate : new Date().toISOString().split('T')[0]}
          disabled={isEditing}
          className={isEditing ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : undefined}
        />
        <p className="text-xs text-muted-foreground">
          {isEditing 
            ? 'O vencimento não pode ser alterado na edição. Use "Reaprazar Vencimento" no detalhe do documento.'
            : 'Se não informada, será calculada automaticamente como 30 dias após a data de criação (hoje).'}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={isEditing ? "edit-type" : "type"}>Tipo *</Label>
          <Select 
            value={formData.type || ''} 
            onValueChange={(value) => {
              const newType = value as DocumentFormData['type']
              // Mapear tipo para folderPath automaticamente
              const typeToFolderPath: Record<string, string | undefined> = {
                'form': 'Root/Gestão da Qualidade/Formulários',
                'instruction': 'Root/Gestão da Qualidade/Instrução Técnica',
                'procedure': 'Root/Gestão da Qualidade/Procedimentos',
                'policy': 'Root/Políticas',
                'manual': 'Root/Manuais',
                'record': 'Root/Registros',
                'other': undefined // Não preencher automaticamente para 'other'
              }
              // Preencher folderPath automaticamente quando o tipo mudar
              // Se não estiver editando, sempre preencher automaticamente
              // Se estiver editando, só preencher se folderPath estiver vazio
              if (!isEditing) {
                // Sempre preencher automaticamente na criação
                const folderPath = typeToFolderPath[newType]
                setFormData({ ...formData, type: newType, folderPath: folderPath ?? undefined })
              } else {
                // Na edição, só atualizar se folderPath estiver vazio
                if (!formData.folderPath && typeToFolderPath[newType]) {
                  setFormData({ ...formData, type: newType, folderPath: typeToFolderPath[newType] })
                } else {
                  setFormData({ ...formData, type: newType })
                }
              }
            }}
            disabled={showClassificationField}
          >
            <SelectTrigger>
              <SelectValue placeholder="--- Selecione o tipo ---" />
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
      
      {isEditing && (
        <div className="space-y-2">
          <Label htmlFor="edit-status">Status *</Label>
          <Select 
            value={formData.status || 'active'} 
              onValueChange={(value) => {
                const newStatus = value as DocumentFormData['status']
                setFormData({ 
                  ...formData, 
                  status: newStatus,
                  // Se mudou para inativo, já define o tipo como "other" e a classificação
                  // Se mudou de inativo para outro status, mantém o tipo atual
                  type: newStatus === 'inactive' ? 'other' : formData.type,
                  classification: newStatus === 'inactive' ? (formData.classification || 'other') : formData.classification
                })
              }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {showClassificationField && (
        <div className="space-y-2">
          <Label htmlFor="edit-classification">Classificação *</Label>
          <Select 
            value={formData.classification || 'other'} 
            onValueChange={(value) => setFormData({ ...formData, classification: value, type: 'other' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a classificação" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Ao definir status como inativo, o documento será movido para a classificação "Outro".
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor={isEditing ? "edit-description" : "description"}>Descrição</Label>
        <Textarea
          id={isEditing ? "edit-description" : "description"}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição do documento"
          rows={3}
          className="resize-none"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEditing ? "edit-folderPath" : "folderPath"}>Pasta *</Label>
        <Select 
          value={formData.folderPath || ''} 
          onValueChange={(value) => setFormData({ ...formData, folderPath: value || undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="--- Selecione uma pasta ---" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Root/Gestão da Qualidade/Formulários">
              <Folder className="w-4 h-4" />
              Formulários
            </SelectItem>
            <SelectItem value="Root/Gestão da Qualidade/Instrução Técnica">
              <Folder className="w-4 h-4" />
              Instrução Técnica
            </SelectItem>
            <SelectItem value="Root/Gestão da Qualidade/Procedimentos">
              <Folder className="w-4 h-4" />
              Procedimentos
            </SelectItem>
            <SelectItem value="Root/Políticas">
              <Folder className="w-4 h-4" />
              Políticas
            </SelectItem>
            <SelectItem value="Root/Manuais">
              <Folder className="w-4 h-4" />
              Manuais
            </SelectItem>
            <SelectItem value="Root/Registros">
              <Folder className="w-4 h-4" />
              Registros
            </SelectItem>
            <SelectItem value="Root/Gestão da Qualidade/Modelo de Doc">
              <Folder className="w-4 h-4" />
              Modelo de Doc
            </SelectItem>
            <SelectItem value="Root/Gestão da Qualidade/Normas">
              <Folder className="w-4 h-4" />
              Normas
            </SelectItem>
            <SelectItem value="Root/Gestão da Qualidade/Treinamento">
              <Folder className="w-4 h-4" />
              Treinamento
            </SelectItem>
            <SelectItem value="Root/Gestão da Qualidade/Meio Ambiente">
              <Folder className="w-4 h-4" />
              Meio Ambiente
            </SelectItem>
            <SelectItem value="Root/Gestão da Qualidade/Produção">
              <Folder className="w-4 h-4" />
              Produção
            </SelectItem>
            <SelectItem value="Root/Gestão da Qualidade/Recursos Humanos">
              <Folder className="w-4 h-4" />
              Recursos Humanos
            </SelectItem>
            <SelectItem value="Root/Gestão da Qualidade/Segurança do Trabalho">
              <Folder className="w-4 h-4" />
              Segurança do Trabalho
            </SelectItem>
            <SelectItem value="Root/Gestão da Qualidade/SGI">
              <Folder className="w-4 h-4" />
              SGI
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          A pasta será preenchida automaticamente quando você selecionar o tipo. Campo obrigatório.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEditing ? "edit-file" : "file"}>Anexar Documento</Label>
        <div className="flex items-center space-x-2">
          <Input
            id={isEditing ? "edit-file" : "file"}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx"
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
          Formatos aceitos: PDF e DOCX. Tamanho máximo: 10MB
        </p>
      </div>
    </div>
  )
}