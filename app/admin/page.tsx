'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiBarChart2, FiGrid, FiPackage, FiFileText, FiUsers, FiSettings,
} from 'react-icons/fi'

type StatsData = {
  suppliers: number
  products: number
  inquiries: number
  users: number
  todayInquiries: number
  pendingContacts: number
}

type DataStatus = {
  supplierCount: number
  productCount: number
  lastUpdated: string
}

type PageKey = 'overview' | 'suppliers' | 'products' | 'inquiries' | 'users' | 'settings'

const navItems: { key: PageKey; icon: React.ReactNode; label: string; href?: string }[] = [
  { key: 'overview', icon: <FiBarChart2 className="w-5 h-5" />, label: '数据概览' },
  { key: 'suppliers', icon: <FiGrid className="w-5 h-5" />, label: '供应商管理' },
  { key: 'products', icon: <FiPackage className="w-5 h-5" />, label: '商品管理' },
  { key: 'inquiries', icon: <FiFileText className="w-5 h-5" />, label: '询盘管理', href: '/admin/inquiries' },
  { key: 'users', icon: <FiUsers className="w-5 h-5" />, label: '用户管理' },
  { key: 'settings', icon: <FiSettings className="w-5 h-5" />, label: '系统设置' },
]

function OverviewCards({ stats, dataStatus }: { stats: StatsData | null; dataStatus: DataStatus | null }) {
  const cards = [
    { label: '供应商数', value: stats?.suppliers ?? dataStatus?.supplierCount ?? '-', color: 'bg-blue-500', icon: <FiGrid className="w-5 h-5" /> },
    { label: '商品数', value: stats?.products ?? dataStatus?.productCount ?? '-', color: 'bg-green-500', icon: <FiPackage className="w-5 h-5" /> },
    { label: '询盘数', value: stats?.inquiries ?? '-', color: 'bg-purple-500', icon: <FiFileText className="w-5 h-5" /> },
    { label: '用户数', value: stats?.users ?? '-', color: 'bg-orange-500', icon: <FiUsers className="w-5 h-5" /> },
  ]

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`w-8 h-8 rounded-lg ${card.color} bg-opacity-10`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">今日询盘</div>
            <div className="text-2xl font-bold text-brand-400">{stats.todayInquiries}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">待处理联系</div>
            <div className="text-2xl font-bold text-orange-500">{stats.pendingContacts}</div>
          </div>
        </div>
      )}

      {dataStatus && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">数据更新状态</h3>
          <div className="text-sm text-gray-700">
            最后更新: {new Date(dataStatus.lastUpdated).toLocaleString('zh-CN')}
          </div>
        </div>
      )}
    </>
  )
}

function PlaceholderPage({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="mb-4 text-gray-300">{icon}</div>
      <h2 className="text-lg font-medium text-gray-500 mb-2">{title}</h2>
      <p className="text-sm">功能开发中，敬请期待</p>
    </div>
  )
}

export default function AdminPage() {
  const pathname = usePathname()
  const [activeKey, setActiveKey] = useState<PageKey>('overview')
  const [stats, setStats] = useState<StatsData | null>(null)
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, statusRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/global-supply/data-status'),
        ])
        const statsJson = await statsRes.json()
        const statusJson = await statusRes.json()
        if (statsJson.success) setStats(statsJson.data)
        if (statusJson.success) setDataStatus(statusJson.data)
      } catch (err) {
        console.error('获取管理后台数据失败:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-400 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                懒
              </div>
              <span className="text-base font-bold text-gray-900">懒老板</span>
            </Link>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-600">管理后台</span>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            返回前台
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-[240px] shrink-0 min-h-[calc(100vh-57px)] bg-gray-50 border-r border-gray-200">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.href
                ? pathname.startsWith(item.href)
                : activeKey === item.key

              const content = (
                <button
                  onClick={() => setActiveKey(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-400 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )

              if (item.href) {
                return (
                  <Link key={item.key} href={item.href}>
                    {content}
                  </Link>
                )
              }
              return <div key={item.key}>{content}</div>
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {loading ? (
            <div className="text-center py-20 text-gray-400">加载中...</div>
          ) : activeKey === 'overview' ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-6">数据概览</h1>
              <OverviewCards stats={stats} dataStatus={dataStatus} />
            </>
          ) : activeKey === 'suppliers' ? (
            <PlaceholderPage title="供应商管理" icon={<FiGrid className="w-12 h-12" />} />
          ) : activeKey === 'products' ? (
            <PlaceholderPage title="商品管理" icon={<FiPackage className="w-12 h-12" />} />
          ) : activeKey === 'inquiries' ? (
            <PlaceholderPage title="询盘管理" icon={<FiFileText className="w-12 h-12" />} />
          ) : activeKey === 'users' ? (
            <PlaceholderPage title="用户管理" icon={<FiUsers className="w-12 h-12" />} />
          ) : activeKey === 'settings' ? (
            <PlaceholderPage title="系统设置" icon={<FiSettings className="w-12 h-12" />} />
          ) : null}
        </main>
      </div>
    </div>
  )
}
