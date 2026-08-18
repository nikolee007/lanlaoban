'use client'
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from '../contexts/LocaleContext'
import { useTheme } from '../contexts/ThemeContext'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import LocaleSwitch from './LocaleSwitch'
import NotificationBell from './NotificationBell'
import {
  FiChevronDown,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiFileText,
  FiPackage,
} from 'react-icons/fi'

type UserProfile = {
  id: number
  email: string
  name: string
  avatar: string
  company: string
  phone: string
}

/** 导航项 */
type NavItem = { key: string; href: string; isAI: boolean; comingSoon?: boolean; eta?: string }

/** 核心导航（桌面顶部平铺，只留最核心能力） */
const CORE_NAV: NavItem[] = [
  { key: 'nav.dashboard', href: '/dashboard', isAI: false },
  { key: 'nav.demo', href: '/demo', isAI: false },
  { key: 'nav.productVisual', href: '/clone', isAI: true },
  { key: 'nav.pricing', href: '/pricing', isAI: false },
  { key: 'nav.multilang', href: '/coming-soon', isAI: true, comingSoon: true },
  { key: 'nav.onion', href: '/onion', isAI: false, comingSoon: true },
]

export default function NavHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { locale, setLocale } = useLocale()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Persist locale to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lanlaoban_locale') as Locale | null
      if (saved && (saved === 'zh' || saved === 'en' || saved === 'fr')) {
        setLocale(saved)
      }
    } catch {} // eslint-disable-line no-empty
  }, [setLocale])

  useEffect(() => {
    try { localStorage.setItem('lanlaoban_locale', locale) } catch {} // eslint-disable-line no-empty
  }, [locale])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    try {
      const t = localStorage.getItem('lanlaoban_token')
      if (t) {
        fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${t}` },
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.data) setUser(data.data)
          })
          .catch(() => {})
      }
    } catch {} // eslint-disable-line no-empty
  }, [])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const isActive = (href: string) => {
    if (href === '/pricing') return pathname === '/pricing'
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('lanlaoban_token')
      document.cookie = 'lanlaoban_token=;path=/;max-age=0'
    } catch {} // eslint-disable-line no-empty
    setUser(null)
    setUserMenuOpen(false)
    router.push('/')
  }

  const userInitial = user?.name?.charAt(0) || user?.email?.charAt(0) || '?'

  return (
    <nav className="border-b border-[#E5E7EB]/50 bg-white/90 backdrop-blur-xl sticky top-0 z-50" role="navigation" aria-label={mobileMenuOpen ? t('menu.label', locale) : t('menu.label', locale)}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-[#FF6034] to-[#FF8A66] rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg shadow-[#FF6034]/20">
            懒
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#0A0A0B] tracking-tight">懒老板</span>
            <span className="hidden sm:inline-flex text-[10px] leading-none px-2 py-1 rounded-full bg-gradient-to-r from-[#FF6034]/10 to-[#FF8A66]/10 text-[#FF6034] font-medium border border-[#FF6034]/15 tracking-wide">
              {t('eco.platform', locale)}
            </span>
          </div>
        </Link>

        {/* Desktop Nav — 极简核心导航 */}
        <div className="hidden sm:flex items-center gap-x-2.5" ref={navRef}>
          {CORE_NAV.map((item) => (
            <Link
              key={item.key}
              href={item.comingSoon ? '/coming-soon' : item.href}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                item.comingSoon
                  ? 'text-gray-400 hover:text-gray-500'
                  : isActive(item.href) ? 'text-brand-400 bg-brand-50' : 'text-gray-600 hover:text-brand-500 hover:bg-orange-50'
              }`}
            >
              {t(item.key, locale)}
              {item.comingSoon ? (
                <span className="ml-0.5 inline-flex items-center rounded bg-gray-200 text-gray-500 px-[3px] py-[1px] text-[7px] font-medium leading-none whitespace-nowrap">{item.eta || '未开放'}</span>
              ) : item.isAI ? (
                <span className="inline-flex items-center rounded bg-gradient-to-r from-brand-400 to-purple-500 px-[3px] py-[1px] text-[8px] font-bold text-white leading-none">AI</span>
              ) : null}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switch */}
          <LocaleSwitch />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={theme === 'dark' ? '切换到亮色模式' : '切换到深色模式'}
          >
            {theme === 'dark' ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>

          <div className="hidden sm:block" />

          {user && (
            <div className="hidden sm:flex">
              <NotificationBell />
            </div>
          )}
          {user ? (
            <div className="hidden sm:relative sm:flex" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center text-white text-sm font-bold">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    userInitial
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">
                  {user.name || user.email}
                </span>
                <FiChevronDown
                  className={`h-3 w-3 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name || t('nav.profile', locale)}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/persona"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FiPackage className="w-4 h-4 text-gray-400" />
                    IP 操盘
                  </Link>
                  <Link
                    href="/brand-promotion"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FiFileText className="w-4 h-4 text-gray-400" />
                    产品可视化
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FiSettings className="w-4 h-4 text-gray-400" />
                    {t('account.settings', locale)}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="w-4 h-4" />
                    {t('account.logout', locale)}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-[#FF6034] to-[#FF8A66] hover:shadow-lg hover:shadow-[#FF6034]/20 transition-all"
            >
              {t('nav.login', locale)}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label={mobileMenuOpen ? t('menu.label', locale) : t('menu.label', locale)}
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto"
        >
          <div className="px-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">核心功能</div>
          {CORE_NAV.map((item) => (
            <Link
              key={item.key}
              href={item.comingSoon ? '/coming-soon' : item.href}
              className={`flex items-center gap-1 px-3 min-h-[44px] text-sm font-medium rounded-lg transition-colors ${
                item.comingSoon
                  ? 'text-gray-400'
                  : isActive(item.href) ? 'text-brand-400 bg-brand-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={closeMobileMenu}
            >
              {t(item.key, locale)}
              {item.comingSoon ? (
                <span className="ml-1 inline-flex items-center rounded bg-gray-200 text-gray-400 px-1.5 py-0.5 text-[8px] font-medium">{item.eta || '未开放'}</span>
              ) : item.isAI ? (
                <span className="ml-0.5 inline-flex items-center rounded bg-gradient-to-r from-brand-400 to-purple-500 px-1 py-0.5 text-[9px] font-bold text-white leading-none">AI</span>
              ) : null}
            </Link>
          ))}
          <div className="pt-3 px-3" />

          {user ? (
            <>
              <Link
                href="/settings"
                className="block px-3 min-h-[44px] text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                {t('account.settings', locale)}
              </Link>
              <div className="pt-2 px-3 pb-1">
                <button
                  onClick={() => { handleLogout(); closeMobileMenu(); }}
                  className="block w-full text-center px-4 min-h-[44px] text-sm font-semibold text-red-600 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                >
                  {t('account.logout', locale)}
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 px-3 pb-1">
              <Link
                href="/login"
                className="block w-full text-center px-4 min-h-[44px] text-sm font-semibold text-white rounded-lg bg-brand-400 hover:bg-brand-500 transition-colors"
                onClick={closeMobileMenu}
              >
                {t('nav.login', locale)}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
