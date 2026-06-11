import type { Dispatch, FormEvent, SetStateAction } from 'react'

interface LoginFormProps {
  email: string
  password: string
  domainError: boolean
  isPending: boolean
  isError: boolean
  onEmailChange: Dispatch<SetStateAction<string>>
  onPasswordChange: Dispatch<SetStateAction<string>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onForgotPassword: () => void
  emailDomain: string
}

export function LoginForm({
  email,
  password,
  domainError,
  isPending,
  isError,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
  emailDomain,
}: LoginFormProps) {
  const inputClass =
    'w-full bg-bg-hover border border-border-soft rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-base transition-colors text-sm'

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
          Email institucional
        </label>
        <input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder={`agente@${emailDomain}`}
          required
          className={inputClass}
        />
        {domainError && (
          <p className="text-priority-high text-xs mt-1.5">
            El email debe pertenecer al dominio @{emailDomain}
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
          onChange={(event) => onPasswordChange(event.target.value)}
          required
          className={inputClass}
        />
      </div>

      {isError && (
        <p className="text-priority-high text-sm bg-priority-high/10 border border-priority-high/20 rounded-lg px-3 py-2">
          Credenciales inválidas. Intente nuevamente.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-base hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm"
      >
        {isPending ? 'Verificando...' : 'Iniciar sesión'}
      </button>

      <p
        onClick={onForgotPassword}
        className=" text-text-secondary text-center align-middle hover:text-text-primary transition-colors text-sm cursor-default"
      >
        ¿Olvidaste tu contraseña?
      </p>
    </form>
  )
}
