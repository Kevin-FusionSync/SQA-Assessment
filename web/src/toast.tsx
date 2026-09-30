import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Icon from './components/Icon'

type Kind = 'success' | 'error'
interface ToastState {
  show: (message: string, kind?: Kind) => void
}

const ToastContext = createContext<ToastState | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; kind: Kind } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((message: string, kind: Kind = 'success') => {
    window.clearTimeout(timer.current)
    setToast({ id: Date.now(), message, kind })
    timer.current = window.setTimeout(() => setToast(null), 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`toast toast-${toast.kind}`}>
            <Icon name={toast.kind === 'success' ? 'checkCircle' : 'alert'} size={20} />
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => setToast(null)} aria-label="Dismiss notification">
              <Icon name="x" size={16} />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
