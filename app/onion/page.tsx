'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiShield, FiCpu, FiZap, FiCopy, FiCheck, FiLogIn } from 'react-icons/fi'

interface MyCode {
  id: number
  code: string
  status: string
  maxDevices: number
  expiresAt: string | Date
  createdAt: string | Date
  _count?: { activations: number }
}

export default function OnionPage() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [days, setDays] = useState(365)
  const [devices, setDevices] = useState(1)
  const [buying, setBuying] = useState(false)
  const [newCode, setNewCode] = useState<string | null>(null)
  const [myCodes, setMyCodes] = useState<MyCode[]>([])
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('lanlaoban_token')
    if (t) {
      setToken(t)
      fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${t}` } })
        .then((r) => r.json())
        .then((d) => { if (d.success) setUser(d.data) })
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!token) return
    fetch('/api/activation/my', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setMyCodes(d.data || []) })
      .catch(() => {})
  }, [token])

  const buy = async () => {
    if (!token) return
    setBuying(true)
    setError('')
    setNewCode(null)
    try {
      const r = await fetch('/api/activation/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ days, devices }),
      })
      const d = await r.json()
      if (d.success) {
        setNewCode(d.data.code)
        const list = await fetch('/api/activation/my', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json())
        if (list.success) setMyCodes(list.data || [])
      } else {
        setError(d.error || '购买失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setBuying(false)
    }
  }

  const copyCode = () => {
    if (!newCode) return
    navigator.clipboard?.writeText(newCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }

  const fmtDate = (v: string | Date) => new Date(v).toLocaleDateString('zh-CN')

  return (
    <div className="min-h-screen bg-white">
      <NavHeader />
      {/* Hero */}
      <div className="bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
            <FiShield className="w-3.5 h-3.5" /> 网络环境自动化部署工具
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0A0A0B] tracking-tight mb-4">
            洋葱<span className="text-[#FF6034]">一键出海</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            稳定访问 Google、YouTube、海外官网与 SaaS。下载工具、输入激活码、一键接入——
            国内网站直连、海外走线，全自动分流。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {token ? (
              <button
                onClick={buy}
                disabled={buying}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-[#FF6034] to-[#FF8A66] text-white font-semibold shadow-lg shadow-orange-200 hover:shadow-xl transition-all disabled:opacity-60"
              >
                {buying ? '生成中...' : '立即获取激活码'}
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-[#FF6034] to-[#FF8A66] text-white font-semibold shadow-lg shadow-orange-200 hover:shadow-xl transition-all"
              >
                <FiLogIn className="w-4 h-4" /> 登录后获取
              </Link>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-400">账号与懒老板通用，登录即可获取</p>
        </div>
      </div>

      {/* 三步使用 */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-6 text-center">三步开始使用</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: FiCpu, title: '1. 下载工具', desc: '在电脑上运行洋葱出海通客户端（命令行，Mac/Windows 均支持）' },
            { icon: FiZap, title: '2. 输入激活码', desc: 'onion activate &lt;激活码&gt;，绑定你的设备' },
            { icon: FiShield, title: '3. 一键接入', desc: 'onion up，国内直连、海外走线，自动分流' },
          ].map((s) => (
            <div key={s.title} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
              <s.icon className="w-6 h-6 text-[#FF6034] mb-3" />
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 购买区 */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-1">获取激活码</h2>
          <p className="text-sm text-gray-500 mb-6">选择时长与设备数，生成后复制到客户端即可激活</p>

          {!token ? (
            <div className="text-center py-8 text-gray-400">
              请先登录后获取激活码 —— <Link href="/login" className="text-[#FF6034] font-medium hover:underline">去登录</Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">时长</span>
                  <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
                    <option value={30}>1 个月</option>
                    <option value={365}>1 年</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">设备数</span>
                  <select value={devices} onChange={(e) => setDevices(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
                    <option value={1}>1 台</option>
                    <option value={3}>3 台</option>
                    <option value={5}>5 台</option>
                  </select>
                </div>
                <button
                  onClick={buy}
                  disabled={buying}
                  className="px-6 py-2 rounded-full bg-[#FF6034] text-white text-sm font-semibold hover:bg-orange-500 transition-colors disabled:opacity-60"
                >
                  {buying ? '生成中...' : '生成激活码'}
                </button>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {newCode && (
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                  <p className="text-xs text-orange-600 font-medium mb-2">你的激活码（请妥善保存）</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm break-all bg-white px-3 py-2 rounded-lg border border-orange-200">{newCode}</code>
                    <button onClick={copyCode} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-orange-200 text-sm text-orange-600 hover:bg-orange-100 transition-colors">
                      {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                      {copied ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">我的激活码</h3>
                {myCodes.length === 0 ? (
                  <p className="text-sm text-gray-400">还没有激活码，点上面的按钮生成一个</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">激活码</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">设备</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">有效期至</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myCodes.map((c) => (
                          <tr key={c.id} className="border-t border-gray-100">
                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.code.slice(0, 30)}...</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === 'revoked' ? 'bg-red-50 text-red-500' : c.status === 'activated' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                {c.status === 'activated' ? '已激活' : c.status === 'revoked' ? '已吊销' : '未使用'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{c._count?.activations ?? 0} / {c.maxDevices}</td>
                            <td className="px-4 py-3 text-gray-500">{fmtDate(c.expiresAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部 */}
      <div className="max-w-4xl mx-auto px-4 pb-16 text-center text-xs text-gray-400">
        洋葱一键出海 · OnionGo —— 出海企业的网络环境自动化部署工具
      </div>
    </div>
  )
}
