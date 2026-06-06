import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, UserCircle } from 'lucide-react'
import { useDashboardStore } from '../../core/stores/dashboardStore'

const SECTION_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/mapa': 'Mapa General',
  '/casos': 'Gestión de Casos',
  '/reportes': 'Bandeja de Reportes',
  '/agentes': 'Gestión de Agentes',
  '/notificaciones': 'Notificaciones',
  '/perfil': 'Mi Perfil',
}

export function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const casosActivos = useDashboardStore((s) => s.casosActivos)
  const notificacionesSinLeer = useDashboardStore((s) => s.notificacionesSinLeer)

  const title = SECTION_TITLES[pathname] ?? 'Trobat'

  const iconBtn =
    'w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors'

  return (
    <header className="h-[52px] bg-bg-panel border-b border-border-soft flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-text-primary font-semibold text-sm">{title}</h2>
        {casosActivos > 0 && (
          <span className="bg-badge-purple/20 text-brand-base border border-badge-purple/30 text-xs font-semibold px-2 py-0.5 rounded-full">
            {casosActivos} activos
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button className={iconBtn} title="Buscar">
          <Search size={16} />
        </button>
        <button
          className={`${iconBtn} relative`}
          title="Notificaciones"
          onClick={() => void navigate('/notificaciones')}
        >
          <Bell size={16} />
          {notificacionesSinLeer > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-badge-red rounded-full" />
          )}
        </button>
        <button
          className={iconBtn}
          title="Mi perfil"
          onClick={() => void navigate('/perfil')}
        >
          <UserCircle size={16} />
        </button>
      </div>
    </header>
  )
}
