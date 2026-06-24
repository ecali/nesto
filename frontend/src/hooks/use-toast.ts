import { useState, useCallback, createContext, useContext, createElement, type ReactNode } from 'react'
import type { ToastProps, ToastActionElement } from '@/components/ui/toast'

interface Toast extends ToastProps {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (props: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return `toast-${count}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = genId()
    setToasts((prev) => [...prev, { ...props, id }])
    if (props.duration !== Infinity) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, props.duration || 5000)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return createElement(
    ToastContext.Provider,
    { value: { toasts, toast, dismiss } },
    children
  )
}

export { ToastContext }
