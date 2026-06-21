import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportesService } from '../../../data/services/reportesService'
import type { ReportePriority } from '../../../domain/models'
import { REPORTES_QUERY_KEY } from './useObtenerReportes'

const ALL_REPORTES_KEYS = [
  [REPORTES_QUERY_KEY],
  ['reportes-bandeja'],
  ['dashboard-reportes'],
  ['reportes-caso'],
] as const

export function useValidarReporteMutation() {
  const queryClient = useQueryClient()

  const invalidateAll = () =>
    ALL_REPORTES_KEYS.forEach((key) =>
      void queryClient.invalidateQueries({ queryKey: key, exact: false }),
    )

  return useMutation({
    mutationFn: ({
      id,
      validated,
      priority,
    }: {
      id: string
      validated: boolean
      priority?: ReportePriority | null
    }) => reportesService.validar(id, { validated, priority }),
    onSuccess: invalidateAll,
  })
}
