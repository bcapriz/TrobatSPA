import { useMutation, useQueryClient } from '@tanstack/react-query'
import { casosService } from '../../../data/services/casosService'
import { CASOS_QUERY_KEY } from './useListarCasos'

export function useCrearCasoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: casosService.crear,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [CASOS_QUERY_KEY] })
    },
  })
}
