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

export interface ActualizarEstadoPayload {
  estado: EstadoCaso
}

export interface EditarCasoPayload {
  desaparecido: {
    nombre: string
    descripcion: string
    edad: number
    fecha_ultima_vez_visto: string
    descripcion_ubicacion: string
    ultima_ubicacion_oficial: import('../../domain/models').Ubicacion
  }
  representante_externo: {
    nombre: string
    email: string
    telefono: string
  }
}

export const casosService = {
  listar: (filtros: ListarCasosFiltros = {}) =>
    apiClient.get<ListarCasosResponse>('/casos', { params: filtros }).then((r) => r.data),

  obtener: (id: string) =>
    apiClient.get<Caso>(`/casos/${id}`).then((r) => r.data),

  crear: (payload: CrearCasoPayload) =>
    apiClient.post<{ id: string; mensaje: string }>('/casos', payload).then((r) => r.data),

  actualizarEstado: (id: string, estado: EstadoCaso) =>
    apiClient
      .patch<{ mensaje: string }>(`/casos/${id}/estado`, { estado })
      .then((r) => r.data),

  editar: (id: string, payload: EditarCasoPayload) =>
    apiClient.patch<{ mensaje: string }>(`/casos/${id}`, payload).then((r) => r.data),

  asignarAgente: (casoId: string, agenteId: string) =>
    apiClient
      .post<{ mensaje: string }>(`/casos/${casoId}/agentes/${agenteId}`)
      .then((r) => r.data),

  removerAgente: (casoId: string, agenteId: string) =>
    apiClient
      .delete<{ mensaje: string }>(`/casos/${casoId}/agentes/${agenteId}`)
      .then((r) => r.data),
}