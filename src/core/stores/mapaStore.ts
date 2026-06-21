import { create } from 'zustand'

interface MapaState {
  casoIdFiltro: string | null
  soloPrioridad: boolean
  soloValidados: boolean
  soloPendientes: boolean
  soloDescartados: boolean
  ordenFecha: 'desc' | 'asc'
  setCasoIdFiltro: (id: string | null) => void
  setSoloPrioridad: (v: boolean) => void
  setSoloValidados: (v: boolean) => void
  setSoloPendientes: (v: boolean) => void
  setSoloDescartados: (v: boolean) => void
  setOrdenFecha: (o: 'desc' | 'asc') => void
  reset: () => void
}

const clearOthers = { soloPrioridad: false, soloValidados: false, soloPendientes: false, soloDescartados: false }

export const useMapaStore = create<MapaState>()((set) => ({
  casoIdFiltro: null,
  soloPrioridad: false,
  soloValidados: false,
  soloPendientes: false,
  soloDescartados: false,
  ordenFecha: 'desc',
  setCasoIdFiltro: (id) => set({ casoIdFiltro: id }),
  setSoloPrioridad: (v) => set(v ? { ...clearOthers, soloPrioridad: true } : { soloPrioridad: false }),
  setSoloValidados: (v) => set(v ? { ...clearOthers, soloValidados: true } : { soloValidados: false }),
  setSoloPendientes: (v) => set(v ? { ...clearOthers, soloPendientes: true } : { soloPendientes: false }),
  setSoloDescartados: (v) => set(v ? { ...clearOthers, soloDescartados: true } : { soloDescartados: false }),
  setOrdenFecha: (o) => set({ ordenFecha: o }),
  reset: () => set({ casoIdFiltro: null, ...clearOthers, ordenFecha: 'desc' }),
}))
