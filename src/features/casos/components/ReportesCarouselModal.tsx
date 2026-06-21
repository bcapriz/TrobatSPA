import { useEffect, useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { X, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import type { Caso, Reporte } from '../../../domain/models'
import { useObtenerReportesCaso } from '../hooks/useObtenerReportesCaso'
import { useValidarReporteMutation } from '../../mapa_investigacion/hooks/useValidarReporteMutation'
import { useAsignarPrioridadMutation } from '../hooks/useAsignarPrioridadMutation'

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
  const validarMutation = useValidarReporteMutation()
  const prioridadMutation = useAsignarPrioridadMutation()

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

  const removeReporteFromCache = (reporteId: string) => {
    if (!caso) return
    const cacheKey = ['reportes-caso', caso.id]
    queryClient.setQueryData(cacheKey, (oldData: unknown) => {
      if (!oldData || typeof oldData !== 'object') return oldData
      const data = (oldData as { data?: Reporte[] }).data
      if (!Array.isArray(data)) return oldData

      return {
        ...(oldData as object),
        data: data.filter((reporte) => reporte.id !== reporteId),
      }
    })
  }

  const handleValidarReporte = () => {
    if (!currentReporte) return
    if (!window.confirm('¿Confirmás validar este reporte?')) return

    const currentId = currentReporte.id
    const currentLength = reportes.length

    setLocalReportes((prev) => prev.filter((reporte) => reporte.id !== currentId))
    setCurrentIndex((prevIndex) => (prevIndex >= currentLength - 1 ? 0 : prevIndex))

    validarMutation.mutate(
      { id: currentId, validated: true },
      {
        onError: () => {
          queryClient.invalidateQueries({ queryKey: ['reportes-caso', caso.id], exact: true })
        },
        onSuccess: () => {
          removeReporteFromCache(currentId)
          if (currentLength <= 1) {
            handleClose()
          }
        },
      },
    )
  }

  const handlePrioridadAlta = () => {
    if (!currentReporte) return
    if (!window.confirm('¿Confirmás asignar prioridad alta y validar automáticamente este reporte?')) return

    const currentId = currentReporte.id
    const currentLength = reportes.length

    setLocalReportes((prev) => prev.filter((reporte) => reporte.id !== currentId))
    setCurrentIndex((prevIndex) => (prevIndex >= currentLength - 1 ? 0 : prevIndex))

    prioridadMutation.mutate(
      {
        id: currentId,
        payload: { police_priority: true, validated: true },
      },
      {
        onError: () => {
          queryClient.invalidateQueries({ queryKey: ['reportes-caso', caso.id], exact: true })
        },
        onSuccess: () => {
          removeReporteFromCache(currentId)
          if (currentLength <= 1) {
            handleClose()
          }
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
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-bg-hover rounded-lg transition-colors"
          >
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
              {/* Carousel */}
              <div className="rounded-xl overflow-hidden border border-border-soft bg-bg-hover">
                {currentReporte && (
                  <>
                    <div className="relative">
                      <div className="w-full h-56 overflow-hidden bg-bg-panel/70 flex items-center justify-center text-text-muted">
                        {currentReporte.photo_url ? (
                          <img
                            src={currentReporte.photo_url}
                            alt="Foto del reporte"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-medium">
                            Sin imagen disponible
                          </div>
                        )}
                      </div>
                    </div>
                    {reportes.length > 1 && (
                      <div className="flex items-center justify-between px-4 py-3">
                        <button
                          onClick={handlePrev}
                          className="p-3 bg-brand-base/90 hover:bg-brand-base text-white rounded-full shadow-lg transition-colors"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={handleNext}
                          className="p-3 bg-brand-base/90 hover:bg-brand-base text-white rounded-full shadow-lg transition-colors"
                        >
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
                          <p className="text-text-primary font-semibold">
                            {currentReporte.location.coordinates[1].toFixed(4)}, {currentReporte.location.coordinates[0].toFixed(4)}
                          </p>
                          <p className="text-text-muted text-xs mt-1">
                            Dirección no disponible
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Fecha y hora</p>
                          <p className="text-text-secondary text-sm">
                            {new Date(currentReporte.timestamp).toLocaleString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-border-soft bg-bg-panel p-4">
                          <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Estado de validación</p>
                          <p className="mt-2 text-sm font-semibold text-text-primary">
                            {currentReporte.validated ? 'Validado' : 'Pendiente'}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border-soft bg-bg-panel p-4">
                          <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Prioridad</p>
                          <p className="mt-2 text-sm font-semibold text-text-primary">
                            {currentReporte.police_priority ? 'Prioridad alta' : 'No prioritario'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={handleValidarReporte}
                          disabled={validarMutation.isLoading || prioridadMutation.isLoading}
                          className="w-full sm:w-auto px-5 py-3 rounded-full bg-priority-low text-slate-900 font-semibold hover:bg-priority-low/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Validar reporte
                        </button>
                        <button
                          type="button"
                          onClick={handlePrioridadAlta}
                          disabled={currentReporte.police_priority || validarMutation.isLoading || prioridadMutation.isLoading}
                          className="w-full sm:w-auto px-5 py-3 rounded-full bg-priority-high text-white font-semibold hover:bg-priority-high/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Asignar prioridad alta
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Navigation buttons */}
                {reportes.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-brand-base/90 hover:bg-brand-base text-white rounded-full shadow-lg transition-colors z-10"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-brand-base/90 hover:bg-brand-base text-white rounded-full shadow-lg transition-colors z-10"
                    >
                      <ChevronRight size={20} />
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
