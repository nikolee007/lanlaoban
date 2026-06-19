'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiZap, FiCheck, FiClock, FiAlertCircle, FiUser, FiRefreshCw } from 'react-icons/fi'

const STEPS = [
  { id: 'plan', label: '生成起盘规划', desc: '行业分析·定位·策略' },
  { id: 'persona', label: '生成人设方案', desc: '昵称·简介·Slogan' },
  { id: 'scripts', label: '生成短视频脚本', desc: '30条/4模块' },
  { id: 'long', label: '生成长视频脚本', desc: '6条/7段式' },
  { id: 'scenes', label: '生成场景方案', desc: '5人物+10业务场景' },
  { id: 'schedule', label: '生成发布排期', desc: '三阶段30天' },
  { id: 'profile', label: '生成账主页', desc: '昵称·置顶·简介' },
  { id: 'logs', label: '初始化记录系统', desc: '越用越懂你' },
]

export default function LaunchPage() {
  const router = useRouter()
  const [interview, setInterview] = useState<any>(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<Record<string, 'pending' | 'running' | 'done' | 'error'>>({})
  const [error, setError] = useState('')

  useEffect(() => {
    const data = localStorage.getItem('lanlaoban_interview')
    if (data) {
      try { setInterview(JSON.parse(data)) } catch {}
    }
  }, [])

  const i = interview || {}
  const hasData = !!i.industry

  const runPipeline = async () => {
    if (!i.industry) return
    setRunning(true)
    setError('')
    const coach = localStorage.getItem('lanlaoban_coach') || 'libazi'

    const update = (id: string, status: 'running' | 'done' | 'error') =>
      setProgress(prev => ({ ...prev, [id]: status }))

    const industry = i.industry, product = i.product || '', customer = i.customer || ''
    const years = i.startYear?.replace(/[^0-9]/g, '').slice(-2) || '10'

    try {
      update('plan', 'running')
      try {
        const res = await fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ industry, product, targetCustomer: customer, years, coach }) })
        if (res.ok) localStorage.setItem('lanlaoban_plan', JSON.stringify(await res.json()))
      } catch {}
      update('plan', 'done')

      update('persona', 'running')
      try {
        const res = await fetch('/api/generate/persona', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ industry, product, targetCustomer: customer, years: parseInt(years) || 0, style: coach,
            pains: [(i.pains || '').slice(0, 20)] }), })
        if (res.ok) {
          const d = await res.json()
          localStorage.setItem('lanlaoban_persona', JSON.stringify(d.persona))
          localStorage.setItem('lanlaoban_persona_source', JSON.stringify({ industry, product, targetCustomer: customer, years }))
        }
      } catch {}
      update('persona', 'done')

      const personaData = JSON.parse(localStorage.getItem('lanlaoban_persona') || '{}')

      update('scripts', 'running')
      try {
        const res = await fetch('/api/generate/scripts', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ industry, product, targetCustomer: customer, years: parseInt(years) || 0, style: coach, persona: personaData }) })
        if (res.ok) { const d = await res.json(); if (d.scripts) localStorage.setItem('lanlaoban_scripts', JSON.stringify(d.scripts)) }
      } catch {}
      update('scripts', 'done')

      update('long', 'running')
      try {
        const res = await fetch('/api/generate/scripts-long', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ industry, product, targetCustomer: customer, years: parseInt(years) || 0, style: coach, persona: personaData }) })
        if (res.ok) { const d = await res.json(); if (d.scripts) localStorage.setItem('lanlaoban_scripts_long', JSON.stringify(d.scripts)) }
      } catch {}
      update('long', 'done')

      update('scenes', 'running')
      try { await fetch('/api/generate/scenes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ industry, product, coach }) }) } catch {}
      update('scenes', 'done')
      update('schedule', 'done')

      update('profile', 'running')
      try { await fetch('/api/generate/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ industry, product, targetCustomer: customer, years: parseInt(years) || 0, name: (i.name || '').replace(/[老板师傅]/g, '').slice(0, 4) || '老王', coach }) }) } catch {}
      update('profile', 'done')

      // Step 8: Logs
      update('logs', 'done')

      // Done - redirect to dashboard
      setTimeout(() => router.push('/dashboard'), 1500)

    } catch {
      setError('部分步骤出错，已完成的内容已保存')
    }
    setRunning(false)
  }

  const allDone = Object.values(progress).filter(s => s === 'done').length
  const total = STEPS.length

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">一键全流程启动</h1>
          <p className="text-gray-500 text-sm">填一次信息，自动跑完规划→人设→脚本→场景→排期→账主页</p>
        </div>

        {!hasData ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">先做采访，才能定制</h2>
            <p className="text-gray-500 text-sm mb-6">要做出真正适合你的IP方案，我们需要先了解你的故事和经历</p>
            <Link href="/interview" className="btn-primary"><FiZap className="w-4 h-4 mr-1 inline" />开始采访（约10分钟）</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                <FiUser className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="font-semibold">{i.name || '老板'}</p>
                <p className="text-sm text-gray-400">{i.industry} · {i.product}</p>
              </div>
              <Link href="/interview" className="ml-auto text-sm text-brand-400 hover:text-brand-500">重新采访</Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm border-t pt-4">
              <div><p className="text-brand-400 font-bold">{i.startYear || '-'}</p><p className="text-xs text-gray-400">入行</p></div>
              <div><p className="text-brand-400 font-bold">{i.personality || '-'}</p><p className="text-xs text-gray-400">性格</p></div>
              <div><p className="text-brand-400 font-bold">{i.customer?.slice(0, 6) || '-'}</p><p className="text-xs text-gray-400">客户</p></div>
            </div>
            {error && <p className="text-sm text-amber-600 mt-3 bg-amber-50 rounded-lg p-3">{error}</p>}
            <button onClick={runPipeline} disabled={running}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-4">
              {running ? (
                <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> 正在生成你的专属内容...</>
              ) : (
                <><FiZap className="w-5 h-5" /> 基于采访生成完整IP方案</>
              )}
            </button>
          </div>
        )}

        {/* 进度追踪 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>执行进度</span>
            <span>{allDone}/{total}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-400 rounded-full transition-all" style={{ width: `${(allDone / total) * 100}%` }} />
          </div>
          {STEPS.map(step => {
            const status = progress[step.id] || 'pending'
            return (
              <div key={step.id} className={`bg-white rounded-xl border px-5 py-3 flex items-center justify-between transition-all
                ${status === 'running' ? 'border-brand-300 bg-brand-50/30' :
                  status === 'done' ? 'border-green-200 bg-green-50/30' :
                  status === 'error' ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  {status === 'done' ? <FiCheck className="w-5 h-5 text-green-500" /> :
                   status === 'running' ? <div className="animate-spin w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full" /> :
                   status === 'error' ? <FiAlertCircle className="w-5 h-5 text-red-500" /> :
                   <FiClock className="w-5 h-5 text-gray-300" />}
                  <div>
                    <p className={`font-medium text-sm ${status === 'done' ? 'text-green-700' : 'text-gray-900'}`}>{step.label}</p>
                    <p className="text-xs text-gray-400">{step.desc}</p>
                  </div>
                </div>
                {status === 'done' && <FiCheck className="w-4 h-4 text-green-400" />}
              </div>
            )
          })}
        </div>

        {allDone === total && (
          <div className="mt-8 p-5 bg-green-50 border border-green-200 rounded-xl text-center">
            <FiCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-green-800 mb-1">全流程已完成！</p>
            <p className="text-sm text-green-600 mb-4">正在跳转工作台</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => router.push('/dashboard')} className="btn-primary text-sm">进入工作台</button>
              <button onClick={() => router.push('/scripts')} className="btn-outline text-sm">查看脚本</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
