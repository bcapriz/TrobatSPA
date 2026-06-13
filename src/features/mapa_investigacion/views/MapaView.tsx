import { useMemo, useState } from 'react'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { Loader2, AlertCircle, MapPin, Terminal, Search, X } from 'lucide-react'
import type { Reporte } from '../../../domain/models'
import { useObtenerReportes } from '../hooks/useObtenerReportes'
import { useListarCasos } from '../../casos/hooks/useListarCasos'
import { useMapaStore } from '../../../core/stores/mapaStore'
import { MarkerPin } from '../components/MarkerPin'
import { ReportePanel } from '../components/ReportePanel'
import { MapaFiltros } from '../components/MapaFiltros'

const MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? ''
const MAPS_MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) || 'DEMO_MAP_ID'

const BUENOS_AIRES = { lat: -34.6037, lng: -58.3816 }

export function MapaView() {
  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null)
  const [searchCaso, setSearchCaso] = useState('')

  const casoIdFiltro = useMapaStore((s) => s.casoIdFiltro)
  const setCasoIdFiltro = useMapaStore((s) => s.setCasoIdFiltro)
  const soloPrioridad = useMapaStore((s) => s.soloPrioridad)
  const soloValidados = useMapaStore((s) => s.soloValidados)
  const soloPendientes = useMapaStore((s) => s.soloPendientes)
  const ordenFecha = useMapaStore((s) => s.ordenFecha)

  const { data: reportesData, isLoading, isError } = useObtenerReportes()
  const { data: casosData } = useListarCasos({ limit: 50 })

  const casos = useMemo(() => {
    // Excluir reportes de casos cerrados
    const allCasos = (casosData?.data ?? []).filter(
      (c) => c.estado !== 'cerrado'
    )
    
    // Filtrar por búsqueda
    const filtered = searchCaso.trim()
      ? allCasos.filter((c) =>
          c.desaparecido.nombre.toLowerCase().includes(searchCaso.toLowerCase())
        )
      : allCasos
    
    // Ordenar por fecha más reciente y limitar a 4
    return filtered
      .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
      .slice(0, 4)
  }, [casosData, searchCaso])

  const casoNombres = useMemo(
    () => Object.fromEntries((casosData?.data ?? []).map((c) => [c.id, c.desaparecido.nombre])),
    [casosData],
  )

  const reportesFiltrados = useMemo(() => {

    // Excluir reportes de casos cerrados
    const casosActivosIds = new Set(
      (casosData?.data ?? [])
        .filter((c) => c.estado !== 'cerrado')
        .map((c) => c.id)
    )

    let result = (reportesData?.data ?? []).filter(
      (r) => casosActivosIds.has(r.caso_id)
    )

    if (soloPrioridad) {
      result = result.filter((r) => r.prioridad_policial)
    }

    if (soloValidados) {
      result = result.filter((r) => r.validado)
    }

    if (soloPendientes) {
      result = result.filter((r) => !r.validado)
    }

    return [...result].sort((a, b) => {
      const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      return ordenFecha === 'desc' ? -diff : diff
    })
  }, [reportesData, soloPrioridad, soloValidados, soloPendientes, ordenFecha])

  const handleMarkerClick = (reporte: Reporte) => {
    setSelectedReporte((prev) => (prev?.id === reporte.id ? null : reporte))
  }

  return (
    <div className="-m-6 flex flex-col" style={{ height: 'calc(100vh - 52px)' }}>
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-border-soft bg-bg-panel flex-shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchCaso}
            onChange={(e) => setSearchCaso(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full bg-bg-hover border border-border-soft rounded-lg px-3 py-2 pl-9 pr-8 text-text-primary text-sm placeholder-text-muted/50 focus:outline-none focus:border-brand-base transition-colors"
          />
          {searchCaso && (
            <button
              onClick={() => setSearchCaso('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-bg-panel rounded transition-colors"
            >
              <X size={14} className="text-text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Filter chips row */}
      <div className="flex items-center gap-2 px-4 h-12 border-b border-border-soft bg-bg-panel overflow-x-auto flex-shrink-0">
        <span className="text-text-muted text-xs font-medium flex-shrink-0">Caso:</span>

        <button
          onClick={() => setCasoIdFiltro(null)}
          className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
            !casoIdFiltro
              ? 'bg-brand-base text-white border-brand-base'
              : 'text-text-secondary border-border-soft hover:border-border-hard hover:text-text-primary'
          }`}
        >
          Todos
        </button>

        {casos.map((caso) => (
          <button
            key={caso.id}
            onClick={() => setCasoIdFiltro(caso.id)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
              casoIdFiltro === caso.id
                ? 'bg-brand-base text-white border-brand-base'
                : 'text-text-secondary border-border-soft hover:border-border-hard hover:text-text-primary'
            }`}
          >
            {caso.desaparecido.nombre}
          </button>
        ))}

        <div className="ml-auto flex-shrink-0 flex items-center gap-2">
          {isLoading && <Loader2 size={13} className="animate-spin text-text-muted" />}
          {!isLoading && (
            <span className="text-xs font-semibold text-brand-base bg-brand-base/15 border border-brand-base/25 px-2.5 py-0.5 rounded-full">
              {reportesFiltrados.length} pines activos
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative bg-bg-hover">
          {isError && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-bg-app/80">
              <div className="flex items-center gap-3 text-text-secondary bg-bg-panel border border-border-soft rounded-xl px-5 py-4">
                <AlertCircle size={18} className="text-priority-high" />
                <span className="text-sm">No se pudieron cargar los reportes.</span>
              </div>
            </div>
          )}

          {!MAPS_API_KEY ? (
            <div className="absolute inset-0 flex items-center justify-center bg-bg-app">
              <div className="max-w-sm w-full mx-6 space-y-5">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-base/10 border border-brand-base/25 flex items-center justify-center">
                    <MapPin size={26} className="text-brand-base" />
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold">Mapa no configurado</p>
                    <p className="text-text-muted text-sm mt-1">
                      Necesitás una clave de Google Maps para visualizar los reportes.
                    </p>
                  </div>
                </div>

                <div className="bg-bg-panel border border-border-soft rounded-xl p-4 space-y-3 text-sm">
                  <p className="text-text-secondary font-medium">Cómo configurarlo:</p>
                  <ol className="space-y-2 text-text-muted">
                    <li className="flex gap-2">
                      <span className="text-brand-base font-bold flex-shrink-0">1.</span>
                      <span>
                        Ir a{' '}
                        <span className="text-text-secondary font-mono text-xs">
                          console.cloud.google.com
                        </span>{' '}
                        → <strong className="text-text-primary">Maps JavaScript API</strong> → Habilitar
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-brand-base font-bold flex-shrink-0">2.</span>
                      <span>Crear una API Key en <strong className="text-text-primary">Credenciales</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-brand-base font-bold flex-shrink-0">3.</span>
                      <span>Pegar la clave en <strong className="text-text-primary">.env.local</strong></span>
                    </li>
                  </ol>
                  <div className="bg-bg-hover rounded-lg px-3 py-2 flex items-start gap-2">
                    <Terminal size={13} className="text-text-muted mt-0.5 flex-shrink-0" />
                    <code className="text-brand-base text-xs break-all">
                      VITE_GOOGLE_MAPS_API_KEY=tu_clave_aquí
                    </code>
                  </div>
                  <p className="text-text-muted text-xs">
                    Reiniciá el servidor de desarrollo después de guardar.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <APIProvider apiKey={MAPS_API_KEY}>
              <Map
                style={{ width: '100%', height: '100%' }}
                defaultCenter={BUENOS_AIRES}
                defaultZoom={12}
                gestureHandling="greedy"
                disableDefaultUI={false}
                colorScheme="DARK"
                mapId={MAPS_MAP_ID}
              >
                {reportesFiltrados.map((reporte) => {
                  const [lng, lat] = reporte.location.coordinates
                  return (
                    <AdvancedMarker
                      key={reporte.id}
                      position={{ lat, lng }}
                      onClick={() => handleMarkerClick(reporte)}
                      zIndex={reporte.prioridad_policial ? 10 : 1}
                    >
                      <MarkerPin reporte={reporte} />
                    </AdvancedMarker>
                  )
                })}
              </Map>
            </APIProvider>
          )}
        </div>

        {/* Right panel */}
        <div className="w-[300px] flex-shrink-0 bg-bg-panel border-l border-border-soft overflow-hidden">
          {selectedReporte ? (
            <ReportePanel
              reporte={selectedReporte}
              casoNombre={casoNombres[selectedReporte.caso_id] ?? 'Caso desconocido'}
              onClose={() => setSelectedReporte(null)}
            />
          ) : (
            <MapaFiltros reportes={reportesFiltrados} />
          )}
        </div>
      </div>
    </div>
  )
}
