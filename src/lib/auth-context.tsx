"use client"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"

interface AuthUser {
  id: string
  email: string
  name: string
  company?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  checkAuth: () => Promise<void>
  logout: (redirectTo?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("Auth check error:", err)
      setError("Falha ao verificar autenticação")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(
    async (redirectTo?: string) => {
      try {
        await fetch("/api/auth/logout", { method: "POST" })
        setUser(null)
        if (redirectTo) router.push(redirectTo)
      } catch (err) {
        console.error("Logout error:", err)
        setError("Erro ao encerrar sessão")
      }
    },
    [router]
  )

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <AuthContext.Provider value={{ user, loading, error, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}