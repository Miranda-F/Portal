"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react"

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedImage: string) => void
  onCancel: () => void
  aspect?: number
  circular?: boolean
}

export function ImageCropper({ 
  imageSrc, 
  onCropComplete, 
  onCancel, 
  aspect = 1, 
  circular = false 
}: ImageCropperProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // Limitar o movimento para não sair dos limites
    const container = containerRef.current
    const img = imageRef.current
    if (!container || !img) return

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const imgWidth = img.naturalWidth * scale
    const imgHeight = img.naturalHeight * scale

    // Calcular limites - permitir que a imagem se mova livremente dentro do container
    const maxX = Math.max(0, imgWidth - containerWidth)
    const minX = Math.min(0, -(imgWidth - containerWidth))
    const maxY = Math.max(0, imgHeight - containerHeight)
    const minY = Math.min(0, -(imgHeight - containerHeight))

    setPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomChange = (value: number[]) => {
    const newScale = value[0]
    setScale(newScale)
  }

  const resetPosition = () => {
    const container = containerRef.current
    const img = imageRef.current
    if (!container || !img) return

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const imgWidth = img.naturalWidth
    const imgHeight = img.naturalHeight
    
    // Calcular escala para caber no container
    const scaleX = containerWidth / imgWidth
    const scaleY = containerHeight / imgHeight
    const fitScale = Math.min(scaleX, scaleY, 1)
    
    setScale(fitScale)
    
    // Centralizar imagem
    const scaledWidth = imgWidth * fitScale
    const scaledHeight = imgHeight * fitScale
    setPosition({
      x: (containerWidth - scaledWidth) / 2,
      y: (containerHeight - scaledHeight) / 2
    })
  }

  const applyCrop = () => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = imageRef.current

      if (!ctx || !img) return

      // Tamanho do crop (circular)
      const cropSize = 200

      canvas.width = cropSize
      canvas.height = cropSize

      // Calcular a posição da imagem considerando o zoom e a posição
      const imgWidth = img.naturalWidth * scale
      const imgHeight = img.naturalHeight * scale
      
      // Calcular a área visível da imagem
      const visibleX = -position.x
      const visibleY = -position.y
      
      // Calcular o centro do crop
      const centerX = visibleX + 256 / 2 // 256 é o tamanho do container
      const centerY = visibleY + 256 / 2
      
      // Calcular a origem do crop na imagem original
      const cropX = (centerX - cropSize / 2) / scale
      const cropY = (centerY - cropSize / 2) / scale
      const cropWidth = cropSize / scale
      const cropHeight = cropSize / scale

      // Desenhar a imagem recortada
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropSize, cropSize)

      // Criar máscara circular
      if (circular) {
        const imageData = ctx.getImageData(0, 0, cropSize, cropSize)
        const data = imageData.data
        
        for (let i = 0; i < data.length; i += 4) {
          const x = (i / 4) % cropSize
          const y = Math.floor((i / 4) / cropSize)
          const centerX = cropSize / 2
          const centerY = cropSize / 2
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
          
          if (distance > cropSize / 2) {
            data[i + 3] = 0 // Tornar transparente
          }
        }
        
        ctx.putImageData(imageData, 0, 0)
      }

      const result = canvas.toDataURL('image/jpeg', 0.9)
      console.log('Crop result created, length:', result.length)
      onCropComplete(result)
    } catch (error) {
      console.error('Error applying crop:', error)
    }
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  useEffect(() => {
    const img = imageRef.current
    const container = containerRef.current
    
    if (!img || !container) return

    const handleImageLoad = () => {
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      const imgWidth = img.naturalWidth
      const imgHeight = img.naturalHeight
      
      // Calcular escala para caber no container
      const scaleX = containerWidth / imgWidth
      const scaleY = containerHeight / imgHeight
      const fitScale = Math.min(scaleX, scaleY, 1)
      
      setScale(fitScale)
      
      // Centralizar imagem
      const scaledWidth = imgWidth * fitScale
      const scaledHeight = imgHeight * fitScale
      setPosition({
        x: (containerWidth - scaledWidth) / 2,
        y: (containerHeight - scaledHeight) / 2
      })
    }

    // Adicionar event listener
    img.addEventListener('load', handleImageLoad)
    
    // Se a imagem já estiver carregada
    if (img.complete) {
      handleImageLoad()
    }

    return () => {
      img.removeEventListener('load', handleImageLoad)
    }
  }, [imageSrc])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-background rounded-lg p-4 max-w-md w-full shadow-2xl border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Ajustar Imagem</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onCancel()}
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Área de preview */}
          <div className="flex flex-col items-center space-y-2">
            <div className="text-xs text-muted-foreground text-center">
              Arraste a imagem para posicionar e use o zoom para ajustar
            </div>
            
            <div 
              ref={containerRef}
              className="relative w-64 h-64 bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Overlay circular para mostrar a área de recorte */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full border-4 border-primary/50 shadow-lg" />
              </div>
              
              {/* Imagem */}
              <img
                ref={imageRef}
                alt="Crop me"
                src={imageSrc}
                className="absolute top-0 left-0 max-w-none select-none"
                style={{ 
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transformOrigin: 'top left',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                draggable={false}
              />
            </div>
          </div>
          
          {/* Controles */}
          <div className="space-y-3">
            {/* Zoom */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" />
                  Zoom
                </label>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => resetPosition()} 
                    className="h-6 px-2 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="w-3 h-3 text-muted-foreground" />
                <Slider
                  value={[scale]}
                  onValueChange={(value) => handleZoomChange(value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <ZoomIn className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
            
            {/* Instruções */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground p-2 bg-muted rounded">
              <Move className="w-3 h-3" />
              <span>Clique e arraste para mover a imagem</span>
            </div>
          </div>
          
          {/* Botões */}
          <div className="flex justify-center gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onCancel()}
            >
              Cancelar
            </Button>
            <Button 
              size="sm" 
              onClick={() => applyCrop()}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}