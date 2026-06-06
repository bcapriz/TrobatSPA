import { type FormEvent, useState } from 'react'
import trobatLogo from '../../../assets/trobatLogo.png'
import { useLoginMutation } from '../hooks/useLoginMutation'

const EMAIL_DOMAIN =
  (import.meta.env.VITE_EMAIL_DOMAIN as string | undefined) ?? 'policia.gob.ar'

export function LoginView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [domainError, setDomainError] = useState(false)

  const mutation = useLoginMutation()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.toLowerCase().endsWith(`@${EMAIL_DOMAIN}`)) {
      setDomainError(true)
      return
    }
    setDomainError(false)
    mutation.mutate({ email_institucional: email, password })
  }

  const inputClass =
    'w-full bg-bg-hover border border-border-soft rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-base transition-colors text-sm'

  return (
    <div className="min-h-screen bg-bg-app flex items-center justify-center px-4">
      <div className="w-full max-w-[360px] bg-bg-panel border border-border-hard rounded-xl p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="w-30 h-30 rounded-3xl mb-4 overflow-hidden mx-auto">
            <img src={trobatLogo} alt="Trobat" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-base to-brand-dark bg-clip-text text-transparent">
            TROBAT
          </h1>
          <p className="text-text-secondary text-sm mt-1">Panel de Control Policial</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
              Email institucional
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setDomainError(false)
              }}
              placeholder={`agente@${EMAIL_DOMAIN}`}
              required
              className={inputClass}
            />
            {domainError && (
              <p className="text-priority-high text-xs mt-1.5">
                El email debe pertenecer al dominio @{EMAIL_DOMAIN}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {mutation.isError && (
            <p className="text-priority-high text-sm bg-priority-high/10 border border-priority-high/20 rounded-lg px-3 py-2">
              Credenciales inválidas. Intente nuevamente.
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-brand-base hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm"
          >
            {mutation.isPending ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
