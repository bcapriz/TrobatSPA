import { useState, useMemo } from 'react'
import { Plus, Search, FolderOpen, AlertCircle, RefreshCw } from 'lucide-react'
import type { Caso } from '../../../domain/models'
import { useListarCasos } from '../hooks/useListarCasos'
import { CasoCard } from '../components/CasoCard'
import { CrearCasoModal } from '../components/CrearCasoModal'
import { AsignarAgenteModal } from '../components/AsignarAgenteModal'
import { ReportesCarouselModal } from '../components/ReportesCarouselModal'

type Tab = 'activos' | 'cerrados' | 'mas_recientes'

function SkeletonCard() {
  return (
    <div className="bg-bg-panel border border-border-soft border-l-4 border-l-border-hard rounded-xl p-4 animate-pulse flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-bg-hover flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-bg-hover rounded w-1/3" />
        <div className="h-3 bg-bg-hover rounded w-2/3" />
      </div>
      <div className="w-16 h-7 bg-bg-hover rounded-lg flex-shrink-0" />
    </div>
  )
}

export function CasosView() {
  const [tab, setTab] = useState<Tab>('activos')
  const [busqueda, setBusqueda] = useState('')
  const [mostrarCrear, setMostrarCrear] = useState(false)
  const [casoParaAsignar, setCasoParaAsignar] = useState<Caso | null>(null)
  const [casoParaReportes, setCasoParaReportes] = useState<Caso | null>(null)

  const { data: queryData, isLoading, isError, refetch } = useListarCasos({ limit: 100 })

  const casosFiltrados = useMemo(() => {
    const todos = queryData?.data ?? []
    let filtered = todos

    if (tab === 'activos') {
      filtered = filtered.filter((c) => c.estado === 'investigacion_activa' || c.estado === 'suspendido')
    } else if (tab === 'cerrados') {
      filtered = filtered.filter((c) => c.estado === 'resuelto' || c.estado === 'cerrado')
    } else if (tab === 'mas_recientes') {
      filtered = filtered.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
    }

    // Aplicar búsqueda
    return filtered.filter(
      (c) =>
        !busqueda.trim() ||
        c.desaparecido.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  }, [queryData, tab, busqueda])

  const totalActivos = useMemo(
    () => (queryData?.data ?? []).filter((c) => c.estado === 'investigacion_activa').length,
    [queryData],
  )

  const TAB_CONFIG: { key: Tab; label: string }[] = [
    { key: 'activos', label: 'Activos' },
    { key: 'cerrados', label: 'Cerrados' },
    { key: 'mas_recientes', label: 'Más recientes' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary font-bold text-lg">Gestión de Casos</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {isLoading ? '—' : `${casosFiltrados.length} resultado${casosFiltrados.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setMostrarCrear(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-base hover:bg-brand-dark text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={15} />
          Nuevo caso
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full bg-bg-panel border border-border-soft rounded-lg pl-9 pr-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-base transition-colors text-sm"
          />
        </div>

        <div className="flex bg-bg-panel border border-border-soft rounded-lg overflow-hidden">
          {TAB_CONFIG.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-brand-base text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              {label}
              {key === 'activos' && !isLoading && totalActivos > 0 && (
                <span className="ml-2 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                  {totalActivos}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

        {isError && (
          <div className="flex items-center justify-between bg-bg-panel border border-border-soft rounded-xl p-5">
            <div className="flex items-center gap-3 text-text-secondary">
              <AlertCircle size={18} className="text-priority-high flex-shrink-0" />
              <span className="text-sm">No se pudo conectar con el servidor.</span>
            </div>
            <button
              onClick={() => void refetch()}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary border border-border-soft px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw size={13} />
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !isError && casosFiltrados.length === 0 && (
          <div className="bg-bg-panel border border-border-soft rounded-xl py-14 flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-bg-hover rounded-2xl flex items-center justify-center">
              <FolderOpen size={26} className="text-text-muted" />
            </div>
            <p className="text-text-primary font-medium">
              {busqueda
                ? 'Sin resultados para esa búsqueda'
                : `No hay casos ${tab === 'activos' ? 'activos' : 'cerrados'}`}
            </p>
            {!busqueda && tab === 'activos' && (
              <button
                onClick={() => setMostrarCrear(true)}
                className="text-brand-base text-sm hover:underline"
              >
                Crear el primer caso
              </button>
            )}
          </div>
        )}

        {!isLoading &&
          !isError &&
          casosFiltrados.map((caso) => (
            <div key={caso.id} onClick={() => setCasoParaReportes(caso)} className="cursor-pointer">
              <CasoCard caso={caso} onAsignar={setCasoParaAsignar} />
            </div>
          ))}
      </div>

      {mostrarCrear && <CrearCasoModal onClose={() => setMostrarCrear(false)} />}
      {casoParaAsignar && (
        <AsignarAgenteModal caso={casoParaAsignar} onClose={() => setCasoParaAsignar(null)} />
      )}
      <ReportesCarouselModal
        caso={casoParaReportes}
        isOpen={!!casoParaReportes}
        onClose={() => setCasoParaReportes(null)}
      />
    </div>
  )
}
