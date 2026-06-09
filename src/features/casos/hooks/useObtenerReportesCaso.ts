import { useQuery } from '@tanstack/react-query'
import { reportesService } from '../../../data/services/reportesService'

export function useObtenerReportesCaso(casoId: string) {
  return useQuery({
    queryKey: ['reportes-caso', casoId],
    queryFn: () =>
      reportesService.listar({
        caso_id: casoId,
        limit: 100,
      }),
    enabled: !!casoId,
  })
}
