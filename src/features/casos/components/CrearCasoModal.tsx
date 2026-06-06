import { type FormEvent, useState } from 'react'
import { X } from 'lucide-react'
import type { Ubicacion } from '../../../domain/models'
import { useAuthStore } from '../../../core/stores/authStore'
import { useCrearCasoMutation } from '../hooks/useCrearCasoMutation'

interface FormData {
  nombre: string
  descripcion: string
  latitud: string
  longitud: string
  repNombre: string
  repEmail: string
  repTelefono: string
}

const INITIAL: FormData = {
  nombre: '',
  descripcion: '',
  latitud: '',
  longitud: '',
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
  const oficialId = useAuthStore((s) => s.usuario?.id ?? '')
  const mutation = useCrearCasoMutation()

  const set =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const lat = parseFloat(form.latitud)
    const lng = parseFloat(form.longitud)
    if (isNaN(lat) || lat < -90 || lat > 90) return
    if (isNaN(lng) || lng < -180 || lng > 180) return

    const ultima_ubicacion_oficial: Ubicacion = { type: 'Point', coordinates: [lng, lat] }

    mutation.mutate(
      {
        oficial_administrador_id: oficialId,
        agentes_asignados: [],
        desaparecido: {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          ultima_ubicacion_oficial,
        },
        representante_externo: {
          nombre: form.repNombre.trim(),
          email: form.repEmail.trim(),
          telefono: form.repTelefono.trim(),
        },
      },
      { onSuccess: onClose },
    )
  }

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
              <div>
                <label className={labelClass}>Latitud del punto cero</label>
                <input
                  type="number"
                  value={form.latitud}
                  onChange={set('latitud')}
                  required
                  step="any"
                  min={-90}
                  max={90}
                  placeholder="-34.6037"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Longitud del punto cero</label>
                <input
                  type="number"
                  value={form.longitud}
                  onChange={set('longitud')}
                  required
                  step="any"
                  min={-180}
                  max={180}
                  placeholder="-58.3816"
                  className={inputClass}
                />
              </div>
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

          {mutation.isError && (
            <p className="text-priority-high text-sm bg-priority-high/10 border border-priority-high/20 rounded-lg px-3 py-2">
              Error al crear el caso. Intente nuevamente.
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
              {mutation.isPending ? 'Guardando...' : 'Guardar caso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
