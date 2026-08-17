'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiShield, FiZap, FiCopy, FiCheck, FiDownload, FiCreditCard, FiUsers, FiSettings, FiActivity, FiServer } from 'react-icons/fi'

interface MyCode {
  id: number
  code: string
  status: string
  maxDevices: number
  expiresAt: string | Date
  createdAt: string | Date
  _count?: { activations: number }
}

//打字机文字特效（循环输入/删除）
function Typewriter({ texts }: { texts: string[] }) {
  const [display, setDisplay] = useState('')
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const full = texts[index % texts.length]
    const timer = setTimeout(() => {
      if (!deleting) {
        if (display.length < full.length) {
          setDisplay(full.slice(0, display.length + 1))
        } else {
          setDeleting(true)
        }
      } else {
        if (display.length > 0) {
          setDisplay(full.slice(0, display.length - 1))
        } else {
          setDeleting(false)
          setIndex((i) => (i + 1) % texts.length)
        }
      }
    }, deleting ? 35 : 90)
    return () => clearTimeout(timer)
  }, [display, deleting, index, texts])

  return (
    <span className="text-[#2563eb]">
      {display}
      <span className="inline-block w-[2px] h-[1.1em] bg-[#2563eb] align-middle ml-0.5 animate-pulse" />
    </span>
  )
}

