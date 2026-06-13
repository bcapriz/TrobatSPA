import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { useCrearNotificacionMutation } from '../hooks/useCrearNotificacionMutation'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const TITULO_MAX = 30
const DESCRIPCION_MAX = 120

export function CrearNotificacionModal({ isOpen, onClose }: Props) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useCrearNotificacionMutation()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!titulo.trim()) {
      setError('El título es obligatorio')
      return
    }

    if (!descripcion.trim()) {
      setError('La descripción es obligatoria')
      return
    }

    if (titulo.length > TITULO_MAX) {
      setError(`El título no debe superar ${TITULO_MAX} caracteres`)
      return
    }

    if (descripcion.length > DESCRIPCION_MAX) {
      setError(`La descripción no debe superar ${DESCRIPCION_MAX} caracteres`)
      return
    }

    try {
      await mutation.mutateAsync({ titulo, descripcion })
      setTitulo('')
      setDescripcion('')
      onClose()
    } catch (err) {
      setError('Hubo un error al crear la notificación')
    }
  }

  const handleClose = () => {
    setTitulo('')
    setDescripcion('')
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-panel border border-border-soft rounded-2xl max-w-lg w-full max-h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-soft">
          <h2 className="text-text-primary font-bold text-lg">Nueva notificación</h2>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-bg-hover rounded-lg transition-colors"
          >
            <X size={18} className="text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-priority-high/10 border border-priority-high/20">
              <AlertCircle size={16} className="text-priority-high flex-shrink-0 mt-0.5" />
              <p className="text-sm text-priority-high">{error}</p>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">
              Título
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value.slice(0, TITULO_MAX))}
              placeholder={`Título de la notificación (máx. ${TITULO_MAX} caracteres)`}
              className="w-full bg-bg-hover border border-border-soft rounded-lg px-4 py-3 text-text-primary text-sm placeholder-text-muted/50 focus:outline-none focus:border-brand-base transition-colors"
            />
            <p className="text-text-muted text-xs mt-1.5">
              {titulo.length}/{TITULO_MAX} caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value.slice(0, DESCRIPCION_MAX))}
              placeholder={`Descripción de la notificación (máx. ${DESCRIPCION_MAX} caracteres)`}
              rows={4}
              className="w-full bg-bg-hover border border-border-soft rounded-lg px-4 py-3 text-text-primary text-sm placeholder-text-muted/50 focus:outline-none focus:border-brand-base transition-colors resize-none"
            />
            <p className="text-text-muted text-xs mt-1.5">
              {descripcion.length}/{DESCRIPCION_MAX} caracteres
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border-soft text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2.5 rounded-lg bg-brand-base text-white hover:bg-brand-base/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {mutation.isPending ? 'Creando...' : 'Crear notificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
