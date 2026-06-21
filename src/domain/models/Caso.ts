import type { Ubicacion } from './Ubicacion'

export type EstadoCaso = 'active_investigation' | 'resolved' | 'closed'

export interface DesaparecidoInfo {
  name: string
  description: string
  age: number
  last_seen_date: string
  location_description: string
  last_known_location?: Ubicacion | null
  location_label?: string
  image?: string
}

export interface RepresentanteExterno {
  name: string
  email: string
  phone: string
}

export interface Caso {
  id: string
  admin_officer_id: string
  assigned_agents: string[]
  missing_person: DesaparecidoInfo
  external_contact: RepresentanteExterno
  status: EstadoCaso
  total_reports: number
  created_at: string
}

export interface CrearCasoPayload {
  admin_officer_id: string
  assigned_agents: string[]
  missing_person: DesaparecidoInfo
  external_contact: RepresentanteExterno
}
