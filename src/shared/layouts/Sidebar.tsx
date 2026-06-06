import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  FolderOpen,
  FileText,
  Users,
  Bell,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '../../core/stores/authStore'
import { useDashboardStore } from '../../core/stores/dashboardStore'

interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  badge?: 'casosActivos' | 'reportesPendientes' | 'notificacionesSinLeer'
}

const NAV_PRINCIPAL: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/mapa', label: 'Mapa General', Icon: Map },
]

const NAV_GESTION: NavItem[] = [
  { to: '/casos', label: 'Mis Casos', Icon: FolderOpen, badge: 'casosActivos' },
  { to: '/reportes', label: 'Reportes', Icon: FileText, badge: 'reportesPendientes' },
  { to: '/agentes', label: 'Agentes', Icon: Users },
  { to: '/notificaciones', label: 'Notificaciones', Icon: Bell, badge: 'notificacionesSinLeer' },
]

function SidebarNavItem({
  item,
  badgeCount,
}: {
  item: NavItem
  badgeCount?: number
}) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-bg-panel border border-border-soft text-text-primary'
            : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
        }`
      }
    >
      <span className="flex items-center gap-3">
        <item.Icon size={15} />
        {item.label}
      </span>
      {!!badgeCount && badgeCount > 0 && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${
            item.badge === 'casosActivos' ? 'bg-badge-purple' : 'bg-badge-red'
          }`}
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const usuario = useAuthStore((s) => s.usuario)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const casosActivos = useDashboardStore((s) => s.casosActivos)
  const reportesPendientes = useDashboardStore((s) => s.reportesPendientes)
  const notificacionesSinLeer = useDashboardStore((s) => s.notificacionesSinLeer)

  const badgeCounts = { casosActivos, reportesPendientes, notificacionesSinLeer }

  const initials = usuario?.nombre
    ? usuario.nombre
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'AG'

  return (
    <aside className="w-[220px] flex-shrink-0 bg-bg-sidebar border-r border-border-soft flex flex-col h-screen">
      <div className="px-5 py-5 border-b border-border-soft flex-shrink-0">
        <p className="text-lg font-bold bg-gradient-to-r from-brand-base to-brand-dark bg-clip-text text-transparent">
          TROBAT
        </p>
        <p className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">
          Backoffice Policial
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest px-3 mb-2">
            Principal
          </p>
          <div className="space-y-0.5">
            {NAV_PRINCIPAL.map((item) => (
              <SidebarNavItem key={item.to} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest px-3 mb-2">
            Gestión
          </p>
          <div className="space-y-0.5">
            {NAV_GESTION.map((item) => (
              <SidebarNavItem
                key={item.to}
                item={item}
                badgeCount={item.badge ? badgeCounts[item.badge] : undefined}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-border-soft flex-shrink-0">
        <div className="bg-bg-hover rounded-lg px-3 py-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-base flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-sm font-medium truncate">
              {usuario?.nombre ?? 'Agente'}
            </p>
            <p className="text-text-muted text-xs truncate">Leg. {usuario?.legajo ?? '—'}</p>
          </div>
          <button
            onClick={clearAuth}
            title="Cerrar sesión"
            className="text-text-muted hover:text-priority-high transition-colors flex-shrink-0"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
