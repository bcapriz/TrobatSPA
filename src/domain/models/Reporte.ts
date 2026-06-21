import type { Ubicacion } from './Ubicacion'

export interface ContactInfo {
  name: string | null
  phone: string | null
  email: string | null
}

export interface Reporte {
  id: string
  case_id: string
  location: Ubicacion
  location_label?: string | null
  timestamp: string
  police_priority: boolean
  description: string
  photo_url: string | null
  security_metadata: { anonymous: boolean }
  contact_info: ContactInfo
  validated: boolean
}

export interface ValidarReportePayload {
  validated: boolean
}

export interface PriorizarReportePayload {
  police_priority: boolean
  validated?: boolean
}
