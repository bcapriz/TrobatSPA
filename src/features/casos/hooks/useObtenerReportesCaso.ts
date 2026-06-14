import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportesService } from '../../../data/services/reportesService'

export function useObtenerReportesCaso(casoId: string) {
  const query = useQuery({
    queryKey: ['reportes-caso', casoId],
    queryFn: () =>
      reportesService.listar({
        caso_id: casoId,
        validado: false,
        limit: 100,
      }),
    enabled: !!casoId,
  })

  return {
    ...query,
    data: useMemo(
      () => ({
        ...query.data,
        data: query.data?.data.filter((reporte) => !reporte.validado && !reporte.descartado),
      }),
      [query.data],
    ),
  }
}
