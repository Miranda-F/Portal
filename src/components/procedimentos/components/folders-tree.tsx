'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, ChevronDown, Folder, Plus, Edit, Trash2, Move, Ban, Users } from 'lucide-react'
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
  onManagePermissions?: (folderPath: string, folderName: string) => void
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
  onDropOnFolder,
  onManagePermissions
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

  // Estado para detectar "Hold to Drag"
  const [mouseDownInfo, setMouseDownInfo] = useState<{ id: string, x: number, y: number, path: string, name: string } | null>(null)

  // Atualizar pastas expandidas quando a árvore mudar para manter todas expandidas
  useEffect(() => {
    if (folderHierarchy && folderHierarchy.length > 0) {
      setExpandedFolders(collectAllFolderIds(folderHierarchy))
    }
  }, [folderHierarchy])

  // Limpar estado de mouse down se soltar o mouse em qualquer lugar
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setMouseDownInfo(null)
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  // Detectar movimento do mouse para iniciar drag
  useEffect(() => {
    if (!mouseDownInfo) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggingItem) return // Já está arrastando

      const dx = e.clientX - mouseDownInfo.x
      const dy = e.clientY - mouseDownInfo.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Se moveu mais de 5 pixels, iniciar drag
      if (distance > 5 && onMoveFolder) {
        // @ts-ignore - onMoveFolder agora aceita 3 argumentos
        onMoveFolder(mouseDownInfo.path, mouseDownInfo.name, { x: e.clientX, y: e.clientY })
        setMouseDownInfo(null) // Resetar para não chamar novamente
      }
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove)
  }, [mouseDownInfo, draggingItem, onMoveFolder])

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

    // Mostrar menu de contexto se puder criar, renomear, mover, excluir ou gerenciar permissões
    // Assumimos que sempre pode gerenciar permissões se onManagePermissions for fornecido (a validação real pode ser no backend ou modal)
    // Mas talvez queiramos esconder para algumas pastas específicas? Por enquanto, liberar para todas onde o path existe.
    const showContextMenu = canCreate || canRename || canMove || canDelete || (!!onManagePermissions && !!node.path)

    const isRoot = node.path === 'Root'
    const isDragOver = dragOverFolder === node.path
    const canDrop = draggingItem && !isRoot && node.path &&
      (draggingItem.type === 'folder' ? draggingItem.path !== node.path && !node.path.startsWith(draggingItem.path + '/') : true)

    const folderContent = (
      <div
        className={`folder-tree-item flex items-center gap-1.5 px-2 py-1.5 text-sm transition-all duration-200 rounded-md ${isSelected
          ? 'bg-gray-100 dark:bg-gray-800 font-medium'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          } ${(node.type || node.path) ? 'cursor-pointer' : ''} ${isDragOver && canDrop ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500 dark:border-indigo-400 shadow-sm scale-[1.02]' : 'border-2 border-transparent'
          } ${isRoot && draggingItem ? 'opacity-50' : ''}`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        data-folder-path={node.path || ''}
        onMouseDown={(e) => {
          // Apenas botão esquerdo
          if (e.button !== 0) return

          // Se pode mover, preparar para drag
          if (canMove && node.path && node.name) {
            setMouseDownInfo({
              id: node.id,
              x: e.clientX,
              y: e.clientY,
              path: node.path,
              name: node.name
            })
          }
        }}
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
              {!!onManagePermissions && !!node.path && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onManagePermissions(node.path!, node.name)
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Controle de Acesso
                  </ContextMenuItem>
                </>
              )}
              {canDelete && onDeleteFolder && (
                <>
                  {(canCreate || canRename || canMove || (!!onManagePermissions && !!node.path)) && <ContextMenuSeparator />}
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

  const isRootDragOver = dragOverFolder === 'Root'

  return (
    <div className="flex flex-col h-full">
      {/* Tree View */}
      <div
        className={`flex-1 p-2 min-h-0 transition-colors ${isRootDragOver ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg' : ''}`}
        onMouseEnter={() => {
          if (draggingItem && setDragOverFolder) {
            setDragOverFolder('Root')
          }
        }}
        onMouseLeave={() => {
          if (setDragOverFolder && dragOverFolder === 'Root') {
            setDragOverFolder(null)
          }
        }}
        onMouseUp={(e) => {
          if (draggingItem && onDropOnFolder && dragOverFolder === 'Root') {
            onDropOnFolder('Root')
            if (setDragOverFolder) setDragOverFolder(null)
          }
        }}
      >
        {folderHierarchy.map(node => renderFolder(node))}

        {/* Empty state / Drop zone hint */}
        {draggingItem && (
          <div className="mt-4 p-4 text-center text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            Solte aqui para mover para a Raiz
          </div>
        )}
      </div>
    </div>
  )
}
