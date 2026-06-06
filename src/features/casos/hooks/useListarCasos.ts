import { useQuery } from '@tanstack/react-query'
import { casosService, type ListarCasosFiltros } from '../../../data/services/casosService'

export const CASOS_QUERY_KEY = 'casos'

export function useListarCasos(filtros: ListarCasosFiltros = {}) {
  return useQuery({
    queryKey: [CASOS_QUERY_KEY, filtros],
    queryFn: () => casosService.listar(filtros),
  })
}
