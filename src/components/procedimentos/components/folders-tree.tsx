'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, ChevronDown, Folder, Plus, Edit, Trash2, Move, Ban } from 'lucide-react'
import { buildFolderTree, FolderNode, getDocumentsInFolder } from '../utils/folder-structure'
import { Document } from '@/types/document'
import { 
  canEditFolderNode, 
  canDeleteFolderNode, 
  canRenameFolderNode, 
  canCreateSubfolderInNode,
  canMoveFolderNode
} from '../utils/folder-permissions'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

interface FoldersTreeProps {
  allDocuments: Document[]
  selectedFolderPath: string | null
  selectedFolderType: string | null
  onSelectFolder: (folderPath: string | null, type?: string) => void
  onCreateFolder?: (parentPath: string) => void
  onRenameFolder?: (folderPath: string, folderName: string) => void
  onDeleteFolder?: (folderPath: string, folderName: string, documentCount: number) => void
  onMoveFolder?: (folderPath: string, folderName: string) => void
  emptyCreatedFolders?: Set<string>
  draggingItem?: { type: 'document' | 'folder', id?: string, path?: string, name?: string } | null
  dragOverFolder?: string | null
  setDragOverFolder?: (path: string | null) => void
  onDropOnFolder?: (targetPath: string) => void
}

