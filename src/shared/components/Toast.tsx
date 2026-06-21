import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-xl pointer-events-auto w-80 bg-bg-panel ${
              toast.type === 'success' ? 'border-priority-low/40' : 'border-priority-high/40'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={16} className="mt-0.5 shrink-0 text-priority-low" />
            ) : (
              <XCircle size={16} className="mt-0.5 shrink-0 text-priority-high" />
            )}
            <span className="text-sm flex-1 text-text-primary">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-text-muted hover:text-text-secondary transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
