import { type FormEvent, useState } from 'react'
import trobatLogo from '../../../assets/trobatLogo.png'
import { useLoginMutation } from '../hooks/useLoginMutation'
import { LoginForm } from '../components/LoginForm'
import { ForgotPasswordRequest } from '../components/ForgotPasswordRequest'
import { ForgotPasswordVerify } from '../components/ForgotPasswordVerify'
import { ForgotPasswordSuccess } from '../components/ForgotPasswordSuccess'

const EMAIL_DOMAIN =
  (import.meta.env.VITE_EMAIL_DOMAIN as string | undefined) ?? 'policia.gob.ar'

type AuthStep = 'login' | 'request' | 'verify' | 'success'

export function LoginView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [domainError, setDomainError] = useState(false)
  const [step, setStep] = useState<AuthStep>('login')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryEmailError, setRecoveryEmailError] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [recoveryCode, setRecoveryCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const [recoveryError, setRecoveryError] = useState('')

  const mutation = useLoginMutation()

  const resetRecoveryFields = () => {
    setRecoveryEmail('')
    setRecoveryEmailError(false)
    setGeneratedCode(null)
    setRecoveryCode('')
    setNewPassword('')
    setConfirmPassword('')
    setRecoveryMessage('')
    setRecoveryError('')
  }

  const resetLoginFields = () => {
    setEmail('')
    setPassword('')
    setDomainError(false)
  }

  const goToLogin = () => {
    resetLoginFields()
    resetRecoveryFields()
    setStep('login')
  }

  const goToRequest = () => {
    resetRecoveryFields()
    setStep('request')
  }

  const goToVerify = () => {
    setRecoveryCode('')
    setNewPassword('')
    setConfirmPassword('')
    setRecoveryError('')
    setStep('verify')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.toLowerCase().endsWith(`@${EMAIL_DOMAIN}`)) {
      setDomainError(true)
      return
    }
    setDomainError(false)
    mutation.mutate({ email_institucional: email, password })
  }

  const handleSendRecoveryCode = () => {
    if (!recoveryEmail.toLowerCase().endsWith(`@${EMAIL_DOMAIN}`)) {
      setRecoveryEmailError(true)
      return
    }

    setRecoveryEmailError(false)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`Código de recuperación (mock): ${code}`)
    
    setGeneratedCode(code)
    goToVerify()
    setRecoveryMessage(
      `Se envió un código de recuperación al correo ${recoveryEmail}. (Mock: ${code})`
    )
  }

  const handleRecoverPassword = () => {
    if (!generatedCode || recoveryCode !== generatedCode) {
      setRecoveryError('El código ingresado no coincide.')
      return
    }

    if (newPassword.length < 6) {
      setRecoveryError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError('Las contraseñas no coinciden.')
      return
    }

    setRecoveryError('')
    setRecoveryMessage(
      'Contraseña actualizada correctamente. Ahora podés iniciar sesión con la nueva contraseña.'
    )
    setStep('success')
    setEmail(recoveryEmail)
    setPassword(newPassword)
    setGeneratedCode(null)
    setRecoveryCode('')
    setConfirmPassword('')
  }

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

        {step === 'login' ? (
          <LoginForm
            email={email}
            password={password}
            domainError={domainError}
            isPending={mutation.isPending}
            isError={mutation.isError}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
            onForgotPassword={goToRequest}
            emailDomain={EMAIL_DOMAIN}
          />
        ) : step === 'request' ? (
          <ForgotPasswordRequest
            recoveryEmail={recoveryEmail}
            recoveryEmailError={recoveryEmailError}
            recoveryMessage={recoveryMessage}
            onEmailChange={setRecoveryEmail}
            onSendCode={handleSendRecoveryCode}
            onBack={goToLogin}
            emailDomain={EMAIL_DOMAIN}
          />
        ) : step === 'verify' ? (
          <ForgotPasswordVerify
            recoveryCode={recoveryCode}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            recoveryError={recoveryError}
            onRecoveryCodeChange={setRecoveryCode}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handleRecoverPassword}
            onBack={goToLogin}
          />
        ) : (
          <ForgotPasswordSuccess onFinish={goToLogin} />
        )}
      </div>
    </div>
  )
}
