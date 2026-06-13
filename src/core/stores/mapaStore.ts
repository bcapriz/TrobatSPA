import { create } from 'zustand'

interface MapaState {
  casoIdFiltro: string | null
  soloPrioridad: boolean
  soloValidados: boolean
  soloPendientes: boolean
  ordenFecha: 'desc' | 'asc'
  setCasoIdFiltro: (id: string | null) => void
  setSoloPrioridad: (v: boolean) => void
  setSoloValidados: (v: boolean) => void
  setSoloPendientes: (v: boolean) => void
  setOrdenFecha: (o: 'desc' | 'asc') => void
  reset: () => void
}

export const useMapaStore = create<MapaState>()((set) => ({
  casoIdFiltro: null,
  soloPrioridad: false,
  soloValidados: false,
  soloPendientes: false,
  ordenFecha: 'desc',
  setCasoIdFiltro: (id) => set({ casoIdFiltro: id }),
  setSoloPrioridad: (v) => set({ soloPrioridad: v }),
  setSoloValidados: (v) => set((state) => ({
    soloValidados: v,
    soloPendientes: v ? false : state.soloPendientes,
  })),
  setSoloPendientes: (v) => set((state) => ({
    soloPendientes: v,
    soloValidados: v ? false : state.soloValidados,
  })),
  setOrdenFecha: (o) => set({ ordenFecha: o }),
  reset: () =>
    set({
      casoIdFiltro: null,
      soloPrioridad: false,
      soloValidados: false,
      soloPendientes: false,
      ordenFecha: 'desc',
    }),
}))
