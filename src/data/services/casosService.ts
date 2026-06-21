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
  listar: async (filtros: ListarCasosFiltros = {}) => {
    try {
      const r = await apiClient.get<ListarCasosResponse>('/casos', { params: filtros })
      return r.data
    } catch (error) {
      throw error
    }
  },

  obtener: async (id: string) => {
    try {
      const r = await apiClient.get<Caso>(`/casos/${id}`)
      return r.data
    } catch (error) {
      throw error
    }
  },

  crear: async ({ payload, foto }: { payload: CrearCasoPayload; foto: File }) => {
    try {
      const formData = new FormData()
      formData.append('datos', JSON.stringify(payload))
      formData.append('foto', foto)
      const r = await apiClient.post<{ id: string; message: string }>('/casos', formData, {
        headers: { 'Content-Type': undefined },
      })
      return r.data
    } catch (error) {
      throw error
    }
  },

  actualizarEstado: async (id: string, status: EstadoCaso) => {
    try {
      const r = await apiClient.patch<{ message: string }>(`/casos/${id}/estado`, { status })
      return r.data
    } catch (error) {
      throw error
    }
  },

  editar: async (id: string, payload: EditarCasoPayload) => {
    try {
      const r = await apiClient.patch<{ message: string }>(`/casos/${id}`, payload)
      return r.data
    } catch (error) {
      throw error
    }
  },

  asignarAgente: async (casoId: string, agenteId: string) => {
    try {
      const r = await apiClient.post<{ message: string }>(`/casos/${casoId}/agentes/${agenteId}`)
      return r.data
    } catch (error) {
      throw error
    }
  },

  removerAgente: async (casoId: string, agenteId: string) => {
    try {
      const r = await apiClient.delete<{ message: string }>(`/casos/${casoId}/agentes/${agenteId}`)
      return r.data
    } catch (error) {
      throw error
    }
  },
}
