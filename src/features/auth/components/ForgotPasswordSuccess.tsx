interface ForgotPasswordSuccessProps {
  onFinish: () => void
}

export function ForgotPasswordSuccess({ onFinish }: ForgotPasswordSuccessProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg text-center font-semibold text-text-primary">Contraseña actualizada</h2>
        <p className="text-text-secondary text-center text-sm mt-1">
          Ya podés iniciar sesión con la nueva contraseña.
        </p>
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="w-full bg-brand-base hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-colors mt-2 text-sm"
      >
        Volver al inicio
      </button>
    </div>
  )
}
