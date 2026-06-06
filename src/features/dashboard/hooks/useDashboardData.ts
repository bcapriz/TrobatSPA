import { useQuery } from '@tanstack/react-query'
import { casosService } from '../../../data/services/casosService'
import { reportesService } from '../../../data/services/reportesService'

export function useDashboardData() {
  const casosQuery = useQuery({
    queryKey: ['dashboard-casos'],
    queryFn: () => casosService.listar({ limit: 100 }),
    staleTime: 30_000,
  })

  const reportesQuery = useQuery({
    queryKey: ['dashboard-reportes'],
    queryFn: () => reportesService.listar({ limit: 100 }),
    staleTime: 30_000,
  })

  const casos = casosQuery.data?.data ?? []
  const reportes = reportesQuery.data?.data ?? []

  const casosActivos = casos.filter(
    (c) => c.estado === 'investigacion_activa' || c.estado === 'suspendido',
  ).length

  const reportesPendientes = reportes.filter((r) => !r.validado).length
  const reportesPrioritarios = reportes.filter((r) => r.prioridad_policial).length
  const agentesUnicos = new Set(casos.flatMap((c) => c.agentes_asignados)).size

  const estadosCount = {
    investigacion_activa: casos.filter((c) => c.estado === 'investigacion_activa').length,
    suspendido: casos.filter((c) => c.estado === 'suspendido').length,
    resuelto: casos.filter((c) => c.estado === 'resuelto').length,
    cerrado: casos.filter((c) => c.estado === 'cerrado').length,
  }

  const casosRecientes = [...casos]
    .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
    .slice(0, 5)

  const reportesRecientes = [...reportes]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6)

  const alertasActivas = reportes
    .filter((r) => r.prioridad_policial && !r.validado)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  return {
    isLoading: casosQuery.isLoading || reportesQuery.isLoading,
    isError: casosQuery.isError || reportesQuery.isError,
    casosActivos,
    reportesPendientes,
    reportesPrioritarios,
    agentesUnicos,
    estadosCount,
    casosRecientes,
    reportesRecientes,
    alertasActivas,
    totalCasos: casos.length,
    totalReportes: reportes.length,
  }
}
