import type { Ubicacion } from './Ubicacion'

export type EstadoCaso = 'investigacion_activa' | 'resuelto' | 'cerrado' | 'suspendido'

export interface DesaparecidoInfo {
  nombre: string
  descripcion: string
  edad: number
  fecha_ultima_vez_visto: string
  descripcion_ubicacion: string
  ultima_ubicacion_oficial: Ubicacion
}

export interface RepresentanteExterno {
  nombre: string
  email: string
  telefono: string
}

export interface Caso {
  id: string
  oficial_administrador_id: string
  agentes_asignados: string[]
  desaparecido: DesaparecidoInfo
  representante_externo: RepresentanteExterno
  estado: EstadoCaso
  total_reportes: number
  fecha_creacion: string
  foto_url?: string
}

export interface CrearCasoPayload {
  oficial_administrador_id: string
  agentes_asignados: string[]
  desaparecido: DesaparecidoInfo
  representante_externo: RepresentanteExterno
  foto_url: string
}
