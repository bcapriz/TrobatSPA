import type { Reporte, ValidarReportePayload } from '../../domain/models'
import { apiClient } from '../../core/api'

export interface ListarReportesFiltros {
  caso_id?: string
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
  listar: (params: ListarReportesFiltros = {}) =>
    apiClient.get<ListarReportesResponse>('/reportes', { params }).then((r) => r.data),

  validar: (id: string, payload: ValidarReportePayload) =>
    apiClient.patch<{ mensaje: string }>(`/reportes/${id}/validar`, payload).then((r) => r.data),
}
