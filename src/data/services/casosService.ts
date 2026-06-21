import type { Caso, CrearCasoPayload, EstadoCaso } from '../../domain/models'
import { apiClient } from '../../core/api'

export interface ListarCasosFiltros {
  page?: number
  limit?: number
}

export interface ListarCasosResponse {
  data: Caso[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface EditarCasoPayload {
  missing_person: {
    name: string
    description: string
    age: number
    last_seen_date: string
    location_description: string
    last_known_location: import('../../domain/models').Ubicacion
  }
  external_contact: {
    name: string
    email: string
    phone: string
  }
}

export const casosService = {
  listar: (filtros: ListarCasosFiltros = {}) =>
    apiClient.get<ListarCasosResponse>('/casos', { params: filtros }).then((r) => r.data),

  obtener: (id: string) =>
    apiClient.get<Caso>(`/casos/${id}`).then((r) => r.data),

  crear: ({ payload, foto }: { payload: CrearCasoPayload; foto: File }) => {
    const formData = new FormData()
    formData.append('datos', JSON.stringify(payload))
    formData.append('foto', foto)
    return apiClient.post<{ id: string; message: string }>('/casos', formData).then((r) => r.data)
  },

  actualizarEstado: (id: string, status: EstadoCaso) =>
    apiClient
      .patch<{ message: string }>(`/casos/${id}/estado`, { status })
      .then((r) => r.data),

  editar: (id: string, payload: EditarCasoPayload) =>
    apiClient.patch<{ message: string }>(`/casos/${id}`, payload).then((r) => r.data),

  asignarAgente: (casoId: string, agenteId: string) =>
    apiClient
      .post<{ message: string }>(`/casos/${casoId}/agentes/${agenteId}`)
      .then((r) => r.data),

  removerAgente: (casoId: string, agenteId: string) =>
    apiClient
      .delete<{ message: string }>(`/casos/${casoId}/agentes/${agenteId}`)
      .then((r) => r.data),
}
