import { X, MapPin, Clock, ShieldCheck, ShieldOff, Flag, Loader2 } from 'lucide-react'
import type { Reporte } from '../../../domain/models'
import { useValidarReporteMutation } from '../hooks/useValidarReporteMutation'
import { useReverseGeocode } from '../../../shared/hooks/useReverseGeocode'

interface Props {
  reporte: Reporte
  casoNombre: string
  onClose: () => void
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ReportePanel({ reporte, casoNombre, onClose }: Props) {
  const mutation = useValidarReporteMutation()

  const [lng, lat] = reporte.location.coordinates
  const { data: direccion, isLoading: geocodingLoading } = useReverseGeocode(lat, lng)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-text-primary font-semibold text-sm">Detalle del reporte</h3>
          {reporte.police_priority && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-priority-high bg-priority-high/15 border border-priority-high/25 px-1.5 py-0.5 rounded-full">
              <Flag size={9} />
              PRIORITARIO
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
        {reporte.photo_url && (
          <div className="w-full aspect-video bg-bg-hover overflow-hidden">
            <img
              src={reporte.photo_url}
              alt="Evidencia fotográfica"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {!reporte.photo_url && (
          <div className="w-full aspect-video bg-bg-hover flex items-center justify-center">
            <p className="text-text-muted text-sm">Sin foto adjunta</p>
          </div>
        )}

        <div className="p-4 space-y-4">
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide mb-1 font-medium">
              Desaparecido
            </p>
            <p className="text-text-primary text-sm leading-relaxed">
              {casoNombre || 'Caso desconocido'}
            </p>
          </div>

          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide mb-1 font-medium">
              Descripción
            </p>
            <p className="text-text-primary text-sm leading-relaxed">
              {reporte.description || 'Sin descripción'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Clock size={13} className="text-text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-text-muted text-[11px] uppercase tracking-wide">Fecha</p>
                <p className="text-text-primary text-sm">{formatDateTime(reporte.timestamp)}</p>
              </div>
            </div>

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
          </div>

          {reporte.contact_info.name && (
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-wide mb-1 font-medium">
                Contacto
              </p>
              <p className="text-text-primary text-sm">{reporte.contact_info.name}</p>
              {reporte.contact_info.phone && (
                <p className="text-text-muted text-xs">{reporte.contact_info.phone}</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                reporte.validated
                  ? 'bg-priority-low/15 text-priority-low border-priority-low/25'
                  : 'bg-bg-hover text-text-muted border-border-soft'
              }`}
            >
              {reporte.validated ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
              {reporte.validated ? 'Validado' : 'Pendiente'}
            </div>

            {reporte.security_metadata.anonymous && (
              <span className="text-xs text-text-muted border border-border-soft px-2 py-0.5 rounded-full">
                Anónimo
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border-soft space-y-2 flex-shrink-0">
        {!reporte.validated ? (
          <button
            onClick={() => mutation.mutate({ id: reporte.id, validated: true })}
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold bg-priority-low hover:bg-priority-low/80 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <ShieldCheck size={14} />
            {mutation.isPending ? 'Procesando...' : 'Validar reporte'}
          </button>
        ) : (
          <button
            onClick={() => mutation.mutate({ id: reporte.id, validated: false })}
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium border border-border-soft text-text-secondary hover:text-priority-high hover:border-priority-high/40 rounded-lg transition-colors disabled:opacity-50"
          >
            <ShieldOff size={14} />
            {mutation.isPending ? 'Procesando...' : 'Quitar validación'}
          </button>
        )}
      </div>
    </div>
  )
}
