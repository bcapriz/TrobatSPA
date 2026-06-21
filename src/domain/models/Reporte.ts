import type { Ubicacion } from './Ubicacion'

export type ReportePriority = 'high' | 'medium' | 'discarded'

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
  description: string
  photo_url: string | null
  security_metadata: { anonymous: boolean }
  contact_info: ContactInfo
  validated: boolean
  priority: ReportePriority | null
}

export interface ValidarReportePayload {
  validated: boolean
  priority?: ReportePriority | null
}
