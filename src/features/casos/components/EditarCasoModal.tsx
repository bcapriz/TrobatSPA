import { useState, useEffect } from 'react'
import { X, MapPin, ChevronDown, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import type { Caso, Ubicacion } from '../../../domain/models'

const FALLBACK_UBICACION: Ubicacion = { type: 'Point', coordinates: [0, 0] }
import { reportesService } from '../../../data/services/reportesService'
import { useEditarCasoMutation } from '../hooks/useEditarCasoMutation'

const MAPS_MAP_ID = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) || 'DEMO_MAP_ID'

const inputClass =
  'w-full bg-bg-hover border border-border-soft rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-base transition-colors text-sm'

const labelClass = 'block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide'

function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    map.panTo(center)
    map.setZoom(15)
  }, [map, center.lat, center.lng])
  return null
}

// ─── dropdown de última ubicación ─────────────────────────────────────────────

interface UbicacionOpcion {
  label: string
  descripcion: string
  ubicacion: Ubicacion
}

function UbicacionDropdown({
  opciones,
  seleccionada,
  onChange,
}: {
  opciones: UbicacionOpcion[]
  seleccionada: Ubicacion
  onChange: (op: UbicacionOpcion) => void
}) {
  const [open, setOpen] = useState(false)

  const actual = opciones.find(
    (op) =>
      op.ubicacion.coordinates[0] === seleccionada.coordinates[0] &&
      op.ubicacion.coordinates[1] === seleccionada.coordinates[1],
  )

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-bg-hover border border-border-soft rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-base transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={13} className="text-brand-base flex-shrink-0" />
          <span className="truncate">{actual?.descripcion ?? 'Seleccionar ubicación'}</span>
        </div>
        <ChevronDown size={13} className={`flex-shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-bg-panel border border-border-soft rounded-xl shadow-xl z-20 overflow-hidden">
            {opciones.map((op, i) => {
              const isSelected =
                op.ubicacion.coordinates[0] === seleccionada.coordinates[0] &&
                op.ubicacion.coordinates[1] === seleccionada.coordinates[1]
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { onChange(op); setOpen(false) }}
                  className="w-full flex items-start justify-between gap-3 px-3 py-2.5 text-left hover:bg-bg-hover transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{op.label}</p>
                    <p className="text-xs text-text-muted truncate">{op.descripcion}</p>
                  </div>
                  {isSelected && <Check size={13} className="text-brand-base flex-shrink-0 mt-0.5" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── modal principal ───────────────────────────────────────────────────────────

interface Props {
  caso: Caso
  onClose: () => void
}

export function EditarCasoModal({ caso, onClose }: Props) {
  const mutation = useEditarCasoMutation()

  const [nombre, setNombre] = useState(caso.missing_person.name)
  const [descripcion, setDescripcion] = useState(caso.missing_person.description)
  const [edad, setEdad] = useState(String(caso.missing_person.age))
  const [fechaUltimaVez, setFechaUltimaVez] = useState(
    caso.missing_person.last_seen_date?.slice(0, 10) ?? '',
  )
  const [repNombre, setRepNombre] = useState(caso.external_contact.name)
  const [repEmail, setRepEmail] = useState(caso.external_contact.email)
  const [repTelefono, setRepTelefono] = useState(caso.external_contact.phone)

  const [ultimaUbicacion, setUltimaUbicacion] = useState<Ubicacion>(
    caso.missing_person.last_known_location ?? FALLBACK_UBICACION,
  )
  const [descripcionUbicacion, setDescripcionUbicacion] = useState(
    caso.missing_person.location_description,
  )

  const coordsMapa = {
    lat: ultimaUbicacion.coordinates[1],
    lng: ultimaUbicacion.coordinates[0],
  }

  const { data: reportesData } = useQuery({
    queryKey: ['reportes-caso-prioritarios', caso.id],
    queryFn: () => reportesService.listar({ case_id: caso.id, limit: 100 }),
  })

  const reportesPrioritarios = (reportesData?.data ?? []).filter((r) => r.police_priority)

  const opcionesUbicacion: UbicacionOpcion[] = [
    {
      label: 'Ubicación original del caso',
      descripcion: caso.missing_person.location_description || 'Sin descripción',
      ubicacion: caso.missing_person.last_known_location ?? FALLBACK_UBICACION,
    },
    ...reportesPrioritarios.map((r, i) => ({
      label: `Reporte prioritario #${i + 1}`,
      descripcion: r.description || `${r.location.coordinates[1].toFixed(5)}, ${r.location.coordinates[0].toFixed(5)}`,
      ubicacion: r.location,
    })),
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(
      {
        id: caso.id,
        payload: {
          missing_person: {
            name: nombre.trim(),
            description: descripcion.trim(),
            age: parseInt(edad) || 0,
            last_seen_date: fechaUltimaVez,
            location_description: descripcionUbicacion,
            last_known_location: ultimaUbicacion,
          },
          external_contact: {
            name: repNombre.trim(),
            email: repEmail.trim(),
            phone: repTelefono.trim(),
          },
        },
      },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-border-soft rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft sticky top-0 bg-bg-panel z-10">
          <div>
            <h2 className="text-text-primary font-semibold">Editar caso</h2>
            <p className="text-text-muted text-xs mt-0.5">{caso.missing_person.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          <section>
            <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-4">
              Datos del desaparecido
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Nombre completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  minLength={2}
                  className={inputClass}
                />
              </div>

              <div className="col-span-2">
                <label className={labelClass}>Descripción física</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass}>Edad</label>
                <input
                  type="number"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  min={0}
                  max={120}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Última vez visto (fecha)</label>
                <input
                  type="date"
                  value={fechaUltimaVez}
                  onChange={(e) => setFechaUltimaVez(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-1">
              Representante externo
            </h3>
            <p className="text-text-muted text-xs mb-4">Familiar o contacto del caso</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Nombre</label>
                <input
                  type="text"
                  value={repNombre}
                  onChange={(e) => setRepNombre(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={repEmail}
                  onChange={(e) => setRepEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  type="tel"
                  value={repTelefono}
                  onChange={(e) => setRepTelefono(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-1">
              Última ubicación oficial
            </h3>
            <p className="text-text-muted text-xs mb-4">
              Seleccioná entre la ubicación original del caso o la de un reporte de alta prioridad.
              {reportesPrioritarios.length === 0 && (
                <span className="text-text-muted"> No hay reportes prioritarios aún.</span>
              )}
            </p>

            <UbicacionDropdown
              opciones={opcionesUbicacion}
              seleccionada={ultimaUbicacion}
              onChange={(op) => {
                setUltimaUbicacion(op.ubicacion)
                setDescripcionUbicacion(op.descripcion)
              }}
            />

            <div className="mt-3 h-48 rounded-lg overflow-hidden border border-border-soft">
              <Map
                defaultCenter={coordsMapa}
                defaultZoom={15}
                mapId={MAPS_MAP_ID}
                gestureHandling="cooperative"
                disableDefaultUI
                clickableIcons={false}
              >
                <MapController center={coordsMapa} />
                <AdvancedMarker position={coordsMapa} />
              </Map>
            </div>
            <p className="mt-1.5 text-xs text-text-muted font-mono">
              {ultimaUbicacion.coordinates[1].toFixed(5)}, {ultimaUbicacion.coordinates[0].toFixed(5)}
            </p>
          </section>

          {mutation.isError && (
            <p className="text-priority-high text-sm bg-priority-high/10 border border-priority-high/20 rounded-lg px-3 py-2">
              Error al guardar los cambios. Intentá nuevamente.
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-soft">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border-soft hover:border-border-hard rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 text-sm font-semibold bg-brand-base hover:bg-brand-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
