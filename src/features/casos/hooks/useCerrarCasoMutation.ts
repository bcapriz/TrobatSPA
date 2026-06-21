import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { EstadoCaso } from '../../../domain/models'
import { casosService } from '../../../data/services/casosService'
import { CASOS_QUERY_KEY } from './useListarCasos'

export function useActualizarEstadoCasoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EstadoCaso }) =>
      casosService.actualizarEstado(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CASOS_QUERY_KEY] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard-casos'] })
    },
  })
}
