import { create } from 'zustand'

interface MapaState {
  casoIdFiltro: string | null
  soloPrioridad: boolean
  ordenFecha: 'desc' | 'asc'
  setCasoIdFiltro: (id: string | null) => void
  setSoloPrioridad: (v: boolean) => void
  setOrdenFecha: (o: 'desc' | 'asc') => void
  reset: () => void
}

export const useMapaStore = create<MapaState>()((set) => ({
  casoIdFiltro: null,
  soloPrioridad: false,
  ordenFecha: 'desc',
  setCasoIdFiltro: (id) => set({ casoIdFiltro: id }),
  setSoloPrioridad: (v) => set({ soloPrioridad: v }),
  setOrdenFecha: (o) => set({ ordenFecha: o }),
  reset: () => set({ casoIdFiltro: null, soloPrioridad: false, ordenFecha: 'desc' }),
}))
