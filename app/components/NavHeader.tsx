'use client'
import React, { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from '../contexts/LocaleContext'
import { useTheme } from '../contexts/ThemeContext'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import DemoButton from './DemoButton'
import LocaleSwitch from './LocaleSwitch'
import NotificationBell from './NotificationBell'
import {
  FiCamera,
  FiCalendar,
  FiGlobe,
  FiTrendingUp,
  FiPackage,
  FiSettings,
  FiChevronDown,
  FiSearch,
  FiLogOut,
  FiMenu,
  FiX,
  FiShoppingCart,
  FiInbox,
  FiSun,
  FiMoon,
  FiZap,
  FiFileText,
  FiUser,
} from 'react-icons/fi'

type DropdownItem = {
  icon: React.ReactNode
  title: string
  desc: string
  href?: string
  disabled?: boolean
  featured?: boolean
}

type UserProfile = {
  id: number
  email: string
  name: string
  avatar: string
  company: string
  phone: string
}

type NavDropdown = {
  label: string
  items: DropdownItem[]
}

function getNavDropdowns(locale: Locale, user: UserProfile | null): NavDropdown[] {
  const aiTools: DropdownItem[] = [
    { icon: <FiCamera className="w-5 h-5 text-gray-500" />, title: t('content.generate', locale), desc: t('desc.generate', locale), href: '/ai-video' },
    { icon: <FiUser className="w-5 h-5 text-purple-500" />, title: t('content.avatar', locale), desc: t('desc.avatar', locale), href: '/digital-human' },
    { icon: <FiGlobe className="w-5 h-5 text-green-500" />, title: t('nav.crossBorder', locale), desc: t('desc.crossBorder', locale), href: '/cross-border' },
  ]

  const globalItems: DropdownItem[] = [
    { icon: <FiGlobe className="w-5 h-5 text-gray-500" />, title: t('nav.findProducts', locale), desc: t('desc.supplyChain', locale), href: '/global-supply' },
    { icon: <FiTrendingUp className="w-5 h-5 text-gray-500" />, title: t('nav.trending', locale), desc: t('desc.trending', locale), href: '/global-supply/hot' },
    { icon: <FiPackage className="w-5 h-5 text-gray-500" />, title: t('nav.myResources', locale), desc: t('desc.resources', locale), href: '/global-supply/my-resources' },
  ]

  if (user) {
    globalItems.push(
      { icon: <FiShoppingCart className="w-5 h-5 text-gray-500" />, title: t('nav.cart', locale), desc: t('desc.cart', locale), href: '/global-supply/cart' },
      { icon: <FiInbox className="w-5 h-5 text-gray-500" />, title: t('nav.inquiries', locale), desc: t('desc.inquiries', locale), href: '/global-supply/inquiries' },
      { icon: <FiFileText className="w-5 h-5 text-gray-500" />, title: t('nav.orders', locale), desc: t('desc.orders', locale), href: '/global-supply/orders' },
    )
  }

  return [
    {
      label: t('nav.aiContent', locale),
      items: aiTools,
    },
    {
      label: t('nav.global', locale),
      items: globalItems,
    },
    {
      label: t('nav.aiSite', locale),
      items: [
        { icon: <FiZap className="w-5 h-5 text-brand-400" />, title: t('nav.aiSite', locale), desc: t('desc.aiSite', locale), href: '/global-supply/ai-assistant', featured: true },
      ],
    },
  ]
}

export default function NavHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { locale, setLocale } = useLocale()
  const { theme, toggleTheme } = useTheme()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
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

  const dropdowns = useMemo(() => getNavDropdowns(locale, user), [locale, user])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
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

  const toggleDropdown = (label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label))
  }

  const closeAll = () => {
    setOpenDropdown(null)
    setMobileMenuOpen(false)
  }

  const isGlobalSupplyActive = pathname.startsWith('/global-supply')

  const handleLogout = () => {
    try { localStorage.removeItem('lanlaoban_token') } catch {} // eslint-disable-line no-empty
    setUser(null)
    setUserMenuOpen(false)
    router.push('/')
  }

  const userInitial = user?.name?.charAt(0) || user?.email?.charAt(0) || '?'

  const triggerClasses = (label: string) => {
    const isActive = label === t('nav.global', locale) && isGlobalSupplyActive
    return `flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'text-brand-400 bg-brand-50'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`
  }

  const isAdminActive = pathname === '/admin'

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50" role="navigation" aria-label={mobileMenuOpen ? t('menu.label', locale) : t('menu.label', locale)}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            懒
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">懒老板</span>
            <span className="hidden sm:inline-flex text-[11px] leading-none px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-400 font-medium border border-brand-100/60">
              {t('eco.platform', locale)}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-1" ref={navRef}>
          {dropdowns.map((dd) => (
            <div key={dd.label} className="relative">
              <button
                onClick={() => toggleDropdown(dd.label)}
                className={triggerClasses(dd.label)}
              >
                {dd.label === t('nav.aiContent', locale) ? (
                  <span className="bg-gradient-to-r from-brand-400 to-purple-500 bg-clip-text text-transparent font-bold">{dd.label}</span>
                ) : dd.label}
                {dd.label === t('nav.aiContent', locale) && (
                  <span className="ml-1 inline-flex items-center rounded bg-gradient-to-r from-brand-400 to-purple-500 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none shadow-sm animate-pulse-glow">AI</span>
                )}
                <FiChevronDown
                  className={`h-3 w-3 transition-transform ${openDropdown === dd.label ? 'rotate-180' : ''}`}
                />
              </button>
              {openDropdown === dd.label && (
                <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-xl border border-gray-100 bg-white py-2 shadow-xl" role="menu">
                  {/* Search box inside global resource dropdown */}
                  {dd.label === t('nav.global', locale) && (
                    <div className="border-b border-gray-100 px-4 pb-3 mb-1">
                      <div className="relative">
                        <FiSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t('search.supply', locale)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                              window.location.href = `/global-supply/search?q=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-7 pr-2 text-xs text-gray-700 placeholder-gray-400 transition-colors focus:border-brand-300 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                  {dd.items.map((item) =>
                    item.disabled ? (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 px-4 py-3 opacity-40 cursor-not-allowed select-none"
                        role="menuitem"
                      >
                        <span className="mt-0.5 leading-none">{item.icon}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-400">{item.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        key={item.title}
                        href={item.href!}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                          item.featured
                            ? 'bg-gradient-to-r from-brand-50 to-white mx-2 rounded-lg border border-brand-100'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={closeAll}
                        role="menuitem"
                      >
                        <span className={`mt-0.5 leading-none ${item.featured ? 'text-brand-400' : ''}`}>{item.icon}</span>
                        <div className="min-w-0">
                          <div className={`text-sm font-medium ${
                            item.featured
                              ? 'text-brand-500'
                              : item.href === '/global-supply' && isGlobalSupplyActive
                                ? 'text-brand-400'
                                : 'text-gray-900'
                          }`}
                          >
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/pricing"
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/pricing'
                ? 'text-brand-400 bg-brand-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t('nav.pricing', locale)}
          </Link>

          {user && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isAdminActive
                  ? 'text-brand-400 bg-brand-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FiSettings className="w-4 h-4" />
              <span>{t('nav.adminPanel', locale)}</span>
            </Link>
          )}
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

          <div className="hidden sm:block">
            <DemoButton />
          </div>
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
                    href="/global-supply/my-resources"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FiPackage className="w-4 h-4 text-gray-400" />
                    {t('content.resources', locale)}
                  </Link>
                  <Link
                    href="/global-supply/cart"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FiShoppingCart className="w-4 h-4 text-gray-400" />
                    {t('nav.cart', locale)}
                  </Link>
                  <Link
                    href="/global-supply/orders"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FiFileText className="w-4 h-4 text-gray-400" />
                    我的订单
                  </Link>
                  <Link
                    href="/global-supply/inquiries"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FiInbox className="w-4 h-4 text-gray-400" />
                    {t('nav.inquiries', locale)}
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
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-brand-400 hover:bg-brand-500 transition-colors"
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
          {dropdowns.map((dd) => (
            <div key={dd.label}>
              <button
                onClick={() => toggleDropdown(dd.label)}
                className={`w-full flex items-center justify-between px-3 min-h-[44px] text-sm font-medium rounded-lg transition-colors ${
                  dd.label === t('nav.global', locale) && isGlobalSupplyActive
                    ? 'text-brand-400 bg-brand-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {dd.label}
                <FiChevronDown
                  className={`h-3 w-3 transition-transform ${openDropdown === dd.label ? 'rotate-180' : ''}`}
                />
              </button>
              {openDropdown === dd.label && (
                <div className="ml-2 mt-1 space-y-0.5 border-l-2 border-brand-100 pl-2" role="menu">
                  {/* Search box inside mobile global resource dropdown */}
                  {dd.label === t('nav.global', locale) && (
                    <div className="px-3 pb-2 pt-1">
                      <div className="relative">
                        <FiSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t('search.supply', locale)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                              window.location.href = `/global-supply/search?q=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-7 pr-2 text-xs text-gray-700 placeholder-gray-400 transition-colors focus:border-brand-300 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                  {dd.items.map((item) =>
                    item.disabled ? (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 px-4 py-3 opacity-40 cursor-not-allowed select-none rounded-lg"
                        role="menuitem"
                      >
                        <span className="leading-none">{item.icon}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-400">{item.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        key={item.title}
                        href={item.href!}
                        className={`flex items-start gap-3 px-4 min-h-[44px] py-3 rounded-lg transition-colors ${
                          item.featured
                            ? 'bg-gradient-to-r from-brand-50 to-white border border-brand-100'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={closeAll}
                        role="menuitem"
                      >
                        <span className={`leading-none ${item.featured ? 'text-brand-400' : ''}`}>{item.icon}</span>
                        <div className="min-w-0">
                          <div className={`text-sm font-medium ${
                            item.featured
                              ? 'text-brand-500'
                              : item.href === '/global-supply' && isGlobalSupplyActive
                                ? 'text-brand-400'
                                : 'text-gray-900'
                          }`}
                          >
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/pricing"
            className={`block px-3 min-h-[44px] text-sm font-medium rounded-lg transition-colors ${
              pathname === '/pricing'
                ? 'text-brand-400 bg-brand-50'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={closeAll}
          >
            {t('nav.pricing', locale)}
          </Link>

          {user && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3 min-h-[44px] text-sm font-medium rounded-lg transition-colors ${
                isAdminActive
                  ? 'text-brand-400 bg-brand-50'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              onClick={closeAll}
            >
              <FiSettings className="w-4 h-4" />
              {t('nav.adminPanel', locale)}
            </Link>
          )}

          <div className="pt-3 px-3">
            <DemoButton />
          </div>

          {user ? (
            <>
              <Link
                href="/settings"
                className="block px-3 min-h-[44px] text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={closeAll}
              >
                {t('account.settings', locale)}
              </Link>
              <div className="pt-2 px-3 pb-1">
                <button
                  onClick={() => { handleLogout(); closeAll(); }}
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
                onClick={closeAll}
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
