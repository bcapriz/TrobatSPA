import { FolderOpen, FileText, Flag, Users, Loader2, AlertCircle, ShieldOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Caso, EstadoCaso, Reporte } from '../../../domain/models'
import { useDashboardData } from '../hooks/useDashboardData'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `Hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  return `Hace ${Math.floor(hrs / 24)}d`
}

function formatShort(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const ESTADO_META: Record<EstadoCaso, { label: string; bg: string; text: string; bar: string }> = {
  active_investigation: {
    label: 'Activa',
    bg: 'bg-brand-base/15',
    text: 'text-brand-base',
    bar: 'bg-brand-base',
  },
  resolved: {
    label: 'Resuelto',
    bg: 'bg-priority-low/15',
    text: 'text-priority-low',
    bar: 'bg-priority-low',
  },
  closed: {
    label: 'Cerrado',
    bg: 'bg-border-soft',
    text: 'text-text-muted',
    bar: 'bg-text-muted',
  },
}

// ─── sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-bg-panel border border-border-soft rounded-xl p-5 animate-pulse">
      <div className="w-10 h-10 bg-bg-hover rounded-lg mb-4" />
      <div className="h-8 w-16 bg-bg-hover rounded mb-2" />
      <div className="h-3 w-24 bg-bg-hover rounded" />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  Icon: React.ComponentType<{ size: number; className?: string }>
  iconColor: string
  note?: string
}

function StatCard({ label, value, Icon, iconColor, note }: StatCardProps) {
  return (
    <div className="bg-bg-panel border border-border-soft rounded-xl p-5">
      <div className="w-10 h-10 bg-bg-hover rounded-lg flex items-center justify-center mb-4">
        <Icon size={18} className={iconColor} />
      </div>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
      <p className="text-text-secondary text-sm mt-1">{label}</p>
      {note && <p className="text-text-muted text-xs mt-1">{note}</p>}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: EstadoCaso }) {
  const meta = ESTADO_META[estado]
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  )
}

function CasosRecientes({ casos }: { casos: Caso[] }) {
  const navigate = useNavigate()

  if (casos.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-text-muted text-sm">
        No hay casos registrados aún
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {casos.map((caso) => (
        <button
          key={caso.id}
          onClick={() => navigate('/casos')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-hover transition-colors text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center flex-shrink-0 group-hover:bg-bg-app transition-colors">
            <FolderOpen size={14} className="text-brand-base" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-sm font-medium truncate">
              {caso.missing_person.name}
            </p>
            <p className="text-text-muted text-xs">{formatShort(caso.created_at)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-text-muted text-xs">{caso.assigned_agents.length} ag.</span>
            <EstadoBadge estado={caso.status} />
          </div>
        </button>
      ))}
    </div>
  )
}

function AlertasActivas({ reportes }: { reportes: Reporte[] }) {
  if (reportes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-text-muted text-sm">
        <ShieldOff size={18} className="text-text-muted/50" />
        Sin alertas activas
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {reportes.map((r) => (
        <div
          key={r.id}
          className="flex items-start gap-2.5 px-3 py-2.5 bg-priority-high/8 border border-priority-high/20 rounded-lg"
        >
          <Flag size={13} className="text-priority-high mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-xs font-medium leading-relaxed line-clamp-2">
              {r.description || 'Sin descripción'}
            </p>
            <p className="text-text-muted text-[11px] mt-1">{formatRelative(r.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReportesRecientes({ reportes }: { reportes: Reporte[] }) {
  if (reportes.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-text-muted text-sm">
        No hay reportes aún
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {reportes.map((r) => (
        <div
          key={r.id}
          className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <div
            className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
              r.police_priority
                ? 'bg-priority-high'
                : r.validated
                  ? 'bg-priority-low'
                  : 'bg-brand-base'
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-xs leading-relaxed line-clamp-1">
              {r.description || 'Sin descripción'}
            </p>
            <p className="text-text-muted text-[11px] mt-0.5">{formatRelative(r.timestamp)}</p>
          </div>
          {r.police_priority && (
            <span className="text-[9px] font-bold text-priority-high bg-priority-high/15 border border-priority-high/25 px-1.5 py-0.5 rounded-full flex-shrink-0">
              ALTA
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function EstadoDistribucion({
  estadosCount,
  total,
}: {
  estadosCount: ReturnType<typeof useDashboardData>['estadosCount']
  total: number
}) {
  const items = [
    { key: 'active_investigation' as EstadoCaso, count: estadosCount.active_investigation },
    { key: 'resolved' as EstadoCaso, count: estadosCount.resolved },
    { key: 'closed' as EstadoCaso, count: estadosCount.closed },
  ].filter((i) => i.count > 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-text-muted text-sm">
        Sin datos
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map(({ key, count }) => {
        const meta = ESTADO_META[key]
        const pct = Math.round((count / total) * 100)
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-text-secondary text-xs">{meta.label}</span>
              <span className="text-text-muted text-xs font-medium">
                {count} · {pct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-hover overflow-hidden">
              <div
                className={`h-full rounded-full ${meta.bar} transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── main view ────────────────────────────────────────────────────────────────

