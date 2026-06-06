import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { EstadoCaso } from '../../../domain/models'
import { casosService } from '../../../data/services/casosService'
import { CASOS_QUERY_KEY } from './useListarCasos'

export function useActualizarEstadoCasoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoCaso }) =>
      casosService.actualizarEstado(id, estado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CASOS_QUERY_KEY] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard-casos'] })
    },
  })
}
