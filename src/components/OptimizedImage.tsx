'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  onLoad?: () => void
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  priority = false,
  onLoad 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  // Tentar carregar WebP se disponível
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp')
      const img = new window.Image()
      
      img.onload = () => {
        setImageSrc(webpSrc)
      }
      
      img.onerror = () => {
        setImageSrc(src) // Fallback para original
      }
      
      img.src = webpSrc
    }
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    console.error(`Failed to load image: ${imageSrc}`)
    setHasError(true)
    setIsLoaded(true)
  }

  if (hasError) {
    return (
      <div 
        className={`bg-muted/20 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">Imagem não disponível</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-muted/20 animate-pulse"
          style={{
            backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        />
      )}
    </div>
  )
}