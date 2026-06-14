import { useMutation, useQueryClient } from '@tanstack/react-query'
import { casosService, type EditarCasoPayload } from '../../../data/services/casosService'

export function useEditarCasoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditarCasoPayload }) =>
      casosService.editar(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['casos'], exact: false })
    },
  })
}
