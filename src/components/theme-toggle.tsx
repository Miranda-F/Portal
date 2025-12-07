"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

interface ThemeToggleProps {
  darkHeader?: boolean
}

export function ThemeToggle({ darkHeader = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Carregando tema</span>
      </Button>
    )
  }

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  const getThemeIcon = () => {
    if (theme === "light") {
      return <Sun className="h-[1.2rem] w-[1.2rem]" />
    } else {
      return <Moon className="h-[1.2rem] w-[1.2rem]" />
    }
  }

  const getThemeLabel = () => {
    if (theme === "light") return "Tema claro"
    return "Tema escuro"
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      title={getThemeLabel()}
      className={darkHeader 
        ? "text-white/90 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
      }
    >
      {getThemeIcon()}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}