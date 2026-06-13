import { useRef, useState } from 'react'
import { FileText, Users, UserPlus, ChevronDown } from 'lucide-react'
import type { Caso, EstadoCaso } from '../../../domain/models'
import { useActualizarEstadoCasoMutation } from '../hooks/useCerrarCasoMutation'

// ─── meta ─────────────────────────────────────────────────────────────────────

const ESTADO_BORDER: Record<EstadoCaso, string> = {
  investigacion_activa: 'border-l-brand-base',
  suspendido: 'border-l-yellow-500',
  resuelto: 'border-l-priority-low',
  cerrado: 'border-l-border-hard',
}

const ESTADO_PILL: Record<EstadoCaso, { bg: string; label: string }> = {
  investigacion_activa: { bg: 'bg-brand-base/15 text-brand-base border-brand-base/25', label: 'Activo' },
  suspendido: { bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', label: 'Suspendido' },
  resuelto: { bg: 'bg-priority-low/15 text-priority-low border-priority-low/25', label: 'Resuelto' },
  cerrado: { bg: 'bg-border-hard/30 text-text-muted border-border-hard', label: 'Cerrado' },
}

const TRANSICIONES: Partial<Record<EstadoCaso, { estado: EstadoCaso; label: string; danger?: boolean }[]>> = {
  investigacion_activa: [
    { estado: 'suspendido', label: 'Suspender caso' },
    { estado: 'resuelto', label: 'Marcar como resuelto' },
    { estado: 'cerrado', label: 'Cerrar caso', danger: true },
  ],
  suspendido: [
    { estado: 'investigacion_activa', label: 'Reactivar' },
    { estado: 'cerrado', label: 'Cerrar caso', danger: true },
  ],
  resuelto: [
    { estado: 'cerrado', label: 'Cerrar caso', danger: true },
  ],
}

const AVATAR_COLORS = ['bg-[#6c63ff]', 'bg-[#22c55e]', 'bg-[#3b82f6]', 'bg-[#f59e0b]', 'bg-[#ec4899]']

function getAvatarColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx] ?? 'bg-brand-base'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── estado dropdown ──────────────────────────────────────────────────────────

function EstadoMenu({ caso }: { caso: Caso }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const mutation = useActualizarEstadoCasoMutation()
  const opciones = TRANSICIONES[caso.estado]

  if (!opciones) return null

  const handleSelect = (estado: EstadoCaso) => {
    setOpen(false)
    mutation.mutate({ id: caso.id, estado })
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        disabled={mutation.isPending}
        className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary border border-border-soft hover:border-border-hard px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? '…' : 'Estado'}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* backdrop to close on outside click */}
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpen(false) }} />
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-bg-panel border border-border-soft rounded-xl shadow-xl z-20 py-1 overflow-hidden">
            {opciones.map(({ estado, label, danger }) => (
              <button
                key={estado}
                onClick={(e) => { e.stopPropagation(); handleSelect(estado) }}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                  danger
                    ? 'text-priority-high hover:bg-priority-high/10'
                    : 'text-text-primary hover:bg-bg-hover'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── card ─────────────────────────────────────────────────────────────────────

interface CasoCardProps {
  caso: Caso
  onAsignar: (caso: Caso) => void
}

export function CasoCard({ caso, onAsignar }: CasoCardProps) {
  const { desaparecido, estado, total_reportes, agentes_asignados, fecha_creacion } = caso
  const pill = ESTADO_PILL[estado]
  const initials = desaparecido.nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={`bg-bg-panel border border-border-soft border-l-4 ${ESTADO_BORDER[estado]} rounded-xl p-4 flex items-center gap-4 hover:border-border-hard transition-colors`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
          estado === 'cerrado' ? 'bg-text-muted' : getAvatarColor(desaparecido.nombre)
        }`}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-primary font-semibold text-sm">{desaparecido.nombre}</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pill.bg}`}>
            {pill.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
          {desaparecido.descripcion && (
            <span className="truncate max-w-[280px]">{desaparecido.descripcion}</span>
          )}
          <span>·</span>
          <span>{formatDate(fecha_creacion)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1 text-text-muted text-xs">
          <FileText size={13} />
          <span>{total_reportes}</span>
        </div>
        <div className="flex items-center gap-1 text-text-muted text-xs">
          <Users size={13} />
          <span>{agentes_asignados.length}</span>
        </div>

        <EstadoMenu caso={caso} />

        {estado === 'investigacion_activa' && (
          <button
            onClick={(e) => { e.stopPropagation(); onAsignar(caso) }}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary border border-border-soft hover:border-border-hard px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <UserPlus size={13} />
            Asignar
          </button>
        )}
      </div>
    </div>
  )
}
