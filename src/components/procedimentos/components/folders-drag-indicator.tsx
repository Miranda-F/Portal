'use client'

import { Move, FileText, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DraggingItem {
  type: 'document' | 'folder'
  name?: string
}

interface FoldersDragIndicatorProps {
  draggingItem: DraggingItem | null
  dragIconPosition: { x: number; y: number } | null
  onCancel: () => void
}

export function FoldersDragIndicator({
  draggingItem,
  dragIconPosition,
  onCancel
}: FoldersDragIndicatorProps) {
  if (!draggingItem) return null

  return (
    <>
      <div className="fixed top-4 right-4 z-50 bg-black dark:bg-black text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <Move className="h-4 w-4 animate-pulse" />
        <span>Arraste "{draggingItem.name}" para a pasta desejada</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-white hover:bg-gray-900 dark:hover:bg-gray-900"
          onClick={onCancel}
        >
          ×
        </Button>
      </div>
      
      {dragIconPosition && (
        <div
          className="fixed z-[60] cursor-grabbing select-none pointer-events-none"
          style={{
            left: `${dragIconPosition.x}px`,
            top: `${dragIconPosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="bg-black dark:bg-black text-white p-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[200px] border-2 border-black dark:border-black">
            {draggingItem.type === 'document' ? (
              <FileText className="h-8 w-8 flex-shrink-0" />
            ) : (
              <Folder className="h-8 w-8 flex-shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-sm truncate max-w-[150px]">
                {draggingItem.name}
              </span>
              <span className="text-xs opacity-90">
                {draggingItem.type === 'document' ? 'Documento' : 'Pasta'}
              </span>
            </div>
            <Move className="h-5 w-5 flex-shrink-0 animate-pulse" />
          </div>
        </div>
      )}
    </>
  )
}

