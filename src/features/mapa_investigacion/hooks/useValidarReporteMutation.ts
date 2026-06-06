import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportesService } from '../../../data/services/reportesService'
import { REPORTES_QUERY_KEY } from './useObtenerReportes'

export function useValidarReporteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, validado }: { id: string; validado: boolean }) =>
      reportesService.validar(id, { validado }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [REPORTES_QUERY_KEY] })
      void queryClient.invalidateQueries({ queryKey: ['reportes-bandeja'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard-reportes'] })
    },
  })
}
