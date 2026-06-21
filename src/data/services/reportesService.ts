import type { Reporte, ValidarReportePayload, PriorizarReportePayload } from '../../domain/models'
import { apiClient } from '../../core/api'

export interface ListarReportesFiltros {
  case_id?: string
  page?: number
  limit?: number
}

export interface ListarReportesResponse {
  data: Reporte[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export const reportesService = {
  listar: async (params: ListarReportesFiltros = {}) => {
    try {
      const r = await apiClient.get<ListarReportesResponse>('/reportes', { params })
      return r.data
    } catch (error) {
      throw error
    }
  },

  validar: async (id: string, payload: ValidarReportePayload) => {
    try {
      const r = await apiClient.patch<{ message: string }>(`/reportes/${id}/validar`, payload)
      return r.data
    } catch (error) {
      throw error
    }
  },

  priorizar: async (id: string, payload: PriorizarReportePayload) => {
    try {
      const r = await apiClient.patch<{ message: string }>(`/reportes/${id}/prioridad`, payload)
      return r.data
    } catch (error) {
      throw error
    }
  },
}
