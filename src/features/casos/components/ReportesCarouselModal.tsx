import { useState, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import type { Caso, Reporte } from '../../../domain/models'
import { useObtenerReportesCaso } from '../hooks/useObtenerReportesCaso'

interface Props {
  caso: Caso | null
  isOpen: boolean
  onClose: () => void
}

export function ReportesCarouselModal({ caso, isOpen, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { data: reportesData, isLoading, isError } = useObtenerReportesCaso(caso?.id ?? '')

  const reportes = useMemo(() => reportesData?.data ?? [], [reportesData])

  if (!isOpen || !caso) return null

  const currentReporte = reportes[currentIndex]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? reportes.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === reportes.length - 1 ? 0 : prev + 1))
  }

  const handleClose = () => {
    setCurrentIndex(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-panel border border-border-soft rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-soft">
          <div>
            <h2 className="text-text-primary font-bold text-lg">{caso.desaparecido.nombre}</h2>
            <p className="text-text-muted text-xs mt-1">Reportes y avistamientos</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-bg-hover rounded-lg transition-colors"
          >
            <X size={18} className="text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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
              <p className="text-text-muted text-sm">Sin reportes aún</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Carousel */}
              <div className="relative bg-bg-hover rounded-xl overflow-hidden">
                <div className="aspect-video flex items-center justify-center">
                  {currentReporte && (
                    <div className="w-full h-full px-16 flex flex-col justify-center space-y-4 max-w-lg mx-auto">
                      <div className="space-y-2">
                        <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Ubicación</p>
                        <p className="text-text-primary font-semibold">
                          {currentReporte.location.coordinates[1].toFixed(4)}, {currentReporte.location.coordinates[0].toFixed(4)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Timestamp</p>
                        <p className="text-text-secondary text-sm">
                          {new Date(currentReporte.timestamp).toLocaleString('es-AR')}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Estado</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              currentReporte.validado ? 'bg-priority-low' : 'bg-brand-base'
                            }`}
                          />
                          <p className="text-text-primary text-sm">
                            {currentReporte.validado ? 'Validado' : 'Pendiente'}
                          </p>
                        </div>
                      </div>

                      {currentReporte.prioridad_policial && (
                        <div className="pt-2 border-t border-border-soft">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-priority-high bg-priority-high/15 border border-priority-high/25 px-2 py-1 rounded">
                            Prioridad policial
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation buttons */}
                {reportes.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-brand-base/80 hover:bg-brand-base text-white rounded-full transition-colors z-10"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-brand-base/80 hover:bg-brand-base text-white rounded-full transition-colors z-10"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Info y counter */}
              <div className="space-y-3">
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
            </div>
          )}
        </div>

        {/* Footer */}
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
