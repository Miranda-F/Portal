'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface RobustImageProps {
  src: string
  alt: string
  className?: string
  onError?: () => void
  onLoad?: () => void
  fallback?: React.ReactNode
  showLoading?: boolean
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
}

export function RobustImage({ 
  src, 
  alt, 
  className = "", 
  onError, 
  onLoad,
  fallback = null,
  showLoading = true,
  width,
  height,
  priority = false,
  quality = 75,
  sizes,
  fill = false
}: RobustImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
    setIsLoading(true)
  }, [src])

  const handleError = () => {
    if (!hasError) {
      console.log('Image failed to load, showing fallback:', src)
      setHasError(true)
      setIsLoading(false)
      if (onError) onError()
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
    if (onLoad) onLoad()
  }

  if (hasError) {
    return <>{fallback}</>
  }

  return (
    <div className={cn('relative', className)}>
      <Image
        src={imgSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          isLoading && showLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        unoptimized={imgSrc.startsWith('data:') || imgSrc.includes('.gif')}
        {...(fill ? { fill: true } : { width, height })}
      />
      {isLoading && showLoading && (
        <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}