import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportesService } from '../../../data/services/reportesService'
import { REPORTES_QUERY_KEY } from '../../mapa_investigacion/hooks/useObtenerReportes'
import type { ListarReportesResponse } from '../../../data/services/reportesService'

const QUERY_KEYS = [
  [REPORTES_QUERY_KEY],
  ['reportes-bandeja'],
  ['dashboard-reportes'],
  ['reportes-caso'],
] as const

async function safePriorizar(id: string, police_priority: boolean) {
  try {
    await reportesService.priorizar(id, { police_priority })
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status !== 404) throw err
  }
}

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
      payload: { police_priority: boolean; validated?: boolean }
    }) => {
      await safePriorizar(id, payload.police_priority)

      if (payload.validated !== undefined) {
        await reportesService.validar(id, { validated: payload.validated })
      }
    },

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['reportes-bandeja'] })

      const previous = queryClient.getQueryData<ListarReportesResponse>(['reportes-bandeja'])

      queryClient.setQueryData<ListarReportesResponse>(['reportes-bandeja'], (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((r) => {
            if (r.id !== id) return r
            return {
              ...r,
              police_priority: payload.police_priority,
              ...(payload.validated !== undefined ? { validated: payload.validated } : {}),
            }
          }),
        }
      })

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['reportes-bandeja'], context.previous)
      }
      invalidateAll()
    },

    onSuccess: invalidateAll,
  })
}
