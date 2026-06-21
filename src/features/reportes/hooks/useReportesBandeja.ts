import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportesService } from '../../../data/services/reportesService'
import { useListarCasos } from '../../casos/hooks/useListarCasos'

export function useReportesBandeja() {
  const reportesQuery = useQuery({
    queryKey: ['reportes-bandeja'],
    queryFn: () => reportesService.listar({ limit: 100 }),
    refetchInterval: 30_000,
  })

  const casosQuery = useListarCasos({ limit: 100 })

  const reportes = reportesQuery.data?.data ?? []
  const casos = casosQuery.data?.data ?? []

  const casoNombres = useMemo(
    () => Object.fromEntries(casos.map((c) => [c.id, c.missing_person.name])),
    [casos],
  )

  return {
    isLoading: reportesQuery.isLoading,
    isError: reportesQuery.isError,
    reportes,
    casos,
    casoNombres,
    totales: {
      todos: reportes.length,
      pendientes: reportes.filter((r) => !r.validated).length,
      prioritarios: reportes.filter((r) => r.police_priority).length,
      validados: reportes.filter((r) => r.validated).length,
    },
  }
}
