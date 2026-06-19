'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { FiBell, FiMessageSquare, FiPackage } from 'react-icons/fi'

interface NotificationItem {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: string
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 获取未读数量
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) return
      const res = await fetch('/api/notifications/count', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && typeof data.data?.count === 'number') {
        setUnreadCount(data.data.count)
      }
    } catch {
      // ignore
    }
  }, [])

  // 获取最近5条通知
  const fetchRecent = useCallback(async () => {
    try {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) return
      const res = await fetch('/api/notifications?pageSize=5', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data?.items)) {
        setRecentNotifications(data.data.items)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    // 每30秒轮询未读数
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // 点开下拉时加载最近通知
  const handleToggleDropdown = () => {
    const next = !dropdownOpen
    setDropdownOpen(next)
    if (next) {
      fetchRecent()
    }
  }

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 标记单条已读
  const markAsRead = async (id: number) => {
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
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // ignore
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    return `${days}天前`
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inquiry_reply':
        return <FiMessageSquare className="w-4 h-4 text-brand-400" />
      case 'order_status':
        return <FiPackage className="w-4 h-4 text-blue-500" />
      default:
        return <FiBell className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        aria-label="通知"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">通知</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-400">{unreadCount}条未读</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                暂无通知
              </div>
            ) : (
              recentNotifications.map((n) => (
                <div key={n.id} className="border-b border-gray-50 last:border-b-0">
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => {
                        if (!n.isRead) markAsRead(n.id)
                        setDropdownOpen(false)
                      }}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                        !n.isRead ? 'bg-brand-50/30' : ''
                      }`}
                    >
                      <span className="mt-0.5 leading-none shrink-0">{getTypeIcon(n.type)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    </Link>
                  ) : (
                    <div
                      onClick={() => {
                        if (!n.isRead) markAsRead(n.id)
                      }}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-gray-50 ${
                        !n.isRead ? 'bg-brand-50/30' : ''
                      }`}
                    >
                      <span className="mt-0.5 leading-none shrink-0">{getTypeIcon(n.type)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setDropdownOpen(false)}
            className="block text-center text-sm font-medium text-brand-400 py-3 border-t border-gray-100 hover:bg-brand-50/30 rounded-b-xl transition-colors"
          >
            查看全部通知
          </Link>
        </div>
      )}
    </div>
  )
}
