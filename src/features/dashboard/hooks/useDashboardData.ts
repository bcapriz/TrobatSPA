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

  const casosActivos = casos.filter((c) => c.status === 'active_investigation').length

  const reportesPendientes = reportes.filter((r) => !r.validated).length
  const reportesPrioritarios = reportes.filter((r) => r.police_priority).length
  const agentesUnicos = new Set(casos.flatMap((c) => c.assigned_agents)).size

  const estadosCount = {
    active_investigation: casos.filter((c) => c.status === 'active_investigation').length,
    resolved: casos.filter((c) => c.status === 'resolved').length,
    closed: casos.filter((c) => c.status === 'closed').length,
  }

  const casosRecientes = [...casos]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const reportesRecientes = [...reportes]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6)

  const alertasActivas = reportes
    .filter((r) => r.police_priority && !r.validated)
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
