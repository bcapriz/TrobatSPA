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
import type { Reporte, ReportePriority } from '../../../domain/models'
import { useReportesBandeja } from '../hooks/useReportesBandeja'
import { useValidarReporteMutation } from '../../mapa_investigacion/hooks/useValidarReporteMutation'
import { useReverseGeocode } from '../../../shared/hooks/useReverseGeocode'

const MAPS_MAP_ID = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) || 'DEMO_MAP_ID'

type Tab = 'todos' | 'pendientes' | 'prioritarios' | 'validados'

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

// ─── priority options ─────────────────────────────────────────────────────────

const PRIORITY_OPTIONS: { value: ReportePriority; label: string; btnClass: string }[] = [
  { value: 'high', label: 'Alta', btnClass: 'bg-priority-high hover:bg-priority-high/80 text-white' },
  { value: 'medium', label: 'Media', btnClass: 'bg-priority-low hover:bg-priority-low/80 text-white' },
  { value: 'discarded', label: 'Descartar', btnClass: 'border border-border-hard text-text-secondary hover:text-text-primary hover:bg-bg-hover' },
]

const PRIORITY_LABEL: Record<ReportePriority, string> = {
  high: 'Alta prioridad',
  medium: 'Media',
  discarded: 'Descartado',
}

const PRIORITY_CLASS: Record<ReportePriority, string> = {
  high: 'text-priority-high bg-priority-high/15 border-priority-high/25',
  medium: 'text-priority-low bg-priority-low/15 border-priority-low/25',
  discarded: 'text-text-muted bg-bg-hover border-border-soft',
}

// ─── detail panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  reporte: Reporte
  casoNombre: string
  onClose: () => void
}

