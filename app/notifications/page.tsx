'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'
import { FiArrowLeft, FiCheck, FiBell, FiMessageSquare, FiPackage, FiInbox } from 'react-icons/fi'

interface NotificationItem {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: string
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'inquiry_reply':
      return <FiMessageSquare className="w-5 h-5 text-brand-400" />
    case 'order_status':
      return <FiPackage className="w-5 h-5 text-blue-500" />
    default:
      return <FiBell className="w-5 h-5 text-gray-400" />
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const pageSize = 20

  const fetchNotifications = useCallback(async (p: number) => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) {
        setError('请先登录')
        setLoading(false)
        return
      }
      const res = await fetch(`/api/notifications?page=${p}&pageSize=${pageSize}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.items || [])
        setTotal(data.data.total || 0)
        setUnreadCount(data.data.unreadCount || 0)
      } else {
        setError(data.error || '加载失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications(page)
  }, [page, fetchNotifications])

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) return
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ all: true }),
      })
      const data = await res.json()
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch {
      // ignore
    }
  }

  const markOneAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) return
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // ignore
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">通知中心</h1>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {unreadCount}条未读
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-500 transition-colors"
            >
              <FiCheck className="w-4 h-4" />
              全部标记为已读
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-4 w-1/3 bg-gray-100 rounded mb-2" />
                    <div className="h-3 w-2/3 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && notifications.length === 0 && (
          <div className="text-center py-20">
            <FiInbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">暂无通知</p>
            <Link
              href="/global-supply"
              className="inline-block mt-4 text-sm font-medium text-brand-400 hover:text-brand-500"
            >
              去逛逛
            </Link>
          </div>
        )}

        {/* Notification list */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border ${
                  n.isRead ? 'border-gray-100 bg-white' : 'border-brand-100 bg-brand-50/20'
                } p-5 transition-colors`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm ${
                          n.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'
                        }`}
                      >
                        {n.title}
                      </h3>
                      <span className="shrink-0 text-xs text-gray-400">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                    <div className="flex items-center gap-3 mt-3">
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => {
                            if (!n.isRead) markOneAsRead(n.id)
                          }}
                          className="text-xs font-medium text-brand-400 hover:text-brand-500"
                        >
                          查看详情
                        </Link>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={() => markOneAsRead(n.id)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          标记已读
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
