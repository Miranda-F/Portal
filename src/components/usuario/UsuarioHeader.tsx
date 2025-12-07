"use client"

import { useAuth } from "@/hooks/use-auth"
import { getInitials } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationToggle } from "@/components/notification-toggle"
import { MegaMenu } from "@/components/mega-menu"
import { RobustImage } from "@/components/RobustImage"
import { LogOut, Settings, UserCircle, Calendar } from "lucide-react"

interface UsuarioHeaderProps {
  photoRemoved?: boolean
  latestPhotoUrl?: string | null
  profileForm?: {
    name: string
  }
  openProfileModal?: () => void
  hideMegaMenu?: boolean
}

export function UsuarioHeader({
  photoRemoved = false,
  latestPhotoUrl = null,
  profileForm = { name: "" },
  openProfileModal,
  hideMegaMenu = false
}: UsuarioHeaderProps) {
  const { user, logout } = useAuth()

  // Componente de imagem robusto para o avatar
  const RobustAvatarImage = ({ src, alt, className, onError }: { src: string, alt: string, className: string, onError?: () => void }) => {
    return (
      <RobustImage
        src={src}
        alt={alt}
        className={className}
        onError={onError}
        showLoading={false}
      />
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#262626] backdrop-blur-xl shadow-sm">
      <div className="container mx-auto pl-2 pr-4 h-16 flex items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img
              src="/logo-portal-pratagy.png"
              alt="Portal do Pratagy"
              className="h-12 w-auto"
            />
          </div>
        </div>

        {/* Center - Mega Menu */}
        {!hideMegaMenu && (
          <div className="hidden lg:flex items-center justify-center flex-1">
            <MegaMenu />
          </div>
        )}

        {/* Right side - User controls */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu */}
          {!hideMegaMenu && (
            <div className="lg:hidden">
              <MegaMenu />
            </div>
          )}
          <NotificationToggle />
          <div className="text-white/30">|</div>
          <ThemeToggle darkHeader={true} />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 flex items-center space-x-2 rounded-full p-1 hover:bg-white/10">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm border-2 border-primary/30 overflow-hidden">
                  {photoRemoved ? (
                    (profileForm.name || user?.name) ? getInitials(profileForm.name || user?.name || '') : 'U'
                  ) : latestPhotoUrl || user?.photoUrl ? (
                    <RobustAvatarImage
                      src={latestPhotoUrl ? latestPhotoUrl : (user?.photoUrl?.startsWith('http') ? `${user?.photoUrl}?t=${Date.now()}` : `${window.location.origin}${user?.photoUrl}?t=${Date.now()}`)}
                      alt={user?.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={() => {
                        // Se a imagem não carregar, mostrar as iniciais
                        console.log('Avatar image failed to load, showing initials')
                        // O fallback será mostrado automaticamente pois o componente retorna null
                      }}
                    />
                  ) : (
                    (profileForm.name || user?.name) ? getInitials(profileForm.name || user?.name || '') : 'U'
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-white">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              {user?.role === 'ADMIN' ? (
                <>
                  <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Painel administrativo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/eventos'}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Gerenciar Eventos</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : (
                <>
                  {openProfileModal && (
                    <>
                      <DropdownMenuItem onClick={openProfileModal}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Meu perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                </>
              )}
              <DropdownMenuItem onClick={() => {
                logout()
                window.location.href = '/'
              }}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}