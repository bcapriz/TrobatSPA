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

/** Llama al endpoint pero no falla si devuelve 404 (endpoint aún no implementado en el backend) */
async function safePriorizar(id: string, prioridad_policial: boolean) {
  try {
    await reportesService.priorizar(id, { prioridad_policial })
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status !== 404) throw err
    // 404 → endpoint todavía no existe, ignorar silenciosamente
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
      payload: { prioridad_policial: boolean; validado?: boolean }
    }) => {
      await safePriorizar(id, payload.prioridad_policial)

      if (payload.validado !== undefined) {
        await reportesService.validar(id, { validado: payload.validado })
      }
    },

    // Actualización optimista: tocar el cache antes de que responda el backend
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
              prioridad_policial: payload.prioridad_policial,
              ...(payload.validado !== undefined ? { validado: payload.validado } : {}),
            }
          }),
        }
      })

      return { previous }
    },

    // Si el backend falla (y no es 404 de prioridad), revertir
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['reportes-bandeja'], context.previous)
      }
      invalidateAll()
    },

    onSuccess: invalidateAll,
  })
}