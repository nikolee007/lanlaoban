'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiChevronDown, FiChevronUp, FiCamera, FiCalendar, FiDownload, FiRefreshCw, FiFileText } from 'react-icons/fi'

interface ScriptItem {
  id: string
  module: string
  title: string
  content: string
}

const modules = [
  { id: 'A', name: '人设信任篇', desc: '讲老板个人故事，建立信任' },
  { id: 'B', name: '行业干货篇', desc: '分享专业知识，建立权威' },
  { id: 'C', name: '实力展示篇', desc: '展示产品/服务优势' },
  { id: 'D', name: '情绪共鸣+引流篇', desc: '促成交、引私信' },
]

const COACH_NAMES: Record<string, string> = { libazi: '纪实派', boge: '烟火派', zhuge: '认知派', geng: '工业派' }

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<ScriptItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [coach, setCoach] = useState('libazi')
  const [filterModule, setFilterModule] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('lanlaoban_scripts')
    if (stored) { try { setScripts(JSON.parse(stored)) } catch {} }
    const c = localStorage.getItem('lanlaoban_coach')
    if (c) setCoach(c)
  }, [])

  const filtered = filterModule ? scripts.filter(s => s.module === filterModule) : scripts

  const handleCopyAll = () => {
    const text = scripts.map(s => `${s.id.toUpperCase()} ${s.title}\n${s.content}`).join('\n\n---\n\n')
    navigator.clipboard.writeText(text)
    alert('已复制全部脚本到剪贴板')
  }

  const handleExport = () => {
    let text = `懒老板 - ${scripts.length}条专属脚本\n风格：${COACH_NAMES[coach] || '纪实派'}\n生成时间：${new Date().toLocaleString()}\n\n`
    const modules = ['A', 'B', 'C', 'D', 'E']
    const moduleNames: Record<string, string> = { A: '人设信任篇', B: '行业真话篇', C: '客户避坑篇', D: '实力展示篇', E: '情绪成交篇' }
    const coaches: Record<string, string> = { libazi: '纪实派·22-26s', boge: '烟火派·25-30s', zhuge: '认知派·28-35s', geng: '工业派·20-25s' }
    text += `教练风格：${coaches[coach] || '纪实派·22-26s'}\n`
    if ((scripts[0] as any)?.segments) text += `视频类型：长视频（60-120秒成交款）\n`
    else text += `视频类型：短视频（20-30秒引流款）\n`
    modules.forEach(m => {
      const items = scripts.filter(s => s.module === m)
      if (items.length) {
        text += `\n========== 模块${m}：${moduleNames[m] || ''} ==========\n`
        items.forEach(s => {
          const ss = s as any
          text += `\n【${s.id.toUpperCase()}】${s.title}`
          if (ss.duration) text += `（${ss.duration}）`
          if (ss.shotType) text += ` | 镜头：${ss.shotType}`
          text += `\n${s.content}\n`
        })
      }
    })
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '懒老板-脚本.txt'
    a.click()
  }

  if (scripts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">懒</div>
              <span className="text-xl font-bold">懒老板</span>
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <FiRefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">还没有生成脚本</h2>
          <p className="text-gray-500 mb-6">先去AI生成页面创建你的专属内容</p>
          <Link href="/generate" className="btn-primary">去生成脚本</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">脚本库</h1>
              <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded font-medium">{COACH_NAMES[coach] || '纪实派'}</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{scripts.length}条脚本 · 点击展开查看完整文案</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="btn-outline text-sm"><FiDownload className="w-3 h-3 mr-1" />导出</button>
            <button onClick={handleCopyAll} className="btn-outline text-sm"><FiFileText className="w-3 h-3 mr-1" />复制</button>
            <Link href="/generate" className="btn-primary text-sm"><FiRefreshCw className="w-3 h-3 mr-1" />重新生成</Link>
          </div>
        </div>

        {/* 模块统计 */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {modules.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-brand-400">{scripts.filter(s => s.module === m.id).length}</p>
              <p className="text-xs text-gray-500 mt-1">{m.name}</p>
            </div>
          ))}
        </div>

        {/* 模块筛选 */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setFilterModule(null)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${!filterModule ? 'bg-brand-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>全部</button>
          {modules.map(m => (
            <button key={m.id} onClick={() => setFilterModule(filterModule === m.id ? null : m.id)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${filterModule === m.id ? 'bg-brand-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              模块{m.id}
            </button>
          ))}
        </div>

        {/* 按模块展示 */}
        {modules.map(mod => {
          const items = filtered.filter(s => s.module === mod.id)
          if (!items.length) return null
          return (
            <div key={mod.id} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-brand-400 text-white flex items-center justify-center font-bold text-sm">{mod.id}</div>
                <div>
                  <h3 className="font-semibold">{mod.name}</h3>
                  <p className="text-sm text-gray-400">{mod.desc} · {items.length}条</p>
                </div>
              </div>
              <div className="space-y-2">
                {items.map(s => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:border-gray-200 transition-colors"
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{s.id.toUpperCase()}</span>
                        <span className="font-medium text-sm">{s.title}</span>
                        {(s as any).violations?.length > 0 && (
                          <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-medium">违禁{(s as any).violations.length}</span>
                        )}
                      </div>
                      {expandedId === s.id ? <FiChevronUp className="text-gray-400 shrink-0" /> : <FiChevronDown className="text-gray-400 shrink-0" />}
                    </div>
                    {expandedId === s.id && (
                      <div className="mt-4 pt-4 border-t">
                        {/* 元数据标签 */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(s as any).shotType && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">镜头：{(s as any).shotType}</span>}
                          {(s as any).duration && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded">时长：{(s as any).duration}</span>}
                          {(s as any).timingNote && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded">{(s as any).timingNote}</span>}
                        {(s as any).violations?.length > 0 && (s as any).violations.map((v: any, i: number) => (
                          <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">⚠ {v.word}</span>
                        ))}
                        </div>
                        {/* 分段展示（长视频） */}
                        {(s as any).segments && (s as any).segments.length > 0 ? (
                          <div className="space-y-2 mb-3">
                            {(s as any).segments.map((seg: any, i: number) => (
                              <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">{seg.time}</span>
                                  {seg.shotType && <span className="text-xs text-gray-500">{seg.shotType}</span>}
                                </div>
                                <p className="text-sm text-gray-700">{seg.content || s.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{s.content}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* 下一步 */}
        <div className="flex gap-4 mt-8 pt-8 border-t">
          <Link href="/scenes" className="btn-primary flex-1 flex items-center justify-center gap-2"><FiCamera className="w-4 h-4" />查看场景方案</Link>
          <Link href="/guide" className="btn-outline flex-1 flex items-center justify-center gap-2"><FiCalendar className="w-4 h-4" />拍摄指导</Link>
          <Link href="/schedule" className="btn-outline flex-1 flex items-center justify-center gap-2"><FiCalendar className="w-4 h-4" />排期表</Link>
        </div>
      </main>
    </div>
  )
}
