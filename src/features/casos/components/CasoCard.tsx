import { useRef, useState } from 'react'
import { FileText, Users, UserPlus, ChevronDown, Pencil } from 'lucide-react'
import type { Caso, EstadoCaso } from '../../../domain/models'
import { useActualizarEstadoCasoMutation } from '../hooks/useCerrarCasoMutation'

// ─── meta ─────────────────────────────────────────────────────────────────────

const ESTADO_BORDER: Record<EstadoCaso, string> = {
  active_investigation: 'border-l-brand-base',
  resolved: 'border-l-priority-low',
  closed: 'border-l-border-hard',
}

const ESTADO_PILL: Record<EstadoCaso, { bg: string; label: string }> = {
  active_investigation: { bg: 'bg-brand-base/15 text-brand-base border-brand-base/25', label: 'Activo' },
  resolved: { bg: 'bg-priority-low/15 text-priority-low border-priority-low/25', label: 'Resuelto' },
  closed: { bg: 'bg-border-hard/30 text-text-muted border-border-hard', label: 'Cerrado' },
}

const TRANSICIONES: Partial<Record<EstadoCaso, { status: EstadoCaso; label: string; danger?: boolean }[]>> = {
  active_investigation: [
    { status: 'resolved', label: 'Marcar como resuelto' },
    { status: 'closed', label: 'Cerrar caso', danger: true },
  ],
  resolved: [
    { status: 'active_investigation', label: 'Reactivar' },
    { status: 'closed', label: 'Cerrar caso', danger: true },
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
  const opciones = TRANSICIONES[caso.status]

  if (!opciones) return null

  const handleSelect = (status: EstadoCaso) => {
    setOpen(false)
    mutation.mutate({ id: caso.id, status })
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
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpen(false) }} />
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-bg-panel border border-border-soft rounded-xl shadow-xl z-20 py-1 overflow-hidden">
            {opciones.map(({ status, label, danger }) => (
              <button
                key={status}
                onClick={(e) => { e.stopPropagation(); handleSelect(status) }}
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
  onReactivar: (caso: Caso) => void
  onEditar: (caso: Caso) => void
}

export function CasoCard({ caso, onAsignar, onReactivar, onEditar }: CasoCardProps) {
  const { missing_person, status, total_reports, assigned_agents, created_at } = caso
  const pill = ESTADO_PILL[status] ?? { bg: 'bg-border-hard/30 text-text-muted border-border-hard', label: status }
  const initials = missing_person.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={`bg-bg-panel border border-border-soft border-l-4 ${ESTADO_BORDER[status] ?? 'border-l-border-hard'} rounded-xl p-4 flex items-center gap-4 hover:border-border-hard transition-colors`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
          status === 'closed' ? 'bg-text-muted' : getAvatarColor(missing_person.name)
        }`}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-primary font-semibold text-sm">{missing_person.name}</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pill.bg}`}>
            {pill.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
          {missing_person.description && (
            <span className="truncate max-w-[280px]">{missing_person.description}</span>
          )}
          <span>·</span>
          <span>{formatDate(created_at)}</span>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onEditar(caso) }}
        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-base hover:bg-brand-dark px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
      >
        <Pencil size={12} />
        Editar caso
      </button>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1 text-text-muted text-xs">
          <FileText size={13} />
          <span>{total_reports}</span>
        </div>
        <div className="flex items-center gap-1 text-text-muted text-xs">
          <Users size={13} />
          <span>{assigned_agents.length}</span>
        </div>

        <EstadoMenu caso={caso} />

        {status === 'active_investigation' && (
          <button
            onClick={(e) => { e.stopPropagation(); onAsignar(caso) }}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary border border-border-soft hover:border-border-hard px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <UserPlus size={13} />
            Asignar
          </button>
        )}

        {caso.status === 'closed' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onReactivar(caso)
            }}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary border border-border-soft hover:border-border-hard px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Reactivar
          </button>
        )}
      </div>
    </div>
  )
}
