import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface AuthUser {
  id: string
  email: string
  name: string
  sectorId?: string
  sector?: { name: string }
  showIdentityCard: boolean
  role: UserRole
  approved: boolean
  photoUrl?: string
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  authChecked: boolean
  error: string | null
  lastAuthCheck: number | null
  isLoggedIn: boolean
  isAdmin: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setAuthChecked: (checked: boolean) => void
  setError: (error: string | null) => void
  setLastAuthCheck: (timestamp: number) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      authChecked: false,
      error: null,
      lastAuthCheck: null,
      isLoggedIn: false,
      isAdmin: false,
      setUser: (user) =>
        set({
          user,
          isLoggedIn: !!user,
          isAdmin: user?.role === UserRole.ADMIN ?? false,
        }),
      setLoading: (loading) => set({ loading }),
      setAuthChecked: (checked) => set({ authChecked: checked }),
      setError: (error) => set({ error }),
      setLastAuthCheck: (timestamp) => set({ lastAuthCheck: timestamp }),
      clearAuth: () =>
        set({
          user: null,
          loading: false,
          authChecked: true,
          error: null,
          lastAuthCheck: null,
          isLoggedIn: false,
          isAdmin: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        authChecked: state.authChecked,
        lastAuthCheck: state.lastAuthCheck,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false) // garante que loading é false após rehydrate
      },
    }
  )
)