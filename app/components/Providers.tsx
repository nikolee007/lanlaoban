'use client'
import { ReactNode } from 'react'
import { CompareProvider } from '../contexts/CompareContext'
import { ToastProvider } from '../contexts/ToastContext'
import { LocaleProvider } from '../contexts/LocaleContext'
import { ThemeProvider } from '../contexts/ThemeContext'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <CompareProvider>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </CompareProvider>
    </LocaleProvider>
  )
}
