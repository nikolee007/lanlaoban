'use client'
import { useEffect } from 'react'
import ErrorBoundary from './ErrorBoundary'

export default function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Global error handler - prevents white screen from uncaught errors
    const original = window.onerror
    window.onerror = (_msg, _url, _line, _col, err) => {
      console.error('[GlobalErrorHandler]', err?.message || _msg)
      // Don't show alert, just log it - ErrorBoundary will catch render errors
      return true // prevents default browser error handling
    }

    const rejections = (e: PromiseRejectionEvent) => {
      console.error('[UnhandledRejection]', e.reason?.message || String(e.reason))
    }
    window.addEventListener('unhandledrejection', rejections)

    return () => {
      window.onerror = original
      window.removeEventListener('unhandledrejection', rejections)
    }
  }, [])

  return (
    <ErrorBoundary fullPage>
      {children}
    </ErrorBoundary>
  )
}
