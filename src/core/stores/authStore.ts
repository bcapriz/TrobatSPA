import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '../../domain/models'

interface AuthState {
  token: string | null
  usuario: Usuario | null
  setAuth: (token: string, usuario: Usuario) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      setAuth: (token, usuario) => {
        localStorage.setItem('trobat_token', token)
        set({ token, usuario })
      },
      clearAuth: () => {
        localStorage.removeItem('trobat_token')
        set({ token: null, usuario: null })
      },
    }),
    { name: 'trobat-auth' },
  ),
)
