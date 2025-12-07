'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselItem {
  id: string
  title: string
  description: string
  imageUrl: string
  buttonText?: string
  buttonLink?: string
}

interface ResponsiveCarouselProps {
  items: CarouselItem[]
  autoPlayInterval?: number
  className?: string
}

export function ResponsiveCarousel({ 
  items, 
  autoPlayInterval = 5000, 
  className = "" 
}: ResponsiveCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Função para avançar para o próximo slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
  }

  // Função para voltar para o slide anterior
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)
  }

  // Função para ir para um slide específico
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isAutoPlaying) {
      interval = setInterval(() => {
        nextSlide()
      }, autoPlayInterval)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isAutoPlaying, autoPlayInterval])

  // Pausar auto-play quando o usuário interage
  const handleUserInteraction = () => {
    setIsAutoPlaying(false)
    // Reiniciar auto-play após 10 segundos de inatividade
    setTimeout(() => {
      setIsAutoPlaying(true)
    }, 10000)
  }

  if (items.length === 0) {
    return null
  }

  const currentItem = items[currentIndex]

  return (
    <div className={`relative w-full max-w-6xl mx-auto ${className}`}>
      {/* Botões de navegação laterais - FORA DO CARD */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -translate-x-12 carousel-btn bg-white/90 dark:bg-gray-800/90 border-2 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
        onClick={() => {
          prevSlide()
          handleUserInteraction()
        }}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 translate-x-12 carousel-btn bg-white/90 dark:bg-gray-800/90 border-2 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
        onClick={() => {
          nextSlide()
          handleUserInteraction()
        }}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Container principal do carrossel - TAMANHO FIXO */}
      <Card className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full h-[500px]">
        <CardContent className="p-0 h-full">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Lado da imagem - COBRE TODO O ESPAÇO */}
            <div className="lg:w-1/2 relative overflow-hidden h-full">
              <img
                src={currentItem.imageUrl}
                alt={currentItem.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92e1b59?w=800&h=600&fit=crop'
                }}
              />
              {/* Overlay gradiente para melhor legibilidade do texto em mobile */}
              <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Lado do conteúdo */}
            <div className="lg:w-1/2 p-8 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 h-full">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                    {currentItem.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    {currentItem.description}
                  </p>
                </div>

                {currentItem.buttonText && currentItem.buttonLink && (
                  <Button 
                    size="lg"
                    className="w-full sm:w-auto px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={() => {
                      if (currentItem.buttonLink.startsWith('http')) {
                        window.open(currentItem.buttonLink, '_blank')
                      } else {
                        window.location.href = currentItem.buttonLink
                      }
                    }}
                  >
                    {currentItem.buttonText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicadores (bolinhas) - FORA DO CARD */}
      <div className="flex justify-center items-center space-x-2 mt-6">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
          {currentIndex + 1} de {items.length}
        </span>
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              goToSlide(index)
              handleUserInteraction()
            }}
            className={`carousel-indicator w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-blue-600 dark:bg-blue-400 w-8'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}