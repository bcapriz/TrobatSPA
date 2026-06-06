import type { OficialProfile } from './authService'
import { apiClient } from '../../core/api'

export const usuariosService = {
  listarOficiales: () =>
    apiClient.get<OficialProfile[]>('/oficiales').then((r) => r.data),
}
