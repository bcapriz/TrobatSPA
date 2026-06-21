import { useQuery } from '@tanstack/react-query'
import { reportesService } from '../../../data/services/reportesService'
import { useMapaStore } from '../../../core/stores/mapaStore'

export const REPORTES_QUERY_KEY = 'reportes-mapa'

export function useObtenerReportes() {
  const casoIdFiltro = useMapaStore((s) => s.casoIdFiltro)

  return useQuery({
    queryKey: [REPORTES_QUERY_KEY, casoIdFiltro],
    queryFn: () =>
      reportesService.listar({
        limit: 200,
        ...(casoIdFiltro ? { case_id: casoIdFiltro } : {}),
      }),
    refetchInterval: 30_000,
  })
}
