import { apiClient } from '../../core/api'

export interface CrearNotificacionPayload {
  titulo: string
  descripcion: string
}

export interface NotificacionResponse {
  id: string
  oficial_id: string
  titulo: string
  descripcion: string
  created_at: string
  sent_at?: string
  fcm_status: string
  fcm_message_id?: string
}

export interface NotificacionesPaginadasResponse {
  data: NotificacionResponse[]
  total: number
  page: number
  limit: number
}

export const notificacionesService = {
  crear: (payload: CrearNotificacionPayload) =>
    apiClient.post<NotificacionResponse>('/notificaciones', payload).then((r) => r.data),

  listar: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<NotificacionesPaginadasResponse>('/notificaciones', { params })
      .then((r) => r.data),
}
