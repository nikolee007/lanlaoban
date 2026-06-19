'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import NavHeader from '../components/NavHeader'
import { FiUser, FiMail, FiBriefcase, FiPhone, FiLock, FiSave, FiCamera, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

export default function SettingsPage() {
  const { locale } = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile form
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')

  // Account info (read-only)
  const [userEmail, setUserEmail] = useState('')
  const [userCreatedAt, setUserCreatedAt] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('lanlaoban_token')
    setToken(t)
    if (!t) {
      router.push('/login')
      return
    }
    loadProfile()
  }, [])

  const authHeaders = (): Record<string, string> => {
    const t = localStorage.getItem('lanlaoban_token')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (t) headers['Authorization'] = `Bearer ${t}`
    return headers
  }

  const loadProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/profile', {
        headers: authHeaders(),
      })
      const data = await res.json()
      if (data.success && data.data) {
        const u = data.data
        setName(u.name || '')
        setAvatar(u.avatar || '')
        setCompany(u.company || '')
        setPhone(u.phone || '')
        setUserEmail(u.email || '')
        setUserCreatedAt(u.createdAt || '')
      } else {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        setError(t('settings.error.loadProfile', locale))
      }
    } catch {
      setError('加载用户信息失败')
    }
    setLoading(false)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name, avatar, company, phone }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(t('settings.saveSuccess', locale))
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || t('settings.error.saveFailed', locale))
      }
    } catch {
      setError(t('settings.error.network', locale))
    }
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!currentPassword) {
      setPasswordError(t('settings.error.passwordRequired', locale))
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError(t('settings.error.passwordMin', locale))
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.error.passwordMismatch', locale))
      return
    }

    setPasswordSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setPasswordSuccess(t('settings.passwordChanged', locale))
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(''), 3000)
      } else {
        setPasswordError(data.error || t('settings.error.changeFailed', locale))
      }
    } catch {
      setPasswordError(t('settings.error.network', locale))
    }
    setPasswordSaving(false)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('头像图片不能超过 2MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setAvatar(result)
      }
    }
    reader.onerror = () => {
      setError('图片读取失败，请重试')
    }
    reader.readAsDataURL(file)

    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavHeader />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('settings.title', locale)}</h1>

        {/* Profile Section */}
        <section className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-brand-400" />
            {t('settings.personalInfo', locale)}
          </h2>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <FiCheck className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar */}
            <div>
              <label className="input-label">{t('settings.avatar', locale)}</label>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div
                    className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={t('settings.avatar', locale)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                          const parent = (e.target as HTMLImageElement).parentElement
                          if (parent) {
                            parent.innerHTML = '<span class="text-2xl text-gray-400 font-bold">' + (name?.charAt(0) || '?') + '</span>'
                          }
                        }}
                      />
                    ) : (
                      <span className="text-2xl text-gray-400 font-bold">
                        {name?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiCamera className="w-6 h-6 text-white" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t('settings.avatarUrlPlaceholder', locale)}
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="input text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {t('settings.avatarHint', locale)}
                  </p>
                </div>
              </div>
            </div>

            {/* Nickname */}
            <div>
              <label htmlFor="name" className="input-label">{t('settings.nickname', locale)}</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder={t('settings.nicknamePlaceholder', locale)}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="input-label">
                <FiBriefcase className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                {t('settings.company', locale)}
              </label>
              <input
                id="company"
                type="text"
                className="input"
                placeholder={t('settings.companyPlaceholder', locale)}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="input-label">
                <FiPhone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                {t('settings.phone', locale)}
              </label>
              <input
                id="phone"
                type="tel"
                className="input"
                placeholder={t('settings.phonePlaceholder', locale)}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary inline-flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                {saving ? t('settings.saving', locale) : t('settings.save', locale)}
              </button>
            </div>
          </form>
        </section>

        {/* Password Section */}
        <section className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiLock className="w-5 h-5 text-brand-400" />
            {t('settings.changePassword', locale)}
          </h2>

          {passwordError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <FiCheck className="w-4 h-4 shrink-0" />
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label htmlFor="currentPassword" className="input-label">{t('settings.currentPassword', locale)}</label>
              <input
                id="currentPassword"
                type="password"
                className="input"
                placeholder={t('settings.currentPasswordPlaceholder', locale)}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="input-label">{t('settings.newPassword', locale)}</label>
              <input
                id="newPassword"
                type="password"
                className="input"
                placeholder={t('settings.newPasswordPlaceholder', locale)}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="input-label">{t('settings.confirmNewPassword', locale)}</label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                placeholder={t('settings.confirmNewPasswordPlaceholder', locale)}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="btn-outline inline-flex items-center gap-2"
              >
                <FiLock className="w-4 h-4" />
                {passwordSaving ? t('settings.savingPassword', locale) : t('settings.changePassword', locale)}
              </button>
            </div>
          </form>
        </section>

        {/* Account Info Section */}
        <section className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiMail className="w-5 h-5 text-brand-400" />
            {t('settings.accountInfo', locale)}
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">{t('settings.email', locale)}</span>
              <span className="text-gray-900">{userEmail || '--'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">{t('settings.registeredAt', locale)}</span>
              <span className="text-gray-900">
                {userCreatedAt ? new Date(userCreatedAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN') : '--'}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
