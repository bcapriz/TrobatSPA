import { useMemo, useState } from 'react'
import { Search, X, FolderOpen, Shield, Loader2, AlertCircle, BadgeCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { OficialProfile } from '../../../data/services/authService'
import { useListarAgentes } from '../hooks/useListarAgentes'
import { useListarCasos } from '../../casos/hooks/useListarCasos'
import { useAuthStore } from '../../../core/stores/authStore'
import type { EstadoCaso } from '../../../domain/models'

// ─── helpers ──────────────────────────────────────────────────────────────────

function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

const ESTADO_LABEL: Record<EstadoCaso, string> = {
  active_investigation: 'Activa',
  resolved: 'Resuelto',
  closed: 'Cerrado',
}

const ESTADO_COLOR: Record<EstadoCaso, string> = {
  active_investigation: 'text-brand-base bg-brand-base/15 border-brand-base/25',
  resolved: 'text-priority-low bg-priority-low/15 border-priority-low/25',
  closed: 'text-text-muted bg-bg-hover border-border-soft',
}

// ─── detail panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  agente: OficialProfile
  isSelf: boolean
  casosAdmin: ReturnType<typeof useListarCasos>['data']
  casosColaborador: ReturnType<typeof useListarCasos>['data']
  onClose: () => void
}

