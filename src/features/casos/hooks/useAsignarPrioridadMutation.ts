import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportesService } from '../../../data/services/reportesService'
import { REPORTES_QUERY_KEY } from '../../mapa_investigacion/hooks/useObtenerReportes'

export function useAsignarPrioridadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { prioridad_policial: boolean; validado?: boolean } }) =>
      reportesService.priorizar(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [REPORTES_QUERY_KEY], exact: false })
      void queryClient.invalidateQueries({ queryKey: ['reportes-bandeja'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard-reportes'] })
      void queryClient.invalidateQueries({ queryKey: ['reportes-caso'], exact: false })
    },
  })
}
