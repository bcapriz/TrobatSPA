import { ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../../core/stores/authStore'

export function PerfilView() {
  const usuario = useAuthStore((s) => s.usuario)

  const initials = usuario?.nombre
    ? usuario.nombre
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'AG'

  const fields = [
    { label: 'Legajo', value: usuario?.legajo ?? '—' },
    { label: 'Rango', value: usuario?.rango ?? '—' },
    { label: 'Email institucional', value: usuario?.email_institucional ?? '—' },
  ]

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-bg-panel border border-border-soft rounded-xl p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-brand-base flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-text-primary text-lg font-semibold">
              {usuario?.nombre ?? 'Agente'}
            </h2>
            <span className="flex items-center gap-1 text-xs text-priority-low bg-priority-low/10 border border-priority-low/20 px-2 py-0.5 rounded-full font-medium">
              <ShieldCheck size={11} />
              Verificado
            </span>
          </div>
          <p className="text-text-secondary text-sm">{usuario?.rango ?? 'Oficial Policial'}</p>
        </div>
      </div>

      <div className="bg-bg-panel border border-border-soft rounded-xl p-6">
        <h3 className="text-text-primary font-semibold mb-4">Datos institucionales</h3>
        <dl className="space-y-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <dt className="text-text-secondary">{label}</dt>
              <dd className="text-text-primary font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-bg-panel border border-border-soft rounded-xl p-6">
        <h3 className="text-text-primary font-semibold mb-4">Preferencias</h3>
        <div className="space-y-3">
          {['Notificaciones Push', 'Alertas por Email'].map((pref) => (
            <div key={pref} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{pref}</span>
              <span className="text-xs font-semibold text-priority-low bg-priority-low/10 border border-priority-low/20 px-2 py-0.5 rounded-full">
                Activado
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