function DetailPanel({ agente, isSelf, casosAdmin, casosColaborador, onClose }: DetailPanelProps) {
  const navigate = useNavigate()

  const adminList = casosAdmin?.data ?? []
  const colabList = casosColaborador?.data ?? []

  return (
    <div className="flex flex-col h-full border-l border-border-soft bg-bg-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft flex-shrink-0">
        <span className="text-text-primary font-semibold text-sm">Perfil del agente</span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Identity */}
        <div className="p-5 flex flex-col items-center text-center border-b border-border-soft">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-brand-base/20 border border-brand-base/30 flex items-center justify-center">
              <span className="text-brand-base text-xl font-bold">{getInitials(agente.nombre)}</span>
            </div>
            {isSelf && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-priority-low rounded-full flex items-center justify-center border-2 border-bg-panel">
                <BadgeCheck size={11} className="text-white" />
              </div>
            )}
          </div>
          <p className="text-text-primary font-bold text-base">{agente.nombre}</p>
          {isSelf && (
            <span className="text-[10px] font-bold text-priority-low bg-priority-low/15 border border-priority-low/25 px-2 py-0.5 rounded-full mt-1">
              TÚ
            </span>
          )}
        </div>

        {/* Info rows */}
        <div className="p-4 space-y-3 border-b border-border-soft">
          <InfoRow icon={<Shield size={13} />} label="Rango" value={agente.rango} />
          <InfoRow icon={<BadgeCheck size={13} />} label="Legajo" value={agente.legajo} />
          <InfoRow
            icon={
              <svg
                viewBox="0 0 16 16"
                width={13}
                height={13}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <rect x="1" y="3" width="14" height="10" rx="2" />
                <path d="M1 6l7 4 7-4" />
              </svg>
            }
            label="Email"
            value={agente.email_institucional}
            mono
          />
        </div>

        {/* Casos como admin */}
        <div className="p-4 border-b border-border-soft">
          <p className="text-text-muted text-[11px] uppercase tracking-wide font-medium mb-3">
            Casos como administrador ({adminList.length})
          </p>
          {adminList.length === 0 ? (
            <p className="text-text-muted text-xs">Ninguno</p>
          ) : (
            <div className="space-y-1.5">
              {adminList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate('/casos')}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-bg-hover hover:bg-bg-app rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderOpen size={12} className="text-brand-base flex-shrink-0" />
                    <span className="text-text-primary text-xs truncate">
                      {c.missing_person.name}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${ESTADO_COLOR[c.status]}`}
                  >
                    {ESTADO_LABEL[c.status]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Casos como agente */}
        <div className="p-4">
          <p className="text-text-muted text-[11px] uppercase tracking-wide font-medium mb-3">
            Casos como agente ({colabList.length})
          </p>
          {colabList.length === 0 ? (
            <p className="text-text-muted text-xs">Ninguno</p>
          ) : (
            <div className="space-y-1.5">
              {colabList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate('/casos')}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-bg-hover hover:bg-bg-app rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderOpen size={12} className="text-text-secondary flex-shrink-0" />
                    <span className="text-text-primary text-xs truncate">
                      {c.missing_person.name}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${ESTADO_COLOR[c.status]}`}
                  >
                    {ESTADO_LABEL[c.status]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-text-muted mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-text-muted text-[11px] uppercase tracking-wide">{label}</p>
        <p className={`text-text-primary text-sm truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  )
}

// ─── agent card ───────────────────────────────────────────────────────────────

interface AgentCardProps {
  agente: OficialProfile
  casosCount: number
  isSelected: boolean
  isSelf: boolean
  onClick: () => void
}

function AgentCard({ agente, casosCount, isSelected, isSelf, onClick }: AgentCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? 'bg-brand-base/10 border-brand-base/40'
          : 'bg-bg-panel border-border-soft hover:border-border-hard hover:bg-bg-hover'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base ${
              isSelected
                ? 'bg-brand-base/30 text-brand-base'
                : 'bg-bg-hover text-text-secondary'
            }`}
          >
            {getInitials(agente.nombre)}
          </div>
          {isSelf && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-priority-low rounded-full flex items-center justify-center border-2 border-bg-panel">
              <BadgeCheck size={9} className="text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-text-primary text-sm font-semibold truncate">{agente.nombre}</p>
            {isSelf && (
              <span className="text-[9px] font-bold text-priority-low bg-priority-low/15 border border-priority-low/25 px-1.5 py-0.5 rounded-full flex-shrink-0">
                TÚ
              </span>
            )}
          </div>
          <p className="text-brand-base text-xs font-medium mt-0.5">{agente.rango}</p>
          <p className="text-text-muted text-xs mt-1 font-mono truncate">
            {agente.email_institucional}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border-soft flex items-center justify-between">
        <span className="text-text-muted text-xs">Leg. {agente.legajo}</span>
        <div className="flex items-center gap-1.5 text-text-muted text-xs">
          <FolderOpen size={11} />
          <span>{casosCount} caso{casosCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </button>
  )
}

// ─── main view ────────────────────────────────────────────────────────────────

export function AgentesView() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: agentes = [], isLoading, isError } = useListarAgentes()
  const { data: casosData } = useListarCasos({ limit: 100 })
  const usuarioActual = useAuthStore((s) => s.usuario)

  const casos = casosData?.data ?? []

  // Count total cases per agent (admin + collaborator)
  const casosCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of casos) {
      map[c.admin_officer_id] = (map[c.admin_officer_id] ?? 0) + 1
      for (const aid of c.assigned_agents) {
        if (aid !== c.admin_officer_id) {
          map[aid] = (map[aid] ?? 0) + 1
        }
      }
    }
    return map
  }, [casos])

  const agentesFiltrados = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return agentes
    return agentes.filter(
      (a) =>
        a.nombre.toLowerCase().includes(q) ||
        a.legajo.toLowerCase().includes(q) ||
        a.email_institucional.toLowerCase().includes(q) ||
        a.rango.toLowerCase().includes(q),
    )
  }, [agentes, search])

  const selectedAgente = selectedId ? agentes.find((a) => a.id === selectedId) ?? null : null

  // Cases for the selected agent
  const casosAdmin = useMemo(
    () => ({
      data: casos.filter((c) => c.admin_officer_id === selectedId),
      total: 0, page: 0, limit: 100, hasMore: false,
    }),
    [casos, selectedId],
  )
  const casosColaborador = useMemo(
    () => ({
      data: casos.filter(
        (c) =>
          c.assigned_agents.includes(selectedId ?? '') &&
          c.admin_officer_id !== selectedId,
      ),
      total: 0, page: 0, limit: 100, hasMore: false,
    }),
    [casos, selectedId],
  )

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-text-secondary bg-bg-panel border border-border-soft rounded-xl px-5 py-4">
          <AlertCircle size={18} className="text-priority-high" />
          <span className="text-sm">No se pudieron cargar los agentes.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-0 -m-6" style={{ minHeight: 'calc(100vh - 52px)' }}>
      {/* Left: list */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-border-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-text-primary font-bold text-lg">Agentes</h1>
              <p className="text-text-muted text-xs mt-0.5">
                {isLoading ? '…' : `${agentes.length} oficial${agentes.length !== 1 ? 'es' : ''} registrado${agentes.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            {isLoading && <Loader2 size={15} className="animate-spin text-text-muted" />}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, legajo, rango o email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-hover border border-border-soft rounded-lg pl-9 pr-4 py-2 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-brand-base transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {search && (
            <p className="text-text-muted text-xs mt-2">
              {agentesFiltrados.length} resultado{agentesFiltrados.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-bg-panel border border-border-soft rounded-xl p-4 animate-pulse"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-bg-hover flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3.5 bg-bg-hover rounded w-3/4" />
                      <div className="h-3 bg-bg-hover rounded w-1/2" />
                      <div className="h-3 bg-bg-hover rounded w-full" />
                    </div>
                  </div>
                  <div className="border-t border-border-soft pt-3 flex justify-between">
                    <div className="h-3 bg-bg-hover rounded w-1/3" />
                    <div className="h-3 bg-bg-hover rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : agentesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-14 h-14 bg-bg-panel border border-border-soft rounded-2xl flex items-center justify-center">
                <Search size={22} className="text-text-muted/50" />
              </div>
              <p className="text-text-muted text-sm">Sin resultados para "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentesFiltrados.map((agente) => (
                <AgentCard
                  key={agente.id}
                  agente={agente}
                  casosCount={casosCountMap[agente.id] ?? 0}
                  isSelected={selectedId === agente.id}
                  isSelf={usuarioActual?.id === agente.id}
                  onClick={() => setSelectedId((prev) => (prev === agente.id ? null : agente.id))}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: detail panel */}
      {selectedAgente && (
        <div className="w-[300px] flex-shrink-0">
          <DetailPanel
            agente={selectedAgente}
            isSelf={usuarioActual?.id === selectedAgente.id}
            casosAdmin={casosAdmin}
            casosColaborador={casosColaborador}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}
    </div>
  )
}
