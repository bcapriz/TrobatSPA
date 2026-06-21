import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportesService } from '../../../data/services/reportesService'
import { REPORTES_QUERY_KEY } from './useObtenerReportes'

export function useValidarReporteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, validated }: { id: string; validated: boolean }) =>
      reportesService.validar(id, { validated }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [REPORTES_QUERY_KEY], exact: false })
      void queryClient.invalidateQueries({ queryKey: ['reportes-bandeja'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard-reportes'] })
      void queryClient.invalidateQueries({ queryKey: ['reportes-caso'], exact: false })
    },
  })
}
