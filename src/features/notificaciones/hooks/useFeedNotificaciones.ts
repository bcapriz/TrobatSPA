import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { casosService } from '../../../data/services/casosService'
import { reportesService } from '../../../data/services/reportesService'

export type TipoNotif =
  | 'reporte_prioritario'
  | 'reporte_validado'
  | 'reporte_nuevo'
  | 'caso_nuevo'

export interface FeedItem {
  id: string
  tipo: TipoNotif
  titulo: string
  subtitulo: string
  timestamp: string
  urgente: boolean
}

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function todayKey() {
  return dayKey(new Date().toISOString())
}

function yesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dayKey(d.toISOString())
}

export function groupByDay(items: FeedItem[]): { label: string; items: FeedItem[] }[] {
  const today = todayKey()
  const yesterday = yesterdayKey()

  const map = new Map<string, FeedItem[]>()
  for (const item of items) {
    const raw = dayKey(item.timestamp)
    const label = raw === today ? 'Hoy' : raw === yesterday ? 'Ayer' : raw
    const group = map.get(label) ?? []
    group.push(item)
    map.set(label, group)
  }

  return Array.from(map.entries()).map(([label, items]) => ({ label, items }))
}

export function useFeedNotificaciones() {
  const casosQuery = useQuery({
    queryKey: ['dashboard-casos'],
    queryFn: () => casosService.listar({ limit: 100 }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const reportesQuery = useQuery({
    queryKey: ['dashboard-reportes'],
    queryFn: () => reportesService.listar({ limit: 100 }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const casos = casosQuery.data?.data ?? []
  const reportes = reportesQuery.data?.data ?? []

  const casoNombres = useMemo(
    () => Object.fromEntries(casos.map((c) => [c.id, c.desaparecido.nombre])),
    [casos],
  )

  const feed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = []

    for (const r of reportes) {
      const nombre = casoNombres[r.caso_id] ?? 'caso desconocido'

      if (r.prioridad_policial && !r.validado) {
        items.push({
          id: `r-prio-${r.id}`,
          tipo: 'reporte_prioritario',
          titulo: 'Alerta de prioridad alta',
          subtitulo: `${nombre} · ${r.descripcion?.slice(0, 60) || 'Sin descripción'}`,
          timestamp: r.timestamp,
          urgente: true,
        })
      } else if (r.validado) {
        items.push({
          id: `r-val-${r.id}`,
          tipo: 'reporte_validado',
          titulo: 'Reporte validado',
          subtitulo: `${nombre} · ${r.descripcion?.slice(0, 60) || 'Sin descripción'}`,
          timestamp: r.timestamp,
          urgente: false,
        })
      } else {
        items.push({
          id: `r-new-${r.id}`,
          tipo: 'reporte_nuevo',
          titulo: 'Nuevo avistamiento',
          subtitulo: `${nombre} · ${r.descripcion?.slice(0, 60) || 'Sin descripción'}`,
          timestamp: r.timestamp,
          urgente: false,
        })
      }
    }

    for (const c of casos) {
      items.push({
        id: `c-${c.id}`,
        tipo: 'caso_nuevo',
        titulo: 'Caso registrado',
        subtitulo: `${c.desaparecido.nombre} · ${c.agentes_asignados.length} agente${c.agentes_asignados.length !== 1 ? 's' : ''} asignado${c.agentes_asignados.length !== 1 ? 's' : ''}`,
        timestamp: c.fecha_creacion,
        urgente: false,
      })
    }

    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [reportes, casos, casoNombres])

  const urgentes = feed.filter((f) => f.urgente).length

  return {
    isLoading: casosQuery.isLoading || reportesQuery.isLoading,
    isError: casosQuery.isError || reportesQuery.isError,
    feed,
    urgentes,
    groupByDay: () => groupByDay(feed),
  }
}