export default function OnionPage() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [days, setDays] = useState(365)
  const [devices, setDevices] = useState(1)
  const [buying, setBuying] = useState(false)
  const [qrcode, setQrcode] = useState<string | null>(null)
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
    setQrcode(null)
    setNewCode(null)
    try {
      const r = await fetch('/api/activation/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ days, devices }),
      })
      const d = await r.json()
      if (d.success) {
        setQrcode(d.data.qrcode)
        const base = myCodes.length
        const iv = setInterval(async () => {
          try {
            const list = await fetch('/api/activation/my', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json())
            if (list.success) {
              const codes = list.data || []
              setMyCodes(codes)
              if (codes.length > base) {
                clearInterval(iv)
                setQrcode(null)
                setNewCode(codes[0].code)
              }
            }
          } catch { /*忽略 */ }
        }, 5000)
        setTimeout(() => clearInterval(iv), 600000)
      } else {
        setError(d.error || '下单失败')
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

      {/* Hero ·蓝白科技 */}
      <div className="bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
            <FiShield className="w-3.5 h-3.5" />出海企业网络部署工具
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1e3a8a] tracking-tight mb-3">洋葱<span className="text-[#2563eb]">出海网络部署</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-2 min-h-[1.6em]">
            <Typewriter texts={['为出海企业与跨境团队打造的网络部署工具', '团队线路统一接入，多设备授权管理', '合规线路自备，部署运维全自动']} />
          </p>
          <p className="text-sm text-gray-400 mb-8">企业采购 /个人亦可使用：获取授权 →部署客户端 →接入你的线路
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#buy"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white font-semibold shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
            >获取授权
            </a>
            <a
              href="#download"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-all"
            >
              <FiDownload className="w-4 h-4" />下载客户端
            </a>
          </div>
        </div>
      </div>

      {/*企业版能力 */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-6 text-center text-[#1e3a8a]">企业版能力</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FiUsers, title: '团队批量授权', desc: '一个企业账号，多设备激活码统一管理，按需开通' },
            { icon: FiSettings, title: '设备统一管理', desc: '设备指纹绑定、离线可用、授权心跳回检、随时吊销' },
            { icon: FiActivity, title: '集中运维监控', desc: '网络异常自动重连，授权状态实时可见，省去逐台排查' },
            { icon: FiServer, title: '合规自备线路', desc: '不提供线路、不转售国际流量，线路由企业合规自备' },
          ].map((c) => (
            <div key={c.title} className="p-6 rounded-2xl border border-blue-50 bg-gradient-to-b from-blue-50/30 to-white">
              <c.icon className="w-6 h-6 text-[#2563eb] mb-3" />
              <h3 className="font-semibold mb-1 text-[#1e3a8a]">{c.title}</h3>
              <p className="text-sm text-gray-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/*购买激活码 */}
      <div id="buy" className="max-w-4xl mx-auto px-4 py-10 scroll-mt-20">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-1 text-[#1e3a8a]">获取激活码</h2>
          <p className="text-sm text-gray-500 mb-6">企业按设备数采购授权；个人亦可自助购买。扫码支付后自动发放</p>

          {!token ? (
            <div className="text-center py-8 text-gray-400">请先登录后购买 ——{' '}
              <Link href="/login" className="text-[#2563eb] font-medium hover:underline">去登录</Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">时长</span>
                  <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-blue-100 text-sm">
                    <option value={30}>1个月 · ¥1</option>
                    <option value={365}>1年 · ¥9.9</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">设备数</span>
                  <select value={devices} onChange={(e) => setDevices(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-blue-100 text-sm">
                    <option value={1}>1台</option>
                    <option value={3}>3台</option>
                    <option value={5}>5台</option>
                  </select>
                </div>
                <button
                  onClick={buy}
                  disabled={buying}
                  className="px-6 py-2 rounded-full bg-[#2563eb] text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60"
                >
                  {buying ? '下单中...' : '立即购买'}
                </button>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {qrcode && (
                <div className="text-center p-4 rounded-xl bg-white border border-blue-100">
                  <p className="text-sm mb-2">请使用微信 /支付宝扫码支付</p>
                  <img src={qrcode} alt="支付二维码" className="mx-auto w-44 h-44 object-contain" />
                  <p className="text-xs text-gray-400 mt-2">支付成功后激活码自动发放</p>
                </div>
              )}

              {newCode && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-2">你的激活码（请妥善保存）</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm break-all bg-white px-3 py-2 rounded-lg border border-blue-200">{newCode}</code>
                    <button onClick={copyCode} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-blue-200 text-sm text-blue-600 hover:bg-blue-100 transition-colors">
                      {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                      {copied ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3 text-[#1e3a8a]">我的激活码</h3>
                {myCodes.length === 0 ? (
                  <p className="text-sm text-gray-400">还没有激活码，点上面的按钮购买一个</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-blue-100">
                    <table className="w-full text-sm">
                      <thead className="bg-blue-50/50">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">激活码</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">设备</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">有效期至</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myCodes.map((c) => (
                          <tr key={c.id} className="border-t border-blue-50">
                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.code.slice(0, 30)}...</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === 'revoked' ? 'bg-red-50 text-red-500' : c.status === 'activated' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
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

      {/*下载客户端 */}
      <div id="download" className="max-w-4xl mx-auto px-4 py-10 scroll-mt-20">
        <h2 className="text-xl font-bold mb-2 text-center text-[#1e3a8a]">下载客户端</h2>
        <p className="text-sm text-gray-500 text-center mb-6">支持以下平台 ·企业版当前内测中，安装包由商务对接发放</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { name: 'macOS · Intel', desc: 'Intel芯片' },
            { name: 'macOS · Apple Silicon', desc: 'M1 / M2 / M3' },
            { name: 'Windows 10 / 11', desc: '一键安装器' },
          ].map((d) => (
            <div key={d.name} className="p-6 rounded-2xl border border-blue-100 bg-white text-center">
              <div className="font-semibold mb-1 text-[#1e3a8a]">{d.name}</div>
              <div className="text-sm text-gray-500 mb-3">{d.desc}</div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-blue-500 text-sm font-medium">
                <FiDownload className="w-3.5 h-3.5" />内测版
              </span>
            </div>
          ))}
        </div>
      </div>

      {/*三步使用 */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-6 text-center text-[#1e3a8a]">三步部署到团队</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: FiCreditCard, title: '1.获取授权', desc: '企业采购激活码，按设备数开通，账号统一管理' },
            { icon: FiDownload, title: '2.部署客户端', desc: '把安装包发到团队设备，一键安装，无需服务器知识' },
            { icon: FiZap, title: '3.接入线路', desc: 'onion node填入企业线路 → onion up自动部署分流' },
          ].map((s) => (
            <div key={s.title} className="p-6 rounded-2xl border border-blue-50 bg-gradient-to-b from-blue-50/30 to-white">
              <s.icon className="w-6 h-6 text-[#2563eb] mb-3" />
              <h3 className="font-semibold mb-1 text-[#1e3a8a]">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/*适用说明 */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-6 text-center text-[#1e3a8a]">适用说明</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-2xl border border-green-100 bg-green-50/50">
            <h3 className="font-semibold mb-3 text-green-700">适合什么人</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>·出海企业 /外贸团队：海外官网、SaaS、多语言站点的稳定访问</li>
              <li>·跨境电商：独立站、TikTok运营、Amazon卖家、海外社媒投放</li>
              <li>·有海外服务器 /云节点 /专线的企业，需要一键部署分流</li>
              <li>·需要把海外线路和国内直连自动化管理起来的团队</li>
              <li>·个人用户：有自备线路、需要一键部署分流的个人亦可使用</li>
            </ul>
          </div>
          <div className="p-5 rounded-2xl border border-amber-100 bg-amber-50/50">
            <h3 className="font-semibold mb-3 text-amber-700">需要你准备的</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>·你自己的海外线路：VPS /云节点 /运营商专线代理</li>
              <li>·支持 vless / vmess / trojan / ss / socks5 / http标准链接</li>
              <li>·请确保线路的获取与使用符合当地法律法规</li>
            </ul>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/30 mb-6">
          <h3 className="font-semibold mb-2 text-[#1e3a8a]">支持与限制</h3>
          <ul className="text-sm text-gray-600 space-y-1.5">
            <li>支持系统：Windows 10 / 11、macOS（Intel与 Apple Silicon）</li>
            <li>一键接入你自己的海外线路：国内直连 +海外分流自动配置</li>
            <li>授权激活：离线可用、心跳续期、设备绑定、随时吊销</li>
            <li>本产品不提供线路、不转售国际流量，线路完全由你自备</li>
          </ul>
        </div>
        <div className="text-center text-xs text-gray-400">洋葱出海通定位为「出海企业网络部署工具」，请确保线路的获取与使用符合当地法律法规。
        </div>
      </div>
    </div>
  )
}
