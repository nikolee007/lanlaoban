'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiSearch, FiBarChart2, FiCheckCircle, FiAlertCircle, FiArrowRight, FiTrendingUp, FiUsers, FiEye, FiHeart, FiZap } from 'react-icons/fi'

export default function DiagnosePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleDiagnose = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (res.ok) setResult(data)
      else setError(data.error || '诊断失败')
    } catch { setError('网络错误') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">账号诊断</h1>
          <p className="text-gray-500 text-sm">输入你的抖音/小红书账号链接，AI自动分析并给出优化方案</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <div className="flex gap-3">
            <input value={url} onChange={e => setUrl(e.target.value)}
              className="input flex-1" placeholder="粘贴你的抖音/小红书主页链接..."
              onKeyDown={e => e.key === 'Enter' && handleDiagnose()} />
            <button onClick={handleDiagnose} disabled={loading || !url.trim()}
              className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <FiSearch className="w-4 h-4" />{loading ? '分析中...' : '诊断'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        {result && (
          <div className="space-y-6">
            {/* 数据概览 */}
            {result.demoData && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: FiUsers, label: '粉丝', value: result.demoData.fans },
                  { icon: FiHeart, label: '获赞', value: result.demoData.likes },
                  { icon: FiEye, label: '作品', value: result.demoData.works },
                  { icon: FiTrendingUp, label: '平均播放', value: result.demoData.avgPlay },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <s.icon className="w-4 h-4 text-gray-300 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{s.value.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 诊断项 */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><FiBarChart2 className="text-brand-400" /> 账号健康度</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiAlertCircle className="w-5 h-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">主页装修不完整</p>
                    <p className="text-xs text-gray-500">昵称、简介、背景墙未按IP体系配置</p>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded">待优化</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiAlertCircle className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">无置顶视频</p>
                    <p className="text-xs text-gray-500">新粉进来看不到核心内容，流失率高</p>
                  </div>
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">缺失</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">有持续更新</p>
                    <p className="text-xs text-gray-500">{result.demoData.works}个作品，账号活跃度正常</p>
                  </div>
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">良好</span>
                </div>
              </div>
            </div>

            {/* 优化建议 */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold mb-4">优化建议</h2>
              <div className="space-y-3">
                {result.suggestions.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-brand-400">{i + 1}</span>
                    </span>
                    <p className="text-sm text-gray-700">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 引导到launch */}
            <div className="bg-gradient-to-r from-brand-50 to-orange-50 rounded-xl border border-brand-100 p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">想要完整的优化方案？</h3>
              <p className="text-sm text-gray-500 mb-4">懒老板10分钟采访 → AI自动生成全套IP方案</p>
              <Link href="/interview" className="btn-primary inline-flex items-center gap-2">
                <FiZap className="w-4 h-4" />开始采访<FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
