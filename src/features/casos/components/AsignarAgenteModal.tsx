import { useState } from 'react'
import { X, UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { Caso } from '../../../domain/models'
import type { OficialProfile } from '../../../data/services/authService'
import { usuariosService } from '../../../data/services/usuariosService'
import {
  useAsignarAgenteMutation,
  useRemoverAgenteMutation,
} from '../hooks/useAsignarColaboradorMutation'

interface Props {
  caso: Caso
  onClose: () => void
}

export function AsignarAgenteModal({ caso, onClose }: Props) {
  const [filtro, setFiltro] = useState('')

  const { data: oficiales = [], isLoading } = useQuery({
    queryKey: ['oficiales'],
    queryFn: usuariosService.listarOficiales,
  })

  const asignar = useAsignarAgenteMutation(caso.id)
  const remover = useRemoverAgenteMutation(caso.id)

  const isPending = asignar.isPending || remover.isPending

  const filtrados = oficiales.filter((o) => {
    if (!filtro.trim()) return true
    const q = filtro.toLowerCase()
    return (
      o.nombre.toLowerCase().includes(q) ||
      o.email_institucional.toLowerCase().includes(q) ||
      o.legajo.toLowerCase().includes(q)
    )
  })

  const esAsignado = (id: string) => caso.assigned_agents.includes(id)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-border-soft rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
          <div>
            <h2 className="text-text-primary font-semibold">Asignar colaborador</h2>
            <p className="text-text-muted text-xs mt-0.5">{caso.missing_person.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por nombre, email o legajo..."
            className="w-full bg-bg-hover border border-border-soft rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-base transition-colors text-sm"
          />

          <div className="max-h-72 overflow-y-auto space-y-1.5">
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-text-muted gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Cargando oficiales...</span>
              </div>
            )}

            {!isLoading && filtrados.length === 0 && (
              <p className="text-text-muted text-sm text-center py-8">
                No se encontraron oficiales.
              </p>
            )}

            {filtrados.map((oficial) => (
              <AgenteRow
                key={oficial.id}
                oficial={oficial}
                esAsignado={esAsignado(oficial.id)}
                esAdministrador={oficial.id === caso.admin_officer_id}
                onAsignar={() => asignar.mutate(oficial.id)}
                onRemover={() => remover.mutate(oficial.id)}
                isPending={isPending}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-soft flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border-soft hover:border-border-hard rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function AgenteRow({
  oficial,
  esAsignado,
  esAdministrador,
  onAsignar,
  onRemover,
  isPending,
}: {
  oficial: OficialProfile
  esAsignado: boolean
  esAdministrador: boolean
  onAsignar: () => void
  onRemover: () => void
  isPending: boolean
}) {
  const initials = oficial.nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center gap-3 bg-bg-hover rounded-lg px-3 py-2.5">
      <div className="w-8 h-8 rounded-full bg-brand-base flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium">
          {oficial.nombre}
          {esAdministrador && (
            <span className="ml-2 text-[10px] text-brand-base font-semibold">ADMIN</span>
          )}
        </p>
        <p className="text-text-muted text-xs">
          Leg. {oficial.legajo} · {oficial.rango}
        </p>
      </div>
      {!esAdministrador && (
        esAsignado ? (
          <button
            onClick={onRemover}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs text-priority-high border border-priority-high/30 px-2.5 py-1.5 rounded-lg hover:bg-priority-high/10 transition-colors disabled:opacity-50"
          >
            <UserMinus size={12} />
            Quitar
          </button>
        ) : (
          <button
            onClick={onAsignar}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs text-priority-low border border-priority-low/30 px-2.5 py-1.5 rounded-lg hover:bg-priority-low/10 transition-colors disabled:opacity-50"
          >
            <UserPlus size={12} />
            Asignar
          </button>
        )
      )}
    </div>
  )
}
