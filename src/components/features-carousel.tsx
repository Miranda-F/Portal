"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { 
  FileText, 
  Briefcase, 
  Eye, 
  Users, 
  Calendar, 
  Building2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <FileText className="h-8 w-8" />,
    title: "Gestão da Qualidade",
    description: "Acesse e gerencie documentos de qualidade com facilidade e eficiência."
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "Publicações",
    description: "Acesse publicações relacionadas a Estratificações, inspeções"
  },
  {
    icon: <Eye className="h-8 w-8" />,
    title: "Missão, Visão e Valores",
    description: "Conheça os pilares que guiam nossa organização e moldam nossa cultura."
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Organograma",
    description: "Visualize a estrutura organizacional e conheça as equipes da empresa."
  },
  {
    icon: <Briefcase className="h-8 w-8" />,
    title: "Oportunidades",
    description: "Encontre as melhores oportunidades de trabalho dentro da organização."
  },
  {
    icon: <Calendar className="h-8 w-8" />,
    title: "Eventos Corporativos",
    description: "Fique por dentro de todos os eventos e atividades corporativas."
  }
]

export function FeaturesCarousel() {
  const [api, setApi] = useState(null)
  const [current, setCurrent] = useState(0)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
  const observerRef = useRef(null)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Verificar preferência de redução de movimento
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (!api || !isAutoScrollEnabled || isReducedMotion) return

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (api) {
          const totalSlides = api.scrollSnapList().length
          const currentIndex = api.selectedScrollSnap()
          const nextIndex = (currentIndex + 1) % totalSlides
          api.scrollTo(nextIndex)
        }
      }, 3000) // Change slide every 3 seconds
    }

    startAutoScroll()

    // Pause auto-scroll on hover
    const carouselElement = api.rootNode()
    const handleMouseEnter = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
    }

    const handleMouseLeave = () => {
      if (isAutoScrollEnabled && !isReducedMotion) {
        startAutoScroll()
      }
    }

    if (carouselElement) {
      carouselElement.addEventListener('mouseenter', handleMouseEnter)
      carouselElement.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
      if (carouselElement) {
        carouselElement.removeEventListener('mouseenter', handleMouseEnter)
        carouselElement.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [api, isAutoScrollEnabled, isReducedMotion])

  // Otimizado com useCallback para evitar re-renders desnecessários
  const handleSelect = useCallback(() => {
    if (api) {
      setCurrent(api.selectedScrollSnap())
    }
  }, [api])

  useEffect(() => {
    if (!api) return

    api.on("select", handleSelect)
    handleSelect()

    return () => {
      api.off("select", handleSelect)
    }
  }, [api, handleSelect])

  const scrollTo = useCallback((index: number) => {
    // Reset auto-scroll timer when manually navigating
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }
    if (isAutoScrollEnabled && !isReducedMotion) {
      autoScrollIntervalRef.current = setInterval(() => {
        if (api) {
          const totalSlides = api.scrollSnapList().length
          const currentIndex = api.selectedScrollSnap()
          const nextIndex = (currentIndex + 1) % totalSlides
          api.scrollTo(nextIndex)
        }
      }, 3000)
    }
    api?.scrollTo(index)
  }, [api, isAutoScrollEnabled, isReducedMotion])

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold mb-4">Recursos do Portal</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tudo o que você precisa para gerenciar qualidade, oportunidades e eventos em um só lugar.
        </p>
      </div>

      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            duration: isReducedMotion ? 0 : 25, // Remove animação se preferência reduzida
          }}
          className="w-full"
          setApi={setApi}
        >
          <CarouselContent>
            {features.map((feature, index) => (
              <CarouselItem
                key={index}
                className={cn(
                  "md:basis-1/2",
                  "lg:basis-1/3",
                  "xl:basis-1/4"
                )}
              >
                <div 
                  className={cn(
                    "bg-card border rounded-lg p-6 h-full",
                    !isReducedMotion && "hover:shadow-lg transition-all duration-300 hover:scale-105"
                  )}
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-center">{feature.title}</h4>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {features.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                current === index
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}