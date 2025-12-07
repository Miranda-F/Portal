"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, authChecked } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if auth has been checked and user is not authenticated
    if (authChecked && !loading && !user) {
      // Redirect to home page instead of non-existent login page
      router.push("/")
    }
  }, [user, loading, authChecked, router])

  // Show loading spinner while checking authentication
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    )
  }

  // If auth is checked and user is not authenticated, return null to avoid flash of content
  if (authChecked && !user) {
    return null
  }

  return <>{children}</>
}