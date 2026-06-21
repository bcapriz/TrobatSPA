import { RotateCcw, Flag } from 'lucide-react'
import type { Reporte } from '../../../domain/models'
import { useMapaStore } from '../../../core/stores/mapaStore'

interface Props {
  reportes: Reporte[]
}

export function MapaFiltros({ reportes }: Props) {
  const soloPrioridad = useMapaStore((s) => s.soloPrioridad)
  const setSoloPrioridad = useMapaStore((s) => s.setSoloPrioridad)
  const soloValidados = useMapaStore((s) => s.soloValidados)
  const setSoloValidados = useMapaStore((s) => s.setSoloValidados)
  const soloPendientes = useMapaStore((s) => s.soloPendientes)
  const setSoloPendientes = useMapaStore((s) => s.setSoloPendientes)
  const ordenFecha = useMapaStore((s) => s.ordenFecha)
  const setOrdenFecha = useMapaStore((s) => s.setOrdenFecha)
  const reset = useMapaStore((s) => s.reset)

  const total = reportes.length
  const prioritarios = reportes.filter((r) => r.police_priority).length
  const validados = reportes.filter((r) => r.validated).length
  const pendientes = total - validados

  // Funciones de manejo exclusivas para cada filtro
  const handleTogglePrioridad = () => {
    const nuevoEstado = !soloPrioridad
    setSoloPrioridad(nuevoEstado)
    if (nuevoEstado) {
      setSoloValidados(false)
      setSoloPendientes(false)
    }
  }

  const handleToggleValidados = () => {
    const nuevoEstado = !soloValidados
    setSoloValidados(nuevoEstado)
    if (nuevoEstado) {
      setSoloPrioridad(false)
      setSoloPendientes(false)
    }
  }

  const handleTogglePendientes = () => {
    const nuevoEstado = !soloPendientes
    setSoloPendientes(nuevoEstado)
    if (nuevoEstado) {
      setSoloPrioridad(false)
      setSoloValidados(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-border-soft flex items-center justify-between">
        <h3 className="text-text-primary font-semibold text-sm">Filtros</h3>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <RotateCcw size={12} />
          Resetear
        </button>
      </div>

      <div className="p-4 space-y-5 flex-1">
        <div>
          <p className="text-text-muted text-[11px] uppercase tracking-wide font-medium mb-3">
            Resumen de zona
          </p>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Total pines" value={total} color="text-text-primary" />
            <StatTile label="Prioritarios" value={prioritarios} color="text-priority-high" />
            <StatTile label="Validados" value={validados} color="text-priority-low" />
            <StatTile label="Pendientes" value={pendientes} color="text-text-secondary" />
          </div>
        </div>

        <div>
          <p className="text-text-muted text-[11px] uppercase tracking-wide font-medium mb-3">
            Filtros avanzados
          </p>

          <div className="space-y-3">
            {/* SOLO PRIORITARIOS */}
            <div className="flex items-center justify-between bg-bg-hover rounded-lg px-3 py-1.5">
              <div className="flex items-center gap-2">
                <Flag size={14} className="text-priority-high" />
                <span className="text-text-primary text-sm">Solo prioritarios</span>
              </div>
              <button
                onClick={handleTogglePrioridad}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 flex items-center px-0.5 ${
                  soloPrioridad ? 'bg-brand-base' : 'bg-border-hard'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    soloPrioridad ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SOLO VALIDADOS */}
            <div className="flex items-center justify-between bg-bg-hover rounded-lg px-3 py-1.5">
              <div className="flex items-center gap-2">
                <Flag size={14} className="text-priority-low" />
                <span className="text-text-primary text-sm">Solo validados</span>
              </div>
              <button
                onClick={handleToggleValidados}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 flex items-center px-0.5 ${
                  soloValidados ? 'bg-brand-base' : 'bg-border-hard'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    soloValidados ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SOLO PENDIENTES */}
            <div className="flex items-center justify-between bg-bg-hover rounded-lg px-3 py-1.5">
              <div className="flex items-center gap-2">
                <Flag size={14} className="text-brand-base" />
                <span className="text-text-primary text-sm">Solo pendientes</span>
              </div>
              <button
                onClick={handleTogglePendientes}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 flex items-center px-0.5 ${
                  soloPendientes ? 'bg-brand-base' : 'bg-border-hard'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    soloPendientes ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* ORDENAR POR FECHA */}
            <div>
              <label className="block text-text-secondary text-xs mb-1.5">Ordenar por fecha</label>
              <select
                value={ordenFecha}
                onChange={(e) => setOrdenFecha(e.target.value as 'desc' | 'asc')}
                className="w-full bg-bg-hover border border-border-soft rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-base transition-colors"
              >
                <option value="desc">Más recientes primero</option>
                <option value="asc">Más antiguos primero</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <p className="text-text-muted text-[11px] uppercase tracking-wide font-medium mb-3">
            Leyenda
          </p>
          <div className="space-y-2">
            {[
              { color: 'bg-priority-high', label: 'Prioridad policial' },
              { color: 'bg-priority-low', label: 'Validado' },
              { color: 'bg-brand-base', label: 'Pendiente' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                <span className="text-text-secondary text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-bg-hover rounded-lg p-3">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-text-muted text-xs mt-0.5">{label}</p>
    </div>
  )
}