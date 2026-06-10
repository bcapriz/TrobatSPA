import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useSyncDashboardBadges } from '../hooks/useSyncDashboardBadges'

export function MainLayout() {
  useSyncDashboardBadges()

  return (
    <div className="flex h-screen overflow-hidden bg-bg-app">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
