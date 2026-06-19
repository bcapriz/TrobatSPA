import type { Ubicacion } from './Ubicacion'

export interface DatosContacto {
  nombre: string | null
  telefono: string | null
  email: string | null
}

export interface Reporte {
  id: string
  caso_id: string
  location: Ubicacion
  timestamp: string
  prioridad_policial: boolean
  descripcion: string
  photo_url: string | null
  metadata_seguridad: { anonimo: boolean }
  datos_contacto: DatosContacto
  validado: boolean
  descartado?: boolean
}

export interface ValidarReportePayload {
  validado: boolean
}

export interface PriorizarReportePayload {
  prioridad_policial: boolean
  validado?: boolean
}
