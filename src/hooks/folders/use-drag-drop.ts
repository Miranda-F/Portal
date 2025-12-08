import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Document } from '@/types/document'

interface DraggingItem {
  type: 'document' | 'folder'
  id?: string
  path?: string
  name?: string
}

export function useDragDrop(
  selectedFolderPath: string | null,
  setSelectedFolderPath: (path: string | null) => void,
  setSelectedFolderType: (type: string | null) => void,
  emptyCreatedFolders: Set<string>,
  setEmptyCreatedFolders: (updater: (prev: Set<string>) => Set<string>) => void,
  onRefreshDocuments?: () => void
) {
  const { toast } = useToast()
  const [draggingItem, setDraggingItem] = useState<DraggingItem | null>(null)
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [dragIconPosition, setDragIconPosition] = useState<{ x: number; y: number } | null>(null)
  const [isFolderActionLoading, setIsFolderActionLoading] = useState(false)

  const handleMoveFolder = (folderPath: string, folderName: string, initialPosition?: { x: number, y: number }) => {
    setDraggingItem({ type: 'folder', path: folderPath, name: folderName })
    setDragIconPosition(initialPosition || { x: window.innerWidth / 2, y: window.innerHeight / 2 })
    if (!initialPosition) {
      toast({
        title: "Modo de Arrastar Ativado",
        description: "Arraste a pasta para a pasta desejada. Clique em qualquer lugar para cancelar.",
      })
    }
  }

  const handleMoveDocument = (document: Document) => {
    setDraggingItem({
      type: 'document',
      id: document.id,
      path: document.folderPath || 'Root',
      name: document.title
    })
    setDragIconPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  }

  useEffect(() => {
    if (!draggingItem || !dragIconPosition) return

    const handleMouseMove = (e: MouseEvent) => {
      setDragIconPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [draggingItem, dragIconPosition])

  const handleDropOnFolder = async (targetPath: string) => {
    if (!draggingItem) return

    // Allow dropping on Root
    // if (targetPath === 'Root') { ... } - Removed check

    setIsFolderActionLoading(true)
    try {
      if (draggingItem.type === 'folder') {
        if (!draggingItem.path) return

        if (targetPath.startsWith(draggingItem.path + '/')) {
          toast({
            title: "Erro",
            description: "Não é possível mover uma pasta para dentro de si mesma.",
            variant: "destructive"
          })
          setDraggingItem(null)
          setDragOverFolder(null)
          setDragIconPosition(null)
          setIsFolderActionLoading(false)
          return
        }

        const response = await fetch('/api/admin/folders/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldPath: draggingItem.path,
            newPath: targetPath
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao mover pasta')
        }

        const data = await response.json()
        toast({
          title: "Sucesso",
          description: `Pasta movida com sucesso. ${data.updatedCount || 0} documento(s) atualizado(s).`,
        })

        if (draggingItem.path) {
          const newFullPath = targetPath + '/' + draggingItem.name
          setEmptyCreatedFolders(prev => {
            const updated = new Set(prev)
            if (updated.has(draggingItem.path!)) {
              updated.delete(draggingItem.path!)
              updated.add(newFullPath)
            }
            Array.from(prev).forEach(path => {
              if (path.startsWith(draggingItem.path! + '/')) {
                updated.delete(path)
                const relativePath = path.substring(draggingItem.path!.length + 1)
                updated.add(newFullPath + '/' + relativePath)
              }
            })
            return updated
          })
        }

        if (selectedFolderPath === draggingItem.path) {
          setSelectedFolderPath(null)
          setSelectedFolderType(null)
        }
      } else if (draggingItem.type === 'document') {
        if (!draggingItem.id) return

        const response = await fetch(`/api/admin/procedures/${draggingItem.id}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folderPath: targetPath
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao mover documento')
        }

        toast({
          title: "Sucesso",
          description: "Documento movido com sucesso.",
        })

        if (onRefreshDocuments) {
          onRefreshDocuments()
        }
      }

      setDraggingItem(null)
      setDragOverFolder(null)
      setDragIconPosition(null)
    } catch (error) {
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao mover. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsFolderActionLoading(false)
    }
  }

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (!draggingItem) return

      const target = e.target as HTMLElement
      const folderItem = target.closest('.folder-tree-item')

      if (folderItem) {
        const folderPath = folderItem.getAttribute('data-folder-path')
        if (folderPath && folderPath !== 'Root') {
          const canDrop = draggingItem.type === 'folder'
            ? draggingItem.path !== folderPath && !folderPath.startsWith(draggingItem.path + '/')
            : true

          if (canDrop) {
            handleDropOnFolder(folderPath)
          }
        }
      } else {
        setDraggingItem(null)
        setDragOverFolder(null)
        setDragIconPosition(null)
      }
    }

    if (draggingItem) {
      document.addEventListener('mouseup', handleMouseUp)
      return () => document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingItem, handleDropOnFolder])

  return {
    draggingItem,
    dragOverFolder,
    dragIconPosition,
    isFolderActionLoading,
    setDragOverFolder,
    setDraggingItem,
    setDragIconPosition,
    handleMoveFolder,
    handleMoveDocument,
    handleDropOnFolder,
  }
}

