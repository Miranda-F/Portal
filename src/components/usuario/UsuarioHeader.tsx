"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationToggle } from "@/components/notification-toggle"

interface UsuarioHeaderProps {
  hideMegaMenu?: boolean
  hideUserDropdownMenu?: boolean
}

export function UsuarioHeader({
  hideMegaMenu = false,
  hideUserDropdownMenu = false
}: UsuarioHeaderProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2">
      <NotificationToggle />
      <div className="text-border">|</div>
      <ThemeToggle darkHeader={false} />
    </div>
  )
}