'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiCamera, FiFilm, FiDownload, FiChevronDown, FiChevronUp, FiRefreshCw, FiZap, FiImage } from 'react-icons/fi'

interface Scene {
  id: string
  name: string
  note: string
  shotType: string
}

export default function ScenesPage() {
  const [scripts, setScripts] = useState<any[]>([])
  const [persona, setPersona] = useState<any>(null)
  const [scenes, setScenes] = useState<{ characterScenes: Scene[], businessScenes: Scene[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const s = localStorage.getItem('lanlaoban_scripts')
    if (s) { try { setScripts(JSON.parse(s)) } catch {} }
    const p = localStorage.getItem('lanlaoban_persona')
    if (p) { try { setPersona(JSON.parse(p)) } catch {} }
  }, [])

  const generateScenes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/generate/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: localStorage.getItem('lanlaoban_persona_source')
            ? JSON.parse(localStorage.getItem('lanlaoban_persona_source')!).industry || '实体'
            : '实体',
          product: persona?.nickname || '',
          coach: localStorage.getItem('lanlaoban_coach') || 'libazi',
        }),
      })
      const data = await res.json()
      if (data.characterScenes) setScenes(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { if (scripts.length > 0) generateScenes() }, [scripts.length])

  const handleExport = () => {
    if (!scenes) return
    let text = `懒老板 - 拍摄场景方案\n\n`
    text += `【人物场景（5个）】\n`
    scenes.characterScenes.forEach(s => { text += `\n${s.id.toUpperCase()} ${s.name}\n  拍摄：${s.note}\n  镜头：${s.shotType}\n` })
    text += `\n【业务场景（10个）】\n`
    scenes.businessScenes.forEach(s => { text += `\n${s.id.toUpperCase()} ${s.name}\n  拍摄：${s.note}\n  镜头：${s.shotType}\n` })
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '懒老板-拍摄场景方案.txt'
    a.click()
  }

  if (scripts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavHeader />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <FiCamera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">还没有生成内容</h2>
          <p className="text-gray-500 mb-6">先去生成脚本，再来查看拍摄场景</p>
          <Link href="/generate" className="btn-primary">去生成脚本</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">拍摄场景方案</h1>
            <p className="text-gray-500 text-sm">5个人物场景 + 10个业务场景，按教练风格匹配</p>
          </div>
          <div className="flex gap-2">
            <button onClick={generateScenes} disabled={loading} className="btn-outline text-sm">
              <FiRefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />重新生成
            </button>
            <button onClick={handleExport} className="btn-outline text-sm"><FiDownload className="w-3 h-3 mr-1" />导出</button>
          </div>
        </div>

        {loading && !scenes && (
          <div className="card py-16 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500 text-sm">AI正在生成场景方案...</p>
          </div>
        )}

        {scenes && (
          <div className="space-y-10">
            {/* 人物场景 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <FiImage className="text-brand-400" />
                <h2 className="text-lg font-semibold">人物出镜场景（5个）</h2>
                <span className="text-xs text-gray-400">每次拍摄任选3-4个使用</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {scenes.characterScenes.map(s => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-brand-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{s.id.toUpperCase()}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600">{s.shotType}</span>
                    </div>
                    <p className="font-medium text-sm mb-1">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 业务场景 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <FiFilm className="text-brand-400" />
                <h2 className="text-lg font-semibold">业务拍摄场景（10个）</h2>
                <span className="text-xs text-gray-400">覆盖全流程实景素材</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {scenes.businessScenes.map(s => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-amber-200 transition-colors"
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{s.id.toUpperCase()}</span>
                        <p className="font-medium text-sm">{s.name}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-600">{s.shotType}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{s.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 使用说明 */}
            <div className="bg-brand-50/30 border border-brand-100 rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-2">拍摄建议</h3>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 每次拍摄从5个人物场景中选3-4个，结合脚本内容搭配</li>
                <li>• 业务场景作为穿插素材，每条视频插入2-3个即可</li>
                <li>• 遵循三大镜头标准：近景口播60% + 纪实行走25% + 特写15%</li>
                <li>• 手机横屏拍摄，1080p 30fps，自然光优先</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Link href="/guide" className="btn-primary flex-1 text-center"><FiCamera className="w-4 h-4 mr-1 inline" />拍摄指导</Link>
              <Link href="/coaching" className="btn-outline flex-1 text-center"><FiCamera className="w-4 h-4 mr-1 inline" />出镜纠错</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
