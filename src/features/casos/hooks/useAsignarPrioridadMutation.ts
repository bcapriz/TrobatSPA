import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportesService } from '../../../data/services/reportesService'
import { REPORTES_QUERY_KEY } from '../../mapa_investigacion/hooks/useObtenerReportes'

const QUERY_KEYS = [
  [REPORTES_QUERY_KEY],
  ['reportes-bandeja'],
  ['dashboard-reportes'],
  ['reportes-caso'],
] as const

export function useAsignarPrioridadMutation() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    QUERY_KEYS.forEach((key) =>
      void queryClient.invalidateQueries({ queryKey: key, exact: false }),
    )
  }

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: { prioridad_policial: boolean; validado?: boolean }
    }) => {
      // Llamar siempre al endpoint de prioridad
      await reportesService.priorizar(id, { prioridad_policial: payload.prioridad_policial })

      // Si se pide validar/desvalidar explícitamente, llamar también al endpoint de validación
      if (payload.validado !== undefined) {
        await reportesService.validar(id, { validado: payload.validado })
      }
    },
    onSuccess: invalidateAll,
    onError: invalidateAll, // Refrescar igual para mostrar el estado real del servidor
  })
}
