import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { X, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import type { Caso, Reporte, ReportePriority } from '../../../domain/models'
import { useObtenerReportesCaso } from '../hooks/useObtenerReportesCaso'
import { useValidarReporteMutation } from '../../mapa_investigacion/hooks/useValidarReporteMutation'
import { MarkerPin } from '../../mapa_investigacion/components/MarkerPin'

const MAPS_MAP_ID = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) || 'DEMO_MAP_ID'

const PRIORITY_OPTIONS: { value: ReportePriority; label: string; btnClass: string }[] = [
  { value: 'high', label: 'Alta prioridad', btnClass: 'bg-priority-high hover:bg-priority-high/80 text-white' },
  { value: 'medium', label: 'Media', btnClass: 'bg-priority-low hover:bg-priority-low/80 text-white' },
  { value: 'discarded', label: 'Descartar', btnClass: 'border border-border-hard text-text-secondary hover:text-text-primary hover:bg-bg-hover' },
]

interface Props {
  caso: Caso | null
  isOpen: boolean
  onClose: () => void
}

export function ReportesCarouselModal({ caso, isOpen, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [localReportes, setLocalReportes] = useState<Reporte[]>([])
  const queryClient = useQueryClient()
  const { data: reportesData, isLoading, isError } = useObtenerReportesCaso(caso?.id ?? '')
  const mutation = useValidarReporteMutation()

  const reportes = localReportes

  useEffect(() => {
    if (isOpen && reportesData?.data) {
      setLocalReportes(reportesData.data)
      setCurrentIndex(0)
    }
  }, [isOpen, caso?.id, reportesData?.data])

  useEffect(() => {
    if (currentIndex >= reportes.length) {
      setCurrentIndex(Math.max(0, reportes.length - 1))
    }
  }, [currentIndex, reportes.length])

  if (!isOpen || !caso) return null

  const currentReporte = reportes[currentIndex]

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? reportes.length - 1 : prev - 1))
  const handleNext = () => setCurrentIndex((prev) => (prev === reportes.length - 1 ? 0 : prev + 1))
  const handleClose = () => { setCurrentIndex(0); onClose() }

  const removeFromCache = (reporteId: string) => {
    if (!caso) return
    queryClient.setQueryData(['reportes-caso', caso.id], (oldData: unknown) => {
      if (!oldData || typeof oldData !== 'object') return oldData
      const data = (oldData as { data?: Reporte[] }).data
      if (!Array.isArray(data)) return oldData
      return { ...(oldData as object), data: data.filter((r) => r.id !== reporteId) }
    })
  }

  const handleValidar = (priority: ReportePriority) => {
    if (!currentReporte) return
    if (!window.confirm(`¿Confirmás validar este reporte con prioridad "${priority === 'high' ? 'alta' : priority === 'medium' ? 'media' : 'descartado'}"?`)) return

    const currentId = currentReporte.id
    const currentLength = reportes.length

    setLocalReportes((prev) => prev.filter((r) => r.id !== currentId))
    setCurrentIndex((prev) => (prev >= currentLength - 1 ? 0 : prev))

    mutation.mutate(
      { id: currentId, validated: true, priority },
      {
        onError: () => queryClient.invalidateQueries({ queryKey: ['reportes-caso', caso.id], exact: true }),
        onSuccess: () => {
          removeFromCache(currentId)
          if (currentLength <= 1) handleClose()
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-panel border border-border-soft rounded-2xl max-w-[680px] w-full max-h-[88vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-soft">
          <div>
            <h2 className="text-text-primary font-bold text-lg">{caso.missing_person.name}</h2>
            <p className="text-text-muted text-xs mt-1">Reportes y avistamientos</p>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-bg-hover rounded-lg transition-colors">
            <X size={18} className="text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[76vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-brand-base" />
            </div>
          ) : isError ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-priority-high/10 border border-priority-high/20">
              <AlertCircle size={16} className="text-priority-high flex-shrink-0 mt-0.5" />
              <p className="text-sm text-priority-high">No se pudieron cargar los reportes</p>
            </div>
          ) : reportes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-text-muted text-sm">Sin reportes pendientes</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl overflow-hidden border border-border-soft bg-bg-hover">
                {currentReporte && (
                  <>
                    <div className="w-full h-56 overflow-hidden bg-bg-panel/70 flex items-center justify-center text-text-muted">
                      {currentReporte.photo_url ? (
                        <img src={currentReporte.photo_url} alt="Foto del reporte" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-medium">
                          Sin imagen disponible
                        </div>
                      )}
                    </div>

                    {reportes.length > 1 && (
                      <div className="flex items-center justify-between px-4 py-3">
                        <button onClick={handlePrev} className="p-3 bg-brand-base/90 hover:bg-brand-base text-white rounded-full shadow-lg transition-colors">
                          <ChevronLeft size={18} />
                        </button>
                        <button onClick={handleNext} className="p-3 bg-brand-base/90 hover:bg-brand-base text-white rounded-full shadow-lg transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}

                    <div className="p-6 space-y-5">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Caso</p>
                          <p className="text-text-primary font-semibold text-lg">{caso.missing_person.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Descripción</p>
                          <p className="text-text-secondary text-sm leading-6">
                            {currentReporte.description || 'Sin descripción'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Ubicación</p>
                          <div className="mt-1.5 rounded-lg overflow-hidden border border-border-soft" style={{ height: 160 }}>
                            <Map
                              style={{ width: '100%', height: '100%' }}
                              center={{
                                lat: currentReporte.location.coordinates[1],
                                lng: currentReporte.location.coordinates[0],
                              }}
                              zoom={15}
                              gestureHandling="none"
                              disableDefaultUI
                              colorScheme="DARK"
                              mapId={MAPS_MAP_ID}
                            >
                              <AdvancedMarker
                                position={{
                                  lat: currentReporte.location.coordinates[1],
                                  lng: currentReporte.location.coordinates[0],
                                }}
                              >
                                <MarkerPin reporte={currentReporte} />
                              </AdvancedMarker>
                            </Map>
                          </div>
                          <p className="text-text-muted text-xs font-mono mt-1">
                            {currentReporte.location.coordinates[1].toFixed(4)}, {currentReporte.location.coordinates[0].toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Fecha y hora</p>
                          <p className="text-text-secondary text-sm">
                            {new Date(currentReporte.timestamp).toLocaleString('es-AR', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Validar con prioridad */}
                      <div className="space-y-2">
                        <p className="text-xs text-text-muted uppercase tracking-wide font-medium">
                          Validar reporte como:
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {PRIORITY_OPTIONS.map(({ value, label, btnClass }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleValidar(value)}
                              disabled={mutation.isPending}
                              className={`py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${btnClass}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Counter */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  Reporte {currentIndex + 1} de {reportes.length}
                </span>
                <div className="flex gap-1">
                  {reportes.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex ? 'bg-brand-base w-6' : 'bg-border-soft hover:bg-border-hard'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border-soft flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-border-soft text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors font-medium text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
