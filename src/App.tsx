import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginView } from './features/auth/views/LoginView'
import { MainLayout } from './shared/layouts/MainLayout'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import { DashboardView } from './features/dashboard/views/DashboardView'
import { MapaView } from './features/mapa_investigacion/views/MapaView'
import { CasosView } from './features/casos/views/CasosView'
import { ReportesView } from './features/reportes/views/ReportesView'
import { AgentesView } from './features/agentes/views/AgentesView'
import { NotificacionesView } from './features/notificaciones/views/NotificacionesView'
import { PerfilView } from './features/perfil/views/PerfilView'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/mapa" element={<MapaView />} />
              <Route path="/casos" element={<CasosView />} />
              <Route path="/reportes" element={<ReportesView />} />
              <Route path="/agentes" element={<AgentesView />} />
              <Route path="/notificaciones" element={<NotificacionesView />} />
              <Route path="/perfil" element={<PerfilView />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
