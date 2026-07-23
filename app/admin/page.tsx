'use client'

import React, { useState, useEffect } from 'react'
import { FiUsers, FiSettings } from 'react-icons/fi'
import NavHeader from '../components/NavHeader'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<string>('users')

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">管理后台</h1>

        {/* Tab nav */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users' ? 'border-brand-400 text-brand-400' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <FiUsers className="w-4 h-4" />用户管理
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings' ? 'border-brand-400 text-brand-400' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <FiSettings className="w-4 h-4" />系统设置
          </button>
        </div>

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  )
}

function UserManagement() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      if (d.success) setUsers(d.data || [])
    }).catch(() => {})
  }, [])

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold">用户列表</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">昵称</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">邮箱</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">注册时间</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 font-mono">{u.id}</td>
                <td className="px-4 py-3 font-medium">{u.name || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">暂无数据</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SettingsPanel() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h3 className="font-semibold">系统设置</h3>
      <p className="text-sm text-gray-500">环境配置信息</p>
      <div className="grid gap-3">
        <div className="flex justify-between text-sm"><span className="text-gray-400">AI 引擎</span><span>自动降级 (Agnes 2.0 → DeepSeek → Zhipu)</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-400">TTS</span><span>MOSS + Edge 双引擎</span></div>
      </div>
    </div>
  )
}
