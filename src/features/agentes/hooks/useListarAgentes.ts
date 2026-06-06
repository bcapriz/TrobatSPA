import { useQuery } from '@tanstack/react-query'
import { usuariosService } from '../../../data/services/usuariosService'

export const AGENTES_QUERY_KEY = 'agentes'

export function useListarAgentes() {
  return useQuery({
    queryKey: [AGENTES_QUERY_KEY],
    queryFn: () => usuariosService.listarOficiales(),
    staleTime: 60_000,
  })
}
