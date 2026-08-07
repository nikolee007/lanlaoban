'use client'

import React, { useState, useEffect } from 'react'
import { FiUsers, FiSettings, FiKey } from 'react-icons/fi'
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
          <button
            onClick={() => setActiveTab('activation')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'activation' ? 'border-brand-400 text-brand-400' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <FiKey className="w-4 h-4" />激活码管理
          </button>
        </div>

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'settings' && <SettingsPanel />}
        {activeTab === 'activation' && <ActivationManagement />}
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

function ActivationManagement() {
  const [count, setCount] = useState(1)
  const [days, setDays] = useState(365)
  const [devices, setDevices] = useState(1)
  const [codes, setCodes] = useState<any[]>([])
  const [newCodes, setNewCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const load = () => {
    fetch('/api/admin/activation/list').then(r => r.json()).then(d => { if (d.success) setCodes(d.data || []) }).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const generate = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/activation/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, days, devices }),
      })
      const d = await r.json()
      if (d.success) { setNewCodes(d.data.codes); load() } else alert(d.error || '生成失败')
    } catch { alert('生成失败') } finally { setLoading(false) }
  }

  const revoke = async (code: string) => {
    const r = await fetch('/api/admin/activation/revoke', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const d = await r.json()
    if (d.success) load()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold mb-4">生成激活码</h3>
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm">数量
            <input type="number" value={count} onChange={e => setCount(Number(e.target.value))} min={1} max={100} className="block mt-1 w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          </label>
          <label className="text-sm">天数
            <input type="number" value={days} onChange={e => setDays(Number(e.target.value))} min={1} className="block mt-1 w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          </label>
          <label className="text-sm">设备数
            <input type="number" value={devices} onChange={e => setDevices(Number(e.target.value))} min={1} className="block mt-1 w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          </label>
          <button onClick={generate} disabled={loading} className="px-5 py-2 rounded-lg bg-[#FF6034] text-white text-sm font-medium hover:bg-orange-500 disabled:opacity-60">
            {loading ? '生成中...' : '批量生成'}
          </button>
        </div>
        {newCodes.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-xs text-orange-600 font-medium mb-2">新生成的激活码</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {newCodes.map(c => <code key={c} className="block text-xs break-all">{c}</code>)}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold">激活码列表</h3>
          <button onClick={load} className="text-xs text-gray-400 hover:text-gray-600">刷新</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">激活码</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">设备</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">有效期至</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c: any) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 break-all">{c.code}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === 'revoked' ? 'bg-red-50 text-red-500' : c.status === 'activated' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {c.status === 'activated' ? '已激活' : c.status === 'revoked' ? '已吊销' : '未使用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c._count?.activations ?? 0} / {c.maxDevices}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.expiresAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {c.status !== 'revoked' && (
                      <button onClick={() => revoke(c.code)} className="text-xs text-red-500 hover:text-red-700">吊销</button>
                    )}
                  </td>
                </tr>
              ))}
              {codes.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">暂无激活码</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
