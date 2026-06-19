'use client'
import { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

const TOAST_COLORS: Record<ToastType, string> = {
  success: 'bg-[#10B981]',
  error: 'bg-[#EF4444]',
  info: 'bg-[#3B82F6]',
  warning: 'bg-[#F59E0B]',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [leavingIds, setLeavingIds] = useState<Set<number>>(new Set())
  const nextIdRef = useRef(0)

  const removeToast = useCallback((id: number) => {
    setLeavingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      setLeavingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 200)
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextIdRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none">
        {toasts.map(t => {
          const isLeaving = leavingIds.has(t.id)
          return (
            <div
              key={t.id}
              onClick={() => removeToast(t.id)}
              className={`pointer-events-auto cursor-pointer flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold text-white transition-all duration-200 ${
                isLeaving
                  ? 'opacity-0 translate-x-4'
                  : 'opacity-100 translate-x-0 animate-slide-in-right'
              } shadow-2xl ${TOAST_COLORS[t.type]}`}
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-base leading-none shrink-0">
                {TOAST_ICONS[t.type]}
              </span>
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
