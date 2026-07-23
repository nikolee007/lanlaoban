'use client'

import { useState, useEffect } from 'react'
import {
  FiCalendar,
} from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import NavHeader from '@/app/components/NavHeader'
import StatsGrid from './components/StatsGrid'
import DashboardSkeleton from './components/DashboardSkeleton'
import UnauthenticatedState from './components/UnauthenticatedState'

/* ─── Types ──────────────────────────────────────── */

interface UserProfile {
  id: number
  email: string
  name: string
  avatar: string
  company: string
  phone: string
  createdAt?: string
}

interface DashboardData {
  activeDays: number
}

/* ─── Helpers ────────────────────────────────────── */

function calculateActiveDays(createdAt: string): number {
  try {
    const created = new Date(createdAt)
    const now = new Date()
    const diff = now.getTime() - created.getTime()
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)))
  } catch {
    return 1
  }
}



/* ═══════════════════════════════════════════════════
   Dashboard Page
   ═══════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { locale } = useLocale()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [data, setData] = useState<DashboardData>({
    activeDays: 0,
  })

  useEffect(() => {
    const token = localStorage.getItem('lanlaoban_token')
    if (!token) {
      setAuthenticated(false)
      setLoading(false)
      return
    }

    fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((profileRes) => {
        if (!profileRes.success || !profileRes.data) {
          setAuthenticated(false)
          setLoading(false)
          return
        }

        const profile = profileRes.data as UserProfile
        setUser(profile)
        setAuthenticated(true)

        const activeDays = profile.createdAt
          ? calculateActiveDays(profile.createdAt)
          : 1

        const headers = { Authorization: `Bearer ${token}` }

        setData((prev) => ({
          ...prev,
          activeDays,
        }))
        setLoading(false)
      })
      .catch(() => {
        setAuthenticated(false)
        setLoading(false)
      })
  }, [])

  if (loading) return <DashboardSkeleton />
  if (!authenticated) return <UnauthenticatedState />

  const isEn = locale === 'en'

  const statCards = [
    { icon: FiCalendar, label: isEn ? 'Active Days' : '活跃天数', value: data.activeDays, color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {isEn ? 'My Dashboard' : '我的数据看板'}
          </h1>
          {user && (
            <p className="mt-1 text-sm text-gray-500">
              {isEn
                ? `Welcome back, ${user.name || user.email}`
                : `${user.name || user.email}，欢迎回来`}
            </p>
          )}
        </div>

        {/* Stat cards */}
        <StatsGrid cards={statCards} />
      </div>
    </div>
  )
}
