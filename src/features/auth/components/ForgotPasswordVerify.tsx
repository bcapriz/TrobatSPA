import type { Dispatch, SetStateAction } from 'react'

interface ForgotPasswordVerifyProps {
  recoveryCode: string
  newPassword: string
  confirmPassword: string
  recoveryError: string
  onRecoveryCodeChange: Dispatch<SetStateAction<string>>
  onNewPasswordChange: Dispatch<SetStateAction<string>>
  onConfirmPasswordChange: Dispatch<SetStateAction<string>>
  onSubmit: () => void
  onBack: () => void
}

export function ForgotPasswordVerify({
  recoveryCode,
  newPassword,
  confirmPassword,
  recoveryError,
  onRecoveryCodeChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onBack,
}: ForgotPasswordVerifyProps) {
  const inputClass =
    'w-full bg-bg-hover border border-border-soft rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-base transition-colors text-sm'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
          Código de recuperación
        </label>
        <input
          type="text"
          value={recoveryCode}
          onChange={(event) => onRecoveryCodeChange(event.target.value)}
          placeholder="Código de 6 dígitos"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
          Nueva contraseña
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(event) => onNewPasswordChange(event.target.value)}
          placeholder="Nueva contraseña"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
          Confirmar contraseña
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          placeholder="Repetir contraseña"
          className={inputClass}
        />
      </div>

      {recoveryError && (
        <p className="text-priority-high text-sm bg-priority-high/10 border border-priority-high/20 rounded-lg px-3 py-2">
          {recoveryError}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        className="w-full bg-brand-base hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-colors mt-2 text-sm"
      >
        Actualizar contraseña
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
