import { apiClient } from '../../core/api'

export interface CrearNotificacionPayload {
  titulo: string
  descripcion: string
}

export interface NotificacionResponse {
  id: string
  titulo: string
  descripcion: string
  timestamp: string
}

export const notificacionesService = {
  crear: (payload: CrearNotificacionPayload) =>
    apiClient.post<NotificacionResponse>('/notificaciones', payload).then((r) => r.data),
}
