import { apiClient } from '../../core/api'

export interface LoginOficialCredentials {
  email_institucional: string
  password: string
}

export interface LoginResponse {
  token: string
  tipo: string
  id: string
  nombre: string
}

export interface OficialProfile {
  id: string
  nombre: string
  email_institucional: string
  rango: string
  legajo: string
}

export const authService = {
  loginOficial: (credentials: LoginOficialCredentials) =>
    apiClient.post<LoginResponse>('/auth/login/oficial', credentials).then((r) => r.data),

  getOficialProfile: (id: string) =>
    apiClient.get<OficialProfile>(`/oficiales/${id}`).then((r) => r.data),
}
