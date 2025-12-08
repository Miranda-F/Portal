'use client'

import { usePathname } from 'next/navigation'
import { UsuarioHeader } from '@/components/usuario/UsuarioHeader'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname()
  
  // Não mostrar header na página de login (rota raiz) e na página de admin (que tem header próprio)
  const shouldShowHeader = pathname !== '/' && pathname !== '/admin'

  return (
    <>
      {shouldShowHeader && <UsuarioHeader />}
      {children}
    </>
  )
}

