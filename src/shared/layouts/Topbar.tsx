import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, UserCircle, X } from 'lucide-react'
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

const MENU_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/mapa', label: 'Mapa General' },
  { to: '/casos', label: 'Mis Casos' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/agentes', label: 'Agentes' },
  { to: '/notificaciones', label: 'Notificaciones' },
  { to: '/perfil', label: 'Mi Perfil' },
]

export function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const casosActivos = useDashboardStore((s) => s.casosActivos)
  const notificacionesSinLeer = useDashboardStore((s) => s.notificacionesSinLeer)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchOpen && searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen])

  const title = SECTION_TITLES[pathname] ?? 'Trobat'

  const matchingItems = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    return MENU_ITEMS.filter((item) =>
      !normalized ||
      item.label.toLowerCase().includes(normalized) ||
      item.to.toLowerCase().includes(normalized)
    )
  }, [searchQuery])

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

      <div className="flex items-center gap-1 relative" ref={searchRef}>
        <button
          className={iconBtn}
          title="Buscar"
          onClick={() => setSearchOpen((prev) => !prev)}
          type="button"
        >
          <Search size={16} />
        </button>

        {searchOpen && (
          <div className="absolute right-0 top-full mt-2 w-[260px] bg-bg-panel border border-border-soft rounded-3xl shadow-xl z-20 p-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar sección..."
                className="w-full bg-bg-hover border border-border-soft rounded-full pl-9 pr-9 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-base transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="mt-3 max-h-56 overflow-y-auto space-y-1 rounded-3xl bg-bg-panel px-1 custom-scrollbar">
              {matchingItems.length === 0 ? (
                <p className="text-text-muted text-sm px-3">No hay resultados.</p>
              ) : (
                matchingItems.map((item) => (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      setSearchQuery('')
                      navigate(item.to)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-2xl text-sm transition-colors ${
                      pathname === item.to
                        ? 'bg-bg-hover text-text-primary'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

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
