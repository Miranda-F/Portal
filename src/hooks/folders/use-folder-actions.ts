import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface FolderActionData {
  parentPath?: string
  folderPath?: string
  folderName?: string
  documentCount?: number
}

export function useFolderActions(
  selectedFolderPath: string | null,
  setSelectedFolderPath: (path: string | null) => void,
  setSelectedFolderType: (type: string | null) => void,
  emptyCreatedFolders: Set<string>,
  setEmptyCreatedFolders: (updater: (prev: Set<string>) => Set<string>) => void
) {
  const { toast } = useToast()
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false)
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false)
  const [isFolderActionLoading, setIsFolderActionLoading] = useState(false)
  const [folderActionData, setFolderActionData] = useState<FolderActionData>({})

  const handleCreateFolder = (parentPath: string) => {
    setFolderActionData({ parentPath })
    setIsCreateFolderModalOpen(true)
  }

  const handleConfirmCreateFolder = async (folderName: string) => {
    if (!folderActionData.parentPath) return

    setIsFolderActionLoading(true)
    try {
      const response = await fetch('/api/admin/folders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentPath: folderActionData.parentPath,
          folderName
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar pasta')
      }

      const data = await response.json()
      const newPath = data.newPath || `${folderActionData.parentPath}/${folderName.trim()}`
      
      setEmptyCreatedFolders(prev => new Set(prev).add(newPath))
      
      toast({
        title: "Sucesso",
        description: "Pasta criada com sucesso.",
      })

      setIsCreateFolderModalOpen(false)
      setFolderActionData({})
    } catch (error) {
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao criar pasta. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsFolderActionLoading(false)
    }
  }

  const handleRenameFolder = (folderPath: string, folderName: string) => {
    setFolderActionData({ folderPath, folderName })
    setIsRenameFolderModalOpen(true)
  }

  const handleConfirmRenameFolder = async (newName: string) => {
    if (!folderActionData.folderPath) return

    setIsFolderActionLoading(true)
    try {
      const response = await fetch('/api/admin/folders/rename', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath: folderActionData.folderPath,
          newName
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao renomear pasta')
      }

      const data = await response.json()
      toast({
        title: "Sucesso",
        description: `Pasta renomeada com sucesso. ${data.updatedCount || 0} documento(s) atualizado(s).`,
      })

      setIsRenameFolderModalOpen(false)
      setFolderActionData({})
      
      if (folderActionData.folderPath) {
        const newPath = folderActionData.folderPath.split('/').slice(0, -1).join('/') + '/' + newName.trim()
        setEmptyCreatedFolders(prev => {
          const updated = new Set(prev)
          if (updated.has(folderActionData.folderPath!)) {
            updated.delete(folderActionData.folderPath!)
            updated.add(newPath)
          }
          return updated
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao renomear pasta. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsFolderActionLoading(false)
    }
  }

  const handleDeleteFolder = (folderPath: string, folderName: string, documentCount: number) => {
    setFolderActionData({ folderPath, folderName, documentCount })
    setIsDeleteFolderModalOpen(true)
  }

  const handleConfirmDeleteFolder = async () => {
    if (!folderActionData.folderPath) return

    setIsFolderActionLoading(true)
    try {
      const response = await fetch(`/api/admin/folders/delete?path=${encodeURIComponent(folderActionData.folderPath)}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir pasta')
      }

      const data = await response.json()
      toast({
        title: "Sucesso",
        description: `Pasta excluída com sucesso. ${data.updatedCount || 0} documento(s) movido(s).`,
      })

      setIsDeleteFolderModalOpen(false)
      setFolderActionData({})
      
      if (selectedFolderPath === folderActionData.folderPath) {
        setSelectedFolderPath(null)
        setSelectedFolderType(null)
      }
      
      if (folderActionData.folderPath) {
        setEmptyCreatedFolders(prev => {
          const updated = new Set(prev)
          updated.delete(folderActionData.folderPath!)
          Array.from(prev).forEach(path => {
            if (path.startsWith(folderActionData.folderPath! + '/')) {
              updated.delete(path)
            }
          })
          return updated
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao excluir pasta. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsFolderActionLoading(false)
    }
  }

  return {
    isCreateFolderModalOpen,
    isRenameFolderModalOpen,
    isDeleteFolderModalOpen,
    isFolderActionLoading,
    folderActionData,
    setIsCreateFolderModalOpen,
    setIsRenameFolderModalOpen,
    setIsDeleteFolderModalOpen,
    setFolderActionData,
    handleCreateFolder,
    handleConfirmCreateFolder,
    handleRenameFolder,
    handleConfirmRenameFolder,
    handleDeleteFolder,
    handleConfirmDeleteFolder,
  }
}

