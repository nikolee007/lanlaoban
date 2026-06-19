'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiUser, FiCheck } from 'react-icons/fi'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const { locale } = useLocale()
  const [mode, setMode] = useState<Mode>('login')

  // Login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')
  const [regFieldErrors, setRegFieldErrors] = useState<Record<string, string>>({})

  const resetLoginForm = () => {
    setEmail('')
    setPassword('')
    setError('')
  }

  const resetRegisterForm = () => {
    setRegName('')
    setRegEmail('')
    setRegPassword('')
    setRegConfirm('')
    setRegError('')
    setRegFieldErrors({})
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setError('')
    setRegError('')
    setRegFieldErrors({})
  }

  const validateRegister = (): boolean => {
    const errors: Record<string, string> = {}
    if (!regName.trim()) errors.name = t('login.error.nickname', locale)
    if (!regEmail.trim()) {
      errors.email = t('login.error.email', locale)
    } else if (!regEmail.includes('@')) {
      errors.email = t('login.error.emailInvalid', locale)
    }
    if (!regPassword) {
      errors.password = t('login.error.password', locale)
    } else if (regPassword.length < 6) {
      errors.password = t('login.error.passwordMin', locale)
    }
    if (regPassword !== regConfirm) {
      errors.confirm = t('login.error.passwordMismatch', locale)
    }
    setRegFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('lanlaoban_token', data.token)
        window.location.href = '/global-supply'
      } else {
        setError(data.error || t('login.error.credentials', locale))
      }
    } catch { setError(t('login.error.network', locale)) }
    finally { setLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRegister()) return
    setRegLoading(true)
    setRegError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim(),
          password: regPassword,
          name: regName.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('lanlaoban_token', data.token)
        localStorage.setItem('lanlaoban_new_user', 'true')
        window.location.href = '/interview'
      } else {
        setRegError(data.error || t('login.error.register', locale))
      }
    } catch { setRegError(t('login.error.network', locale)) }
    finally { setRegLoading(false) }
  }

  const tabClass = (tab: Mode) =>
    `flex-1 pb-3 text-sm font-medium text-center border-b-2 transition-colors ${
      mode === tab
        ? 'border-brand-400 text-brand-400'
        : 'border-transparent text-gray-400 hover:text-gray-600'
    }`

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <div className="flex items-center justify-center px-4 pt-12 pb-20">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">懒</div>
          <h1 className="section-title text-center">
            {mode === 'login' ? t('login.title', locale) : t('login.registerTitle', locale)}
          </h1>
        </div>
        <div className="card">
          {/* Tabs */}
          <div className="flex mb-6">
            <button
              type="button"
              className={tabClass('login')}
              onClick={() => switchMode('login')}
            >
              {t('login.tab.login', locale)}
            </button>
            <button
              type="button"
              className={tabClass('register')}
              onClick={() => switchMode('register')}
            >
              {t('login.tab.register', locale)}
            </button>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">{t('login.email', locale)}</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input id="email" type="email" className="input pl-10" placeholder={t('login.emailPlaceholder', locale)} value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">{t('login.password', locale)}</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input id="password" type={showPassword ? 'text' : 'password'} className="input pl-10 pr-10" placeholder={t('login.passwordPlaceholder', locale)} value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff className="w-5 h-5 text-gray-400" /> : <FiEye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? t('login.submitting', locale) : <>{t('login.submit', locale)}<FiArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label htmlFor="regName" className="text-sm font-medium text-gray-700 mb-1 block">{t('login.nickname', locale)}</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="regName"
                    type="text"
                    className={`input pl-10 ${regFieldErrors.name ? 'border-red-300' : ''}`}
                    placeholder={t('login.nicknamePlaceholder', locale)}
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                  />
                </div>
                {regFieldErrors.name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <FiCheck className="w-3 h-3" />
                    {regFieldErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="regEmail" className="text-sm font-medium text-gray-700 mb-1 block">{t('login.email', locale)}</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="regEmail"
                    type="email"
                    className={`input pl-10 ${regFieldErrors.email ? 'border-red-300' : ''}`}
                    placeholder={t('login.emailPlaceholder', locale)}
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                {regFieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <FiCheck className="w-3 h-3" />
                    {regFieldErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="regPassword" className="text-sm font-medium text-gray-700 mb-1 block">{t('login.password', locale)}</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="regPassword"
                    type={showRegPassword ? 'text' : 'password'}
                    className={`input pl-10 pr-10 ${regFieldErrors.password ? 'border-red-300' : ''}`}
                    placeholder={t('login.passwordAtLeast', locale)}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowRegPassword(!showRegPassword)}>
                    {showRegPassword ? <FiEyeOff className="w-5 h-5 text-gray-400" /> : <FiEye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
                {regFieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <FiCheck className="w-3 h-3" />
                    {regFieldErrors.password}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="regConfirm" className="text-sm font-medium text-gray-700 mb-1 block">{t('login.confirmPassword', locale)}</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="regConfirm"
                    type="password"
                    className={`input pl-10 ${regFieldErrors.confirm ? 'border-red-300' : ''}`}
                    placeholder={t('login.confirmPasswordPlaceholder', locale)}
                    value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                    required
                  />
                </div>
                {regFieldErrors.confirm && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <FiCheck className="w-3 h-3" />
                    {regFieldErrors.confirm}
                  </p>
                )}
              </div>
              {regError && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{regError}</div>}
              <button type="submit" disabled={regLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                {regLoading ? t('login.registering', locale) : <>{t('login.register', locale)}<FiArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