function DetailPanel({ reporte, casoNombre, onClose }: DetailPanelProps) {
  const mutation = useValidarReporteMutation()
  const [pickingPriority, setPickingPriority] = useState(false)
  const [confirmRevert, setConfirmRevert] = useState(false)
  const [lng, lat] = reporte.location.coordinates
  const { data: direccion, isLoading: geocodingLoading } = useReverseGeocode(lat, lng)

  const handleValidar = (priority: ReportePriority) => {
    setPickingPriority(false)
    mutation.mutate({ id: reporte.id, validated: true, priority })
  }

  const handleRevertir = () => {
    setConfirmRevert(false)
    mutation.mutate({ id: reporte.id, validated: false, priority: null })
  }

  return (
    <div className="flex flex-col h-full border-l border-border-soft bg-bg-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-text-primary font-semibold text-sm">Detalle</span>
          {reporte.priority === 'high' && (
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
              <img src={reporte.photo_url} alt="Evidencia" className="w-full h-full object-cover" />
            </div>
          </a>
        ) : (
          <div className="w-full h-52 bg-bg-hover flex flex-col items-center justify-center gap-2">
            <Image size={24} className="text-text-muted/40" />
            <p className="text-text-muted text-xs">Sin foto</p>
          </div>
        )}

        <div className="p-4 space-y-4">
          <div>
            <p className="text-text-muted text-[11px] uppercase tracking-wide mb-1">Caso</p>
            <p className="text-text-primary text-sm font-medium">{casoNombre}</p>
          </div>

          <div>
            <p className="text-text-muted text-[11px] uppercase tracking-wide mb-1">Descripción</p>
            <p className="text-text-primary text-sm leading-relaxed">
              {reporte.description || 'Sin descripción'}
            </p>
          </div>

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
                  <span className="text-text-primary text-sm">{reporte.contact_info.phone}</span>
                </div>
              )}
              {reporte.security_metadata.anonymous && (
                <span className="inline-block text-[10px] text-text-muted border border-border-soft px-2 py-0.5 rounded-full">
                  Anónimo
                </span>
              )}
            </div>
          )}

          {/* Estado + prioridad */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                reporte.validated
                  ? 'bg-priority-low/15 text-priority-low border-priority-low/25'
                  : 'bg-bg-hover text-text-muted border-border-soft'
              }`}
            >
              {reporte.validated ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
              {reporte.validated ? 'Validado' : 'Pendiente'}
            </span>
            {reporte.priority && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${PRIORITY_CLASS[reporte.priority]}`}>
                {PRIORITY_LABEL[reporte.priority]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border-soft flex-shrink-0 space-y-2">
        {!reporte.validated ? (
          pickingPriority ? (
            <>
              <p className="text-text-muted text-xs mb-1">Seleccioná la prioridad:</p>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITY_OPTIONS.map(({ value, label, btnClass }) => (
                  <button
                    key={value}
                    onClick={() => handleValidar(value)}
                    disabled={mutation.isPending}
                    className={`py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${btnClass}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPickingPriority(false)}
                className="w-full py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setPickingPriority(true)}
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold bg-brand-base hover:bg-brand-dark text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <ShieldCheck size={14} />
              Validar reporte
            </button>
          )
        ) : confirmRevert ? (
          <div className="space-y-2">
            <p className="text-text-secondary text-xs">¿Revertir este reporte a pendiente?</p>
            <div className="flex gap-2">
              <button
                onClick={handleRevertir}
                disabled={mutation.isPending}
                className="flex-1 py-1.5 text-xs font-semibold bg-priority-high hover:bg-priority-high/80 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {mutation.isPending ? 'Procesando…' : 'Confirmar'}
              </button>
              <button
                onClick={() => setConfirmRevert(false)}
                className="flex-1 py-1.5 text-xs font-medium border border-border-soft text-text-secondary hover:bg-bg-hover rounded-md transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmRevert(true)}
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium border border-border-soft text-text-secondary hover:text-priority-high hover:border-priority-high/40 rounded-lg transition-colors disabled:opacity-50"
          >
            <ShieldOff size={14} />
            Revertir a pendiente
          </button>
        )}
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
  const dotColor = reporte.priority === 'high'
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
      <td className="px-4 py-3 w-10">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
      </td>

      <td className="px-2 py-3 max-w-0">
        <p className="text-text-primary text-sm truncate">
          {reporte.description || (
            <span className="text-text-muted italic">Sin descripción</span>
          )}
        </p>
      </td>

      <td className="px-4 py-3 w-40 hidden md:table-cell">
        <p className="text-text-secondary text-xs truncate">{casoNombre}</p>
      </td>

      <td className="px-4 py-3 w-24 text-right hidden sm:table-cell">
        <span className="text-text-muted text-xs whitespace-nowrap">
          {formatRelative(reporte.timestamp)}
        </span>
      </td>

      <td className="px-4 py-3 w-36">
        <div className="flex items-center gap-1.5 justify-end">
          {reporte.priority && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${PRIORITY_CLASS[reporte.priority]}`}>
              {PRIORITY_LABEL[reporte.priority].toUpperCase()}
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

  const { isLoading, isError, reportes, casos, casoNombres } = useReportesBandeja()

  const casosAbiertosIds = useMemo(
    () => new Set(casos.filter((c) => c.status === 'active_investigation').map((c) => c.id)),
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
        return list.filter((r) => r.priority === 'high')
      case 'validados':
        return list.filter((r) => r.validated)
      default:
        return list
    }
  }, [reportes, casosAbiertosIds, activeTab, casoIdFiltro])

  const visibleReportes = reportes.filter((r) => casosAbiertosIds.has(r.case_id))
  const selectedReporte = selectedId
    ? visibleReportes.find((r) => r.id === selectedId) ?? null
    : null

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos', count: visibleReportes.length },
    { key: 'pendientes', label: 'Pendientes', count: visibleReportes.filter((r) => !r.validated).length },
    { key: 'prioritarios', label: 'Prioritarios', count: visibleReportes.filter((r) => r.priority === 'high').length },
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
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="px-6 pt-6 pb-0 bg-bg-app flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-text-primary font-bold text-lg">Bandeja de reportes</h1>
            <div className="flex items-center gap-3">
              {isLoading && <Loader2 size={15} className="animate-spin text-text-muted" />}
              <select
                value={casoIdFiltro}
                onChange={(e) => { setCasoIdFiltro(e.target.value); setSelectedId(null) }}
                className="bg-bg-panel border border-border-soft rounded-lg px-3 py-1.5 text-text-secondary text-sm focus:outline-none focus:border-brand-base transition-colors"
              >
                <option value="">Todos los casos</option>
                {casos.map((c) => (
                  <option key={c.id} value={c.id}>{c.missing_person.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-1 border-b border-border-soft">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setSelectedId(null) }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === key
                    ? 'border-brand-base text-brand-base'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {label}
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === key ? 'bg-brand-base/20 text-brand-base' : 'bg-bg-hover text-text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="space-y-0 mt-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3.5 border-b border-border-soft animate-pulse">
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
                    ? 'No hay reportes de alta prioridad'
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
