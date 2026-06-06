import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { casosService } from '../../data/services/casosService'
import { reportesService } from '../../data/services/reportesService'
import { useDashboardStore } from '../../core/stores/dashboardStore'

// Runs once in MainLayout to keep sidebar badge counts in sync.
// Uses the same query keys as useDashboardData so no extra API calls are made.
export function useSyncDashboardBadges() {
  const setCasosActivos = useDashboardStore((s) => s.setCasosActivos)
  const setReportesPendientes = useDashboardStore((s) => s.setReportesPendientes)
  const setNotificacionesSinLeer = useDashboardStore((s) => s.setNotificacionesSinLeer)

  const { data: casosData } = useQuery({
    queryKey: ['dashboard-casos'],
    queryFn: () => casosService.listar({ limit: 100 }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const { data: reportesData } = useQuery({
    queryKey: ['dashboard-reportes'],
    queryFn: () => reportesService.listar({ limit: 100 }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  useEffect(() => {
    const casos = casosData?.data ?? []
    setCasosActivos(
      casos.filter((c) => c.estado === 'investigacion_activa' || c.estado === 'suspendido').length,
    )
  }, [casosData, setCasosActivos])

  useEffect(() => {
    const reportes = reportesData?.data ?? []
    setReportesPendientes(reportes.filter((r) => !r.validado).length)
    setNotificacionesSinLeer(reportes.filter((r) => r.prioridad_policial && !r.validado).length)
  }, [reportesData, setReportesPendientes, setNotificacionesSinLeer])
}
