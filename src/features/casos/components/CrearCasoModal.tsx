import { type FormEvent, useEffect, useRef, useState } from 'react'
import { X, MapPin, Upload } from 'lucide-react'
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import type { Ubicacion } from '../../../domain/models'
import { useAuthStore } from '../../../core/stores/authStore'
import { useCrearCasoMutation } from '../hooks/useCrearCasoMutation'
import { subirFotoCaso } from '../../../data/services/storageService'
import { useToast } from '../../../shared/components/Toast'

const MAPS_MAP_ID = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) || 'DEMO_MAP_ID'

function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    map.panTo(center)
    map.setZoom(15)
  }, [map, center.lat, center.lng])
  return null
}

interface FormData {
  nombre: string
  descripcion: string
  edad: string
  fecha_ultima_vez_visto: string
  repNombre: string
  repEmail: string
  repTelefono: string
}

const INITIAL: FormData = {
  nombre: '',
  descripcion: '',
  edad: '',
  fecha_ultima_vez_visto: '',
  repNombre: '',
  repEmail: '',
  repTelefono: '',
}

const inputClass =
  'w-full bg-bg-hover border border-border-soft rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-base transition-colors text-sm'

const labelClass = 'block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide'

interface Props {
  onClose: () => void
}

export function CrearCasoModal({ onClose }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null)
  const [coordError, setCoordError] = useState(false)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoError, setFotoError] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(false)

  const addressInputRef = useRef<HTMLInputElement>(null)
  const fotoInputRef = useRef<HTMLInputElement>(null)
  const placesLib = useMapsLibrary('places')
  const oficialId = useAuthStore((s) => s.usuario?.id ?? '')
  const mutation = useCrearCasoMutation()
  const { showToast } = useToast()

  useEffect(() => {
    if (!placesLib || !addressInputRef.current) return
    const autocomplete = new placesLib.Autocomplete(addressInputRef.current, {
      componentRestrictions: { country: 'ar' },
      fields: ['geometry', 'formatted_address'],
      types: ['geocode', 'establishment'],
    })
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.geometry?.location) {
        setCoordenadas({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        })
        setCoordError(false)
      }
    })
    return () => google.maps.event.removeListener(listener)
  }, [placesLib])

  useEffect(() => {
    return () => {
      if (fotoPreview) URL.revokeObjectURL(fotoPreview)
    }
  }, [fotoPreview])

  const set =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
    setFotoError(false)
    setUploadError(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!fotoFile) {
      setFotoError(true)
      return
    }

    if (!coordenadas) {
      setCoordError(true)
      addressInputRef.current?.focus()
      return
    }

    setIsUploading(true)
    setUploadError(false)

    let fotoUrl: string
    try {
      fotoUrl = await subirFotoCaso(fotoFile)
    } catch {
      setUploadError(true)
      setIsUploading(false)
      return
    }
    setIsUploading(false)

    const ultima_ubicacion_oficial: Ubicacion = {
      type: 'Point',
      coordinates: [coordenadas.lng, coordenadas.lat],
    }

    mutation.mutate(
      {
        oficial_administrador_id: oficialId,
        agentes_asignados: [],
        foto_url: fotoUrl,
        desaparecido: {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          edad: parseInt(form.edad) || 0,
          fecha_ultima_vez_visto: form.fecha_ultima_vez_visto,
          descripcion_ubicacion: addressInputRef.current?.value.trim() ?? '',
          ultima_ubicacion_oficial,
        },
        representante_externo: {
          nombre: form.repNombre.trim(),
          email: form.repEmail.trim(),
          telefono: form.repTelefono.trim(),
        },
      },
      {
        onSuccess: () => {
          showToast('Caso creado exitosamente.', 'success')
          onClose()
        },
      },
    )
  }

  const isBusy = isUploading || mutation.isPending

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-border-soft rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft sticky top-0 bg-bg-panel z-10">
          <h2 className="text-text-primary font-semibold">Nuevo caso</h2>
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
                  value={form.nombre}
                  onChange={set('nombre')}
                  required
                  minLength={2}
                  placeholder="Nombre y apellido"
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Descripción física</label>
                <textarea
                  value={form.descripcion}
                  onChange={set('descripcion')}
                  required
                  minLength={10}
                  rows={3}
                  placeholder="Altura, complexión, cabello, vestimenta al momento de la desaparición..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="col-span-2">
                <label className={labelClass}>
                  Foto del desaparecido{' '}
                  <span className="text-priority-high normal-case tracking-normal">
                    (obligatoria)
                  </span>
                </label>
                <input
                  ref={fotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />
                {fotoPreview ? (
                  <div
                    className={`rounded-lg border overflow-hidden ${fotoError ? 'border-priority-high' : 'border-border-soft'}`}
                  >
                    <img
                      src={fotoPreview}
                      alt="Vista previa"
                      className="w-full h-48 object-cover"
                    />
                    <div className="flex items-center justify-between px-3 py-2 bg-bg-hover">
                      <span className="text-xs text-text-secondary truncate">{fotoFile?.name}</span>
                      <button
                        type="button"
                        onClick={() => fotoInputRef.current?.click()}
                        className="text-xs text-brand-base hover:text-brand-dark transition-colors ml-2 shrink-0"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fotoInputRef.current?.click()}
                    className={`w-full rounded-lg border-2 border-dashed px-4 py-8 flex flex-col items-center gap-2 transition-colors hover:border-brand-base hover:bg-bg-hover ${
                      fotoError ? 'border-priority-high' : 'border-border-hard'
                    }`}
                  >
                    <Upload
                      size={20}
                      className={fotoError ? 'text-priority-high' : 'text-text-muted'}
                    />
                    <span
                      className={`text-sm font-medium ${fotoError ? 'text-priority-high' : 'text-text-secondary'}`}
                    >
                      Hacé clic para cargar una foto
                    </span>
                    <span className="text-xs text-text-muted">PNG, JPG, WEBP</span>
                  </button>
                )}
                {fotoError && !fotoPreview && (
                  <p className="mt-1.5 text-xs text-priority-high">
                    Debés cargar una foto del desaparecido para continuar.
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Edad</label>
                <input
                  type="number"
                  value={form.edad}
                  onChange={set('edad')}
                  required
                  min={0}
                  max={120}
                  placeholder="Ej: 34"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Última vez visto (fecha)</label>
                <input
                  type="date"
                  value={form.fecha_ultima_vez_visto}
                  onChange={set('fecha_ultima_vez_visto')}
                  required
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Última ubicación conocida</label>
                <div className="relative">
                  <input
                    ref={addressInputRef}
                    type="text"
                    placeholder="Buscar dirección en Google Maps..."
                    onChange={() => {
                      setCoordenadas(null)
                      setCoordError(false)
                    }}
                    className={`${inputClass} pr-8 ${coordError ? 'border-priority-high focus:border-priority-high' : ''}`}
                  />
                  <MapPin
                    size={14}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                      coordenadas ? 'text-brand-base' : 'text-text-muted'
                    }`}
                  />
                </div>
                {coordenadas && (
                  <p className="mt-1.5 text-xs text-brand-base font-mono">
                    {coordenadas.lat.toFixed(5)}, {coordenadas.lng.toFixed(5)}
                  </p>
                )}
                {coordError && (
                  <p className="mt-1.5 text-xs text-priority-high">
                    Seleccioná una dirección del desplegable para confirmar la ubicación.
                  </p>
                )}
              </div>

              {coordenadas && (
                <div className="col-span-2">
                  <div className="h-52 rounded-lg overflow-hidden border border-border-soft">
                    <Map
                      defaultCenter={coordenadas}
                      defaultZoom={15}
                      mapId={MAPS_MAP_ID}
                      gestureHandling="cooperative"
                      disableDefaultUI
                      clickableIcons={false}
                    >
                      <MapController center={coordenadas} />
                      <AdvancedMarker
                        position={coordenadas}
                        draggable
                        onDragEnd={(e) => {
                          if (!e.latLng) return
                          const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() }
                          setCoordenadas(newCoords)
                          const geocoder = new google.maps.Geocoder()
                          geocoder.geocode({ location: newCoords }, (results, status) => {
                            if (status === 'OK' && results?.[0] && addressInputRef.current) {
                              addressInputRef.current.value = results[0].formatted_address
                            }
                          })
                        }}
                      />
                    </Map>
                  </div>
                  <p className="mt-1.5 text-xs text-text-muted">
                    Arrastrá el marcador para ajustar la posición exacta.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-1">
              Representante externo
            </h3>
            <p className="text-text-muted text-xs mb-4">Familiar o contacto del caso (opcional)</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Nombre</label>
                <input
                  type="text"
                  value={form.repNombre}
                  onChange={set('repNombre')}
                  placeholder="Nombre del familiar o contacto"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={form.repEmail}
                  onChange={set('repEmail')}
                  placeholder="contacto@ejemplo.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  type="tel"
                  value={form.repTelefono}
                  onChange={set('repTelefono')}
                  placeholder="+54 11 1234-5678"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {uploadError && (
            <p className="text-priority-high text-sm bg-priority-high/10 border border-priority-high/20 rounded-lg px-3 py-2">
              Error al subir la foto. Verificá tu conexión e intentá nuevamente.
            </p>
          )}

          {mutation.isError && (
            <p className="text-priority-high text-sm bg-priority-high/10 border border-priority-high/20 rounded-lg px-3 py-2">
              Error al crear el caso. Intente nuevamente.
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-soft">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border-soft hover:border-border-hard rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="px-5 py-2 text-sm font-semibold bg-brand-base hover:bg-brand-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Subiendo foto...' : mutation.isPending ? 'Guardando...' : 'Guardar caso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
