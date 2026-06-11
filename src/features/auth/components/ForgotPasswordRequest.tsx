import type { Dispatch, SetStateAction } from 'react'

interface ForgotPasswordRequestProps {
  recoveryEmail: string
  recoveryEmailError: boolean
  recoveryMessage: string
  onEmailChange: Dispatch<SetStateAction<string>>
  onSendCode: () => void
  onBack: () => void
  emailDomain: string
}

export function ForgotPasswordRequest({
  recoveryEmail,
  recoveryEmailError,
  recoveryMessage,
  onEmailChange,
  onSendCode,
  onBack,
  emailDomain,
}: ForgotPasswordRequestProps) {
  const inputClass =
    'w-full bg-bg-hover border border-border-soft rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-base transition-colors text-sm'

  return (
    <div className="space-y-4">
        <p className="text-text-secondary text-sm mt-1">
          Ingresá tu email para recibir un código de recuperación.
        </p>
      
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
          Email institucional
        </label>
        <input
          type="email"
          value={recoveryEmail}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder={`agente@${emailDomain}`}
          required
          className={inputClass}
        />
        {recoveryEmailError && (
          <p className="text-priority-high text-xs mt-1.5">
            El email debe pertenecer al dominio @{emailDomain}
          </p>
        )}
      </div>

      {recoveryMessage && (
        <p className="text-text-secondary text-sm bg-bg-hover border border-border-soft rounded-lg px-3 py-2">
          {recoveryMessage}
        </p>
      )}

      <button
        type="button"
        onClick={onSendCode}
        className="w-full bg-brand-base hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-colors mt-2 text-sm"
      >
        Enviar código
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-text-secondary hover:text-text-primary border border-border-soft rounded-lg py-2.5 transition-colors text-sm"
      >
        Volver al inicio de sesión
      </button>
    </div>
  )
}
