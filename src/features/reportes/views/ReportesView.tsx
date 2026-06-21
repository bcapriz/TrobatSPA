import { useMemo, useState } from 'react'
import {
  Flag,
  ShieldCheck,
  ShieldOff,
  Loader2,
  AlertCircle,
  MapPin,
  Phone,
  User,
  X,
  Image,
} from 'lucide-react'
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import type { Reporte } from '../../../domain/models'
import { useReportesBandeja } from '../hooks/useReportesBandeja'
import { useValidarReporteMutation } from '../../mapa_investigacion/hooks/useValidarReporteMutation'
import { useAsignarPrioridadMutation } from '../../casos/hooks/useAsignarPrioridadMutation'
import { useReverseGeocode } from '../../../shared/hooks/useReverseGeocode'

const MAPS_MAP_ID = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) || 'DEMO_MAP_ID'

// ─── types ────────────────────────────────────────────────────────────────────

type Tab = 'todos' | 'pendientes' | 'prioritarios' | 'validados'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  return `Hace ${Math.floor(hrs / 24)}d`
}

function formatFull(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── detail panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  reporte: Reporte
  casoNombre: string
  onClose: () => void
}

type ConfirmAction = 'asignarPrioridad' | 'quitarPrioridad' | 'quitarValidacion' | null

