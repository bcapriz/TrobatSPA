import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificacionesService, type CrearNotificacionPayload } from '../../../data/services/notificacionesService'
import { REPORTES_QUERY_KEY } from '../../mapa_investigacion/hooks/useObtenerReportes'
import { NOTIFICACIONES_QUERY_KEY } from './useFeedNotificaciones'

export function useCrearNotificacionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CrearNotificacionPayload) => notificacionesService.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTES_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [NOTIFICACIONES_QUERY_KEY] })
    },
  })
}