export function FoldersTree({ 
  allDocuments, 
  selectedFolderPath, 
  selectedFolderType, 
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveFolder,
  emptyCreatedFolders = new Set(),
  draggingItem = null,
  dragOverFolder = null,
  setDragOverFolder,
  onDropOnFolder
}: FoldersTreeProps) {
  // Construir árvore dinâmica baseada nos documentos
  const folderHierarchy = useMemo(() => {
    const tree = buildFolderTree(allDocuments)
    
    // Adicionar pastas criadas vazias à árvore
    const addEmptyFolders = (nodes: FolderNode[], parentPath: string = 'Root'): FolderNode[] => {
      return nodes.map(node => {
        const nodePath = node.path || ''
        const children = node.children ? addEmptyFolders(node.children, nodePath) : []
        
        // Verificar se há pastas vazias criadas dentro desta pasta
        const emptyFoldersInThisPath: FolderNode[] = []
        emptyCreatedFolders.forEach(emptyPath => {
          if (emptyPath.startsWith(nodePath + '/') && !emptyPath.substring(nodePath.length + 1).includes('/')) {
            // Esta é uma subpasta direta desta pasta
            const folderName = emptyPath.split('/').pop() || ''
            emptyFoldersInThisPath.push({
              id: emptyPath.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-'),
              name: folderName,
              path: emptyPath,
              children: []
            })
          }
        })
        
        return {
          ...node,
          children: [...children, ...emptyFoldersInThisPath]
        }
      })
    }
    
    return addEmptyFolders(tree)
  }, [allDocuments, emptyCreatedFolders])
  
  // Função auxiliar para coletar todos os IDs de pastas recursivamente
  const collectAllFolderIds = (nodes: FolderNode[]): Set<string> => {
    const expanded = new Set<string>()
    
    const traverse = (node: FolderNode) => {
      expanded.add(node.id)
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => traverse(child))
      }
    }
    
    nodes.forEach(node => traverse(node))
    return expanded
  }
  
  // Expandir automaticamente todas as pastas
  const getInitialExpandedFolders = () => {
    return collectAllFolderIds(folderHierarchy)
  }
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(getInitialExpandedFolders())
  
  // Atualizar pastas expandidas quando a árvore mudar para manter todas expandidas
  useEffect(() => {
    if (folderHierarchy && folderHierarchy.length > 0) {
      setExpandedFolders(collectAllFolderIds(folderHierarchy))
    }
  }, [folderHierarchy])

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const renderFolder = (node: FolderNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    // Se tem type, verificar se o type está selecionado; se não, verificar o path
    const isSelected = node.type 
      ? selectedFolderType === node.type
      : selectedFolderPath === node.path
    
    // Contar documentos nesta pasta
    const documentCount = node.documentCount || 0
    // Mostrar contagem se tiver documentos OU se for uma pasta sem filhos (pasta final)
    const showCount = documentCount > 0 || (!hasChildren && node.path)
    
    // Verificar permissões
    const canEdit = canEditFolderNode(node)
    const canDelete = canDeleteFolderNode(node)
    const canRename = canRenameFolderNode(node)
    const canCreate = canCreateSubfolderInNode(node)
    const canMove = canMoveFolderNode(node)
    // Mostrar menu de contexto se puder criar, renomear, mover ou excluir (mesmo que não possa editar)
    const showContextMenu = canCreate || canRename || canMove || canDelete
    
    const isRoot = node.path === 'Root'
    const isDragOver = dragOverFolder === node.path
    const canDrop = draggingItem && !isRoot && node.path && 
      (draggingItem.type === 'folder' ? draggingItem.path !== node.path && !node.path.startsWith(draggingItem.path + '/') : true)
    
    const folderContent = (
      <div
        className={`folder-tree-item flex items-center gap-1.5 px-2 py-1.5 text-sm transition-colors ${
          isSelected 
            ? 'bg-gray-100 dark:bg-gray-800 font-medium' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
        } ${(node.type || node.path) ? 'cursor-pointer' : ''} ${
          isDragOver && canDrop ? 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-900 dark:border-gray-600' : ''
        } ${isRoot && draggingItem ? 'opacity-50' : ''}`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        data-folder-path={node.path || ''}
        onClick={(e) => {
          // Se está arrastando, não fazer nada no clique - apenas no mouseup
          if (draggingItem) {
            return
          }
          if (node.type || node.path) {
            // Quando clicar em um tipo de documento, passar apenas o type (não o path)
            // Isso garante que todos os documentos desse tipo sejam mostrados
            if (node.type) {
              onSelectFolder(null, node.type)
            } else {
              onSelectFolder(node.path, undefined)
            }
          }
        }}
        onMouseEnter={() => {
          if (draggingItem && node.path && !isRoot && setDragOverFolder) {
            setDragOverFolder(node.path)
          }
        }}
        onMouseLeave={() => {
          if (setDragOverFolder && dragOverFolder === node.path) {
            setDragOverFolder(null)
          }
        }}
        onDragOver={(e) => {
          if (draggingItem && node.path && !isRoot) {
            e.preventDefault()
            e.stopPropagation()
            if (setDragOverFolder) {
              setDragOverFolder(node.path)
            }
          }
        }}
        onDragLeave={(e) => {
          if (setDragOverFolder && dragOverFolder === node.path) {
            setDragOverFolder(null)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (onDropOnFolder && node.path && !isRoot && canDrop) {
            onDropOnFolder(node.path)
          }
          if (setDragOverFolder) {
            setDragOverFolder(null)
          }
        }}
      >
          {hasChildren ? (
            <button
              className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(node.id)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4 flex-shrink-0" />
          )}
          {isRoot && draggingItem ? (
            <Ban className="w-4 h-4 flex-shrink-0 text-red-500" />
          ) : (
            <Folder className={`w-4 h-4 flex-shrink-0 text-gray-600 dark:text-gray-400`} />
          )}
          <span className={`flex-1 truncate text-gray-900 dark:text-gray-100 ${isSelected ? 'font-semibold' : ''} ${isRoot && draggingItem ? 'text-red-500' : ''}`}>
            {node.name}
          </span>
          {showCount && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {documentCount}
            </span>
          )}
        </div>
    )
    
    return (
      <div key={node.id}>
        {showContextMenu ? (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              {folderContent}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              {canCreate && onCreateFolder && (
                <ContextMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    if (node.path) {
                      onCreateFolder(node.path)
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Subpasta
                </ContextMenuItem>
              )}
              {canRename && onRenameFolder && (
                <>
                  {canCreate && <ContextMenuSeparator />}
                  <ContextMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      if (node.path && node.name) {
                        onRenameFolder(node.path, node.name)
                      }
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Renomear
                  </ContextMenuItem>
                </>
              )}
              {canMove && onMoveFolder && node.path && node.name && (
                <>
                  {(canCreate || canRename) && <ContextMenuSeparator />}
                  <ContextMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onMoveFolder(node.path!, node.name)
                    }}
                  >
                    <Move className="h-4 w-4 mr-2" />
                    Mover (Arrastar)
                  </ContextMenuItem>
                </>
              )}
              {canDelete && onDeleteFolder && (
                <>
                  {(canCreate || canRename || canMove) && <ContextMenuSeparator />}
                  <ContextMenuItem
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (node.path && node.name) {
                        onDeleteFolder(node.path, node.name, documentCount)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        ) : (
          folderContent
        )}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-56 flex-shrink-0 bg-white dark:bg-[#171717] border-r border-gray-200 dark:border-gray-600 flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Documentos</h3>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        {folderHierarchy.map(node => renderFolder(node))}
      </div>

    </div>
  )
}