function DetailPanel({ reporte, casoNombre, onClose }: DetailPanelProps) {
  const validarMutation = useValidarReporteMutation()
  const prioridadMutation = useAsignarPrioridadMutation()
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [lng, lat] = reporte.location.coordinates
  const { data: direccion, isLoading: geocodingLoading } = useReverseGeocode(lat, lng)

  const isPending = validarMutation.isPending || prioridadMutation.isPending

  const handleConfirm = () => {
    if (!confirmAction) return
    setConfirmAction(null)

    if (confirmAction === 'asignarPrioridad') {
      prioridadMutation.mutate({
        id: reporte.id,
        payload: { police_priority: true, validated: true },
      })
    } else if (confirmAction === 'quitarPrioridad') {
      prioridadMutation.mutate({ id: reporte.id, payload: { police_priority: false } })
    } else if (confirmAction === 'quitarValidacion') {
      validarMutation.mutate(
        { id: reporte.id, validated: false },
        {
          onSuccess: () => {
            if (reporte.police_priority) {
              prioridadMutation.mutate({ id: reporte.id, payload: { police_priority: false } })
            }
          },
        },
      )
    }
  }

  const confirmLabels: Record<NonNullable<ConfirmAction>, string> = {
    asignarPrioridad: 'Asignar prioridad alta y validar automáticamente este reporte',
    quitarPrioridad: 'Quitar la prioridad alta de este reporte',
    quitarValidacion: 'Quitar la validación' + (reporte.police_priority ? ' y la prioridad alta' : '') + ' de este reporte',
  }

  return (
    <div className="flex flex-col h-full border-l border-border-soft bg-bg-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-text-primary font-semibold text-sm">Detalle</span>
          {reporte.police_priority && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-priority-high bg-priority-high/15 border border-priority-high/25 px-1.5 py-0.5 rounded-full">
              <Flag size={9} />
              ALTA
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Photo */}
        {reporte.photo_url ? (
          <a href={reporte.photo_url} target="_blank" rel="noreferrer" className="block">
            <div className="w-full h-52 bg-bg-hover overflow-hidden hover:opacity-90 transition-opacity">
              <img
                src={reporte.photo_url}
                alt="Evidencia"
                className="w-full h-full object-cover"
              />
            </div>
          </a>
        ) : (
          <div className="w-full h-52 bg-bg-hover flex flex-col items-center justify-center gap-2">
            <Image size={24} className="text-text-muted/40" />
            <p className="text-text-muted text-xs">Sin foto</p>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Caso */}
          <div>
            <p className="text-text-muted text-[11px] uppercase tracking-wide mb-1">Caso</p>
            <p className="text-text-primary text-sm font-medium">{casoNombre}</p>
          </div>

          {/* Descripción */}
          <div>
            <p className="text-text-muted text-[11px] uppercase tracking-wide mb-1">Descripción</p>
            <p className="text-text-primary text-sm leading-relaxed">
              {reporte.description || 'Sin descripción'}
            </p>
          </div>

          {/* Fecha y coords */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <MapPin size={13} className="text-text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-text-muted text-[11px] uppercase tracking-wide">Ubicación</p>
                {geocodingLoading ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Loader2 size={11} className="animate-spin text-text-muted" />
                    <span className="text-text-muted text-xs">Obteniendo dirección…</span>
                  </div>
                ) : direccion ? (
                  <>
                    <p className="text-text-primary text-sm leading-snug">{direccion}</p>
                    <p className="text-text-muted text-[11px] font-mono mt-0.5">
                      {lat.toFixed(6)}, {lng.toFixed(6)}
                    </p>
                  </>
                ) : (
                  <p className="text-text-primary text-sm font-mono">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            <p className="text-text-secondary text-xs">{formatFull(reporte.timestamp)}</p>
          </div>

          {/* Mapa de ubicación */}
          <div className="h-40 rounded-lg overflow-hidden border border-border-soft">
            <Map
              defaultCenter={{ lat, lng }}
              defaultZoom={15}
              mapId={MAPS_MAP_ID}
              gestureHandling="cooperative"
              disableDefaultUI
              clickableIcons={false}
            >
              <AdvancedMarker position={{ lat, lng }} />
            </Map>
          </div>

          {/* Contacto */}
          {(reporte.contact_info.name || reporte.contact_info.phone) && (
            <div className="bg-bg-hover rounded-lg p-3 space-y-1.5">
              <p className="text-text-muted text-[11px] uppercase tracking-wide">Contacto</p>
              {reporte.contact_info.name && (
                <div className="flex items-center gap-2">
                  <User size={12} className="text-text-muted" />
                  <span className="text-text-primary text-sm">{reporte.contact_info.name}</span>
                </div>
              )}
              {reporte.contact_info.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-text-muted" />
                  <span className="text-text-primary text-sm">
                    {reporte.contact_info.phone}
                  </span>
                </div>
              )}
              {reporte.security_metadata.anonymous && (
                <span className="inline-block text-[10px] text-text-muted border border-border-soft px-2 py-0.5 rounded-full">
                  Anónimo
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="p-4 border-t border-border-soft flex-shrink-0 space-y-2">

        {/* Confirmación inline */}
        {confirmAction && (
          <div className="bg-bg-hover border border-border-soft rounded-lg p-3 space-y-2">
            <p className="text-text-secondary text-xs leading-snug">
              {confirmLabels[confirmAction]}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 py-1.5 text-xs font-semibold bg-priority-high hover:bg-priority-high/80 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {isPending ? 'Procesando…' : 'Confirmar'}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                disabled={isPending}
                className="flex-1 py-1.5 text-xs font-medium border border-border-soft text-text-secondary hover:bg-bg-hover rounded-md transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Botón quitar / asignar prioridad */}
        {!confirmAction && (reporte.police_priority ? (
          <button
            onClick={() => setConfirmAction('quitarPrioridad')}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium border border-priority-high/40 text-priority-high hover:bg-priority-high/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Flag size={14} />
            Quitar prioridad alta
          </button>
        ) : (
          <button
            onClick={() => setConfirmAction('asignarPrioridad')}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium border border-border-soft text-text-secondary hover:text-priority-high hover:border-priority-high/40 rounded-lg transition-colors disabled:opacity-50"
          >
            <Flag size={14} />
            Asignar prioridad alta
          </button>
        ))}

        {/* Botón validar / quitar validación */}
        {!confirmAction && (reporte.validated ? (
          <button
            onClick={() => setConfirmAction('quitarValidacion')}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium border border-border-soft text-text-secondary hover:text-priority-high hover:border-priority-high/40 rounded-lg transition-colors disabled:opacity-50"
          >
            <ShieldOff size={14} />
            Quitar validación
          </button>
        ) : (
          <button
            onClick={() => validarMutation.mutate({ id: reporte.id, validated: true })}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold bg-priority-low hover:bg-priority-low/80 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <ShieldCheck size={14} />
            {validarMutation.isPending ? 'Procesando…' : 'Validar reporte'}
          </button>
        ))}

      </div>
    </div>
  )
}

// ─── report row ───────────────────────────────────────────────────────────────

interface ReporteRowProps {
  reporte: Reporte
  casoNombre: string
  isSelected: boolean
  onClick: () => void
}

function ReporteRow({ reporte, casoNombre, isSelected, onClick }: ReporteRowProps) {
  const dotColor = reporte.police_priority
    ? 'bg-priority-high'
    : reporte.validated
      ? 'bg-priority-low'
      : 'bg-brand-base'

  return (
    <tr
      onClick={onClick}
      className={`border-b border-border-soft cursor-pointer transition-colors ${
        isSelected ? 'bg-brand-base/10' : 'hover:bg-bg-hover'
      }`}
    >
      {/* Status */}
      <td className="px-4 py-3 w-10">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
      </td>

      {/* Descripción */}
      <td className="px-2 py-3 max-w-0">
        <p className="text-text-primary text-sm truncate">
          {reporte.description || (
            <span className="text-text-muted italic">Sin descripción</span>
          )}
        </p>
      </td>

      {/* Caso */}
      <td className="px-4 py-3 w-40 hidden md:table-cell">
        <p className="text-text-secondary text-xs truncate">{casoNombre}</p>
      </td>

      {/* Fecha */}
      <td className="px-4 py-3 w-24 text-right hidden sm:table-cell">
        <span className="text-text-muted text-xs whitespace-nowrap">
          {formatRelative(reporte.timestamp)}
        </span>
      </td>

      {/* Badges */}
      <td className="px-4 py-3 w-36">
        <div className="flex items-center gap-1.5 justify-end">
          {reporte.police_priority && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-priority-high bg-priority-high/15 border border-priority-high/25 px-1.5 py-0.5 rounded-full">
              <Flag size={8} />
              ALTA
            </span>
          )}
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
              reporte.validated
                ? 'text-priority-low bg-priority-low/15 border-priority-low/25'
                : 'text-text-muted bg-bg-hover border-border-soft'
            }`}
          >
            {reporte.validated ? 'VALIDADO' : 'PENDIENTE'}
          </span>
        </div>
      </td>
    </tr>
  )
}

// ─── main view ────────────────────────────────────────────────────────────────

export function ReportesView() {
  const [activeTab, setActiveTab] = useState<Tab>('todos')
  const [casoIdFiltro, setCasoIdFiltro] = useState<string>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { isLoading, isError, reportes, casos, casoNombres, totales } = useReportesBandeja()

  const casosAbiertosIds = useMemo(
    () => new Set(casos
      .filter((c) => c.status === 'active_investigation')
      .map((c) => c.id)
    ),
    [casos],
  )

  const reportesFiltrados = useMemo(() => {
    let list = [...reportes]
      .filter((r) => casosAbiertosIds.has(r.case_id))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (casoIdFiltro) list = list.filter((r) => r.case_id === casoIdFiltro)

    switch (activeTab) {
      case 'pendientes':
        return list.filter((r) => !r.validated)
      case 'prioritarios':
        return list.filter((r) => r.police_priority)
      case 'validados':
        return list.filter((r) => r.validated)
      default:
        return list
    }
  }, [reportes, casosAbiertosIds, activeTab, casoIdFiltro])

  // Buscar en todos los reportes visibles para que el panel no desaparezca
  // cuando el reporte cambia de estado y sale del filtro activo
  const visibleReportes = reportes.filter((r) => casosAbiertosIds.has(r.case_id))
  const selectedReporte = selectedId
    ? visibleReportes.find((r) => r.id === selectedId) ?? null
    : null

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos', count: visibleReportes.length },
    { key: 'pendientes', label: 'Pendientes', count: visibleReportes.filter((r) => !r.validated).length },
    { key: 'prioritarios', label: 'Prioritarios', count: visibleReportes.filter((r) => r.police_priority).length },
    { key: 'validados', label: 'Validados', count: visibleReportes.filter((r) => r.validated).length },
  ]

  const handleRowClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-text-secondary bg-bg-panel border border-border-soft rounded-xl px-5 py-4">
          <AlertCircle size={18} className="text-priority-high" />
          <span className="text-sm">No se pudieron cargar los reportes.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-0 h-full -m-6" style={{ minHeight: 'calc(100vh - 52px)' }}>
      {/* Left: table */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 pt-6 pb-0 bg-bg-app flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-text-primary font-bold text-lg">Bandeja de reportes</h1>
            <div className="flex items-center gap-3">
              {isLoading && <Loader2 size={15} className="animate-spin text-text-muted" />}
              <select
                value={casoIdFiltro}
                onChange={(e) => {
                  setCasoIdFiltro(e.target.value)
                  setSelectedId(null)
                }}
                className="bg-bg-panel border border-border-soft rounded-lg px-3 py-1.5 text-text-secondary text-sm focus:outline-none focus:border-brand-base transition-colors"
              >
                <option value="">Todos los casos</option>
                {casos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.missing_person.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border-soft">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key)
                  setSelectedId(null)
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === key
                    ? 'border-brand-base text-brand-base'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {label}
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === key
                      ? 'bg-brand-base/20 text-brand-base'
                      : 'bg-bg-hover text-text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="space-y-0 mt-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3.5 border-b border-border-soft animate-pulse"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-bg-hover" />
                  <div className="flex-1 h-3 bg-bg-hover rounded" />
                  <div className="w-24 h-3 bg-bg-hover rounded hidden md:block" />
                  <div className="w-14 h-3 bg-bg-hover rounded hidden sm:block" />
                  <div className="w-20 h-5 bg-bg-hover rounded" />
                </div>
              ))}
            </div>
          ) : reportesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-14 h-14 bg-bg-panel border border-border-soft rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} className="text-text-muted/50" />
              </div>
              <p className="text-text-muted text-sm">
                {activeTab === 'pendientes'
                  ? 'No hay reportes pendientes'
                  : activeTab === 'prioritarios'
                    ? 'No hay reportes prioritarios'
                    : activeTab === 'validados'
                      ? 'No hay reportes validados'
                      : 'No hay reportes aún'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-soft">
                  <th className="w-10" />
                  <th className="px-2 py-3 text-left text-text-muted text-[11px] uppercase tracking-wide font-medium">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left text-text-muted text-[11px] uppercase tracking-wide font-medium w-40 hidden md:table-cell">
                    Caso
                  </th>
                  <th className="px-4 py-3 text-right text-text-muted text-[11px] uppercase tracking-wide font-medium w-24 hidden sm:table-cell">
                    Fecha
                  </th>
                  <th className="px-4 py-3 w-36" />
                </tr>
              </thead>
              <tbody>
                {reportesFiltrados.map((reporte) => (
                  <ReporteRow
                    key={reporte.id}
                    reporte={reporte}
                    casoNombre={casoNombres[reporte.case_id] ?? 'Caso desconocido'}
                    isSelected={selectedId === reporte.id}
                    onClick={() => handleRowClick(reporte.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right: detail panel */}
      {selectedReporte && (
        <div className="w-[440px] flex-shrink-0 flex flex-col overflow-hidden border-l border-border-soft">
          <DetailPanel
            key={selectedReporte.id}
            reporte={selectedReporte}
            casoNombre={casoNombres[selectedReporte.case_id] ?? 'Caso desconocido'}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}
    </div>
  )
}
