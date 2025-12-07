'use client'

import { useState, useEffect } from 'react'

interface OptimizedBackgroundImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  onLoad?: () => void
}

export function OptimizedBackgroundImage({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  onLoad 
}: OptimizedBackgroundImageProps) {
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

  useEffect(() => {
    const img = new window.Image()
    
    const handleLoad = () => {
      setIsLoaded(true)
      onLoad?.()
    }

    const handleError = () => {
      console.error(`Failed to load image: ${imageSrc}`)
      setHasError(true)
      setIsLoaded(true) // Mark as loaded to avoid infinite loading state
    }

    img.onload = handleLoad
    img.onerror = handleError
    
    // Se for priority, carregar imediatamente
    if (priority) {
      img.src = imageSrc
    } else {
      // Usar requestIdleCallback para carregar quando o navegador estiver ocioso
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          img.src = imageSrc
        })
      } else {
        // Fallback para setTimeout
        setTimeout(() => {
          img.src = imageSrc
        }, 100)
      }
    }

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [imageSrc, priority, onLoad])

  if (!isLoaded || hasError) {
    return (
      <div 
        className={`bg-muted/20 animate-pulse ${className}`}
        style={{ 
          backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      />
    )
  }

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      aria-label={alt}
    />
  )
}