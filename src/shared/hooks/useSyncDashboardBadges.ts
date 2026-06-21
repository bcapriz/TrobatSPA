import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { casosService } from '../../data/services/casosService'
import { reportesService } from '../../data/services/reportesService'
import { useDashboardStore } from '../../core/stores/dashboardStore'

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
    setCasosActivos(casos.filter((c) => c.status === 'active_investigation').length)
  }, [casosData, setCasosActivos])

  useEffect(() => {
    const reportes = reportesData?.data ?? []
    setReportesPendientes(reportes.filter((r) => !r.validated).length)
    setNotificacionesSinLeer(reportes.filter((r) => r.priority === 'high').length)
  }, [reportesData, setReportesPendientes, setNotificacionesSinLeer])
}
