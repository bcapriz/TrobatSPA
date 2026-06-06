import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../data/services/authService'
import { useAuthStore } from '../../../core/stores/authStore'
import type { Usuario } from '../../../domain/models'

export function useLoginMutation() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (credentials: Parameters<typeof authService.loginOficial>[0]) => {
      const loginResponse = await authService.loginOficial(credentials)
      localStorage.setItem('trobat_token', loginResponse.token)
      try {
        const profile = await authService.getOficialProfile(loginResponse.id)
        return { token: loginResponse.token, profile }
      } catch {
        localStorage.removeItem('trobat_token')
        throw new Error('No se pudo obtener el perfil del oficial.')
      }
    },
    onSuccess: ({ token, profile }) => {
      const usuario: Usuario = {
        id: profile.id,
        nombre: profile.nombre,
        email_institucional: profile.email_institucional,
        rango: profile.rango,
        legajo: profile.legajo,
      }
      setAuth(token, usuario)
      void navigate('/dashboard')
    },
  })
}
