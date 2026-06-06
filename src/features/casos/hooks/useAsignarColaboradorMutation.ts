import { useMutation, useQueryClient } from '@tanstack/react-query'
import { casosService } from '../../../data/services/casosService'
import { CASOS_QUERY_KEY } from './useListarCasos'

export function useAsignarAgenteMutation(casoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (agenteId: string) => casosService.asignarAgente(casoId, agenteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CASOS_QUERY_KEY] })
    },
  })
}

export function useRemoverAgenteMutation(casoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (agenteId: string) => casosService.removerAgente(casoId, agenteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CASOS_QUERY_KEY] })
    },
  })
}
