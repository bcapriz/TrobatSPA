import { create } from 'zustand'

interface DashboardState {
  casosActivos: number
  reportesPendientes: number
  notificacionesSinLeer: number
  setCasosActivos: (n: number) => void
  setReportesPendientes: (n: number) => void
  setNotificacionesSinLeer: (n: number) => void
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  casosActivos: 0,
  reportesPendientes: 0,
  notificacionesSinLeer: 0,
  setCasosActivos: (n) => set({ casosActivos: n }),
  setReportesPendientes: (n) => set({ reportesPendientes: n }),
  setNotificacionesSinLeer: (n) => set({ notificacionesSinLeer: n }),
}))