export function DashboardView() {
  const {
    isLoading,
    isError,
    casosActivos,
    reportesPendientes,
    reportesPrioritarios,
    agentesUnicos,
    estadosCount,
    casosRecientes,
    reportesRecientes,
    alertasActivas,
    totalCasos,
    totalReportes,
  } = useDashboardData()

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-text-secondary bg-bg-panel border border-border-soft rounded-xl px-5 py-4">
          <AlertCircle size={18} className="text-priority-high" />
          <span className="text-sm">No se pudo cargar el dashboard. Reintentá más tarde.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Casos activos"
              value={casosActivos}
              Icon={FolderOpen}
              iconColor="text-brand-base"
              note={`${totalCasos} total`}
            />
            <StatCard
              label="Reportes pendientes"
              value={reportesPendientes}
              Icon={FileText}
              iconColor="text-badge-red"
              note={`${totalReportes} total`}
            />
            <StatCard
              label="Prioritarios"
              value={reportesPrioritarios}
              Icon={Flag}
              iconColor="text-yellow-400"
              note={reportesPrioritarios > 0 ? 'Requieren atención' : 'Sin alertas activas'}
            />
            <StatCard
              label="Agentes asignados"
              value={agentesUnicos}
              Icon={Users}
              iconColor="text-priority-low"
              note="Únicos en todos los casos"
            />
          </>
        )}
      </div>

      {/* Row 2: casos recientes + alertas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-bg-panel border border-border-soft rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-semibold text-sm">Casos recientes</h3>
            {isLoading && <Loader2 size={13} className="animate-spin text-text-muted" />}
          </div>
          <CasosRecientes casos={casosRecientes} />
        </div>

        <div className="bg-bg-panel border border-border-soft rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-semibold text-sm">Alertas activas</h3>
            {alertasActivas.length > 0 && (
              <span className="text-[10px] font-bold text-priority-high bg-priority-high/15 border border-priority-high/25 px-2 py-0.5 rounded-full">
                {alertasActivas.length}
              </span>
            )}
          </div>
          <AlertasActivas reportes={alertasActivas} />
        </div>
      </div>

      {/* Row 3: reportes recientes + distribución */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-bg-panel border border-border-soft rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-semibold text-sm">Actividad reciente</h3>
            {isLoading && <Loader2 size={13} className="animate-spin text-text-muted" />}
          </div>
          <ReportesRecientes reportes={reportesRecientes} />
        </div>

        <div className="bg-bg-panel border border-border-soft rounded-xl p-5">
          <h3 className="text-text-primary font-semibold text-sm mb-4">Estado de casos</h3>
          <EstadoDistribucion estadosCount={estadosCount} total={totalCasos} />
        </div>
      </div>
    </div>
  )
}
