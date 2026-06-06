import { Flag, ShieldCheck, Bell, FolderOpen, Loader2, AlertCircle } from 'lucide-react'
import type { TipoNotif, FeedItem } from '../hooks/useFeedNotificaciones'
import { useFeedNotificaciones } from '../hooks/useFeedNotificaciones'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

const TIPO_META: Record<
  TipoNotif,
  { icon: React.ComponentType<{ size: number; className?: string }>; iconClass: string; ring: string }
> = {
  reporte_prioritario: {
    icon: Flag,
    iconClass: 'text-priority-high',
    ring: 'bg-priority-high/15 border-priority-high/30',
  },
  reporte_validado: {
    icon: ShieldCheck,
    iconClass: 'text-priority-low',
    ring: 'bg-priority-low/15 border-priority-low/30',
  },
  reporte_nuevo: {
    icon: Bell,
    iconClass: 'text-brand-base',
    ring: 'bg-brand-base/15 border-brand-base/30',
  },
  caso_nuevo: {
    icon: FolderOpen,
    iconClass: 'text-text-secondary',
    ring: 'bg-bg-hover border-border-soft',
  },
}

// ─── feed item ────────────────────────────────────────────────────────────────

function NotifItem({ item }: { item: FeedItem }) {
  const meta = TIPO_META[item.tipo]
  const Icon = meta.icon

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
        item.urgente ? 'bg-priority-high/5 border-priority-high/20' : 'bg-bg-panel border-border-soft hover:bg-bg-hover'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${meta.ring}`}
      >
        <Icon size={15} className={meta.iconClass} />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-tight ${item.urgente ? 'text-priority-high' : 'text-text-primary'}`}>
            {item.titulo}
          </p>
          <span className="text-text-muted text-[11px] flex-shrink-0">{formatTime(item.timestamp)}</span>
        </div>
        <p className="text-text-secondary text-xs mt-0.5 line-clamp-2 leading-relaxed">
          {item.subtitulo}
        </p>
      </div>
    </div>
  )
}

// ─── main view ────────────────────────────────────────────────────────────────

export function NotificacionesView() {
  const { isLoading, isError, urgentes, groupByDay } = useFeedNotificaciones()
  const groups = groupByDay()

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-text-secondary bg-bg-panel border border-border-soft rounded-xl px-5 py-4">
          <AlertCircle size={18} className="text-priority-high" />
          <span className="text-sm">No se pudo cargar el feed de actividad.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary font-bold text-lg">Notificaciones</h1>
          <p className="text-text-muted text-xs mt-0.5">Feed de actividad del sistema</p>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && <Loader2 size={15} className="animate-spin text-text-muted" />}
          {!isLoading && urgentes > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-priority-high bg-priority-high/15 border border-priority-high/25 px-3 py-1.5 rounded-full">
              <Flag size={11} />
              {urgentes} alerta{urgentes !== 1 ? 's' : ''} activa{urgentes !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3">
        {(
          [
            { tipo: 'reporte_prioritario', label: 'Prioridad alta' },
            { tipo: 'reporte_nuevo', label: 'Nuevo avistamiento' },
            { tipo: 'reporte_validado', label: 'Reporte validado' },
            { tipo: 'caso_nuevo', label: 'Caso registrado' },
          ] as { tipo: TipoNotif; label: string }[]
        ).map(({ tipo, label }) => {
          const meta = TIPO_META[tipo]
          const Icon = meta.icon
          return (
            <div key={tipo} className="flex items-center gap-1.5 text-xs text-text-muted">
              <Icon size={12} className={meta.iconClass} />
              {label}
            </div>
          )
        })}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-border-soft animate-pulse"
            >
              <div className="w-9 h-9 rounded-xl bg-bg-hover flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="flex justify-between gap-4">
                  <div className="h-3.5 bg-bg-hover rounded w-1/3" />
                  <div className="h-3 bg-bg-hover rounded w-10" />
                </div>
                <div className="h-3 bg-bg-hover rounded w-full" />
                <div className="h-3 bg-bg-hover rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 bg-bg-panel border border-border-soft rounded-2xl flex items-center justify-center">
            <Bell size={24} className="text-text-muted/40" />
          </div>
          <p className="text-text-muted text-sm">Sin actividad registrada aún</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items }) => (
            <section key={label}>
              <h2 className="text-text-muted text-[11px] uppercase tracking-wider font-medium mb-3 capitalize">
                {label}
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <NotifItem key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
