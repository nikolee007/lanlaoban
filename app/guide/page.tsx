'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiCamera, FiHelpCircle, FiChevronDown, FiChevronUp, FiZap, FiRefreshCw, FiDownload } from 'react-icons/fi'

interface ScriptItem {
  id: string
  module: string
  title: string
  content: string
}

interface GuideResult {
  question1: string
  question2: string
  question3: string
  tips: string[]
}

interface GuideData {
  questions: string[]
  tips: string[]
  shots: string[]
  editRules: string[]
}

const defaultGuides: Record<string, { questions: string[], tips: string[], shots: string[], editRules: string[] }> = {
  A: {
    questions: ['你当初为什么选择进入这个行业？', '这些年做下来，你最骄傲的是什么？', '如果一句话介绍自己，你会怎么说？'],
    tips: ['穿工装或正装，不化妆', '语气像跟朋友聊天，不要背词', '看镜头，眼神坚定，不漂移'],
    shots: ['正面近景口播（胸口以上，固定机位）', '原地站立，身后实景入画'],
    editRules: ['开头直接入人声，无前奏', '中段剪掉卡顿和口头禅', '结尾字幕：靠谱XX｜私信咨询'],
  },
  B: {
    questions: ['这个行业最大的坑是什么？', '客户最容易在什么地方被忽悠？', '你为什么不跟别人一样做？'],
    tips: ['讲真话，不要背书', '语气坚定，不要犹豫', '可以配合手势显得自然'],
    shots: ['近景口播（固定机位）', '穿插1-2秒产品/场景特写（检测报告、材料细节）'],
    editRules: ['钩子字幕放大1.5倍', '特写硬切，无转场特效', 'BGM轻柔，不压人声'],
  },
  C: {
    questions: ['带我们看看你的核心场景', '这个地方有什么特别之处？', '每天的工作状态是什么样的？'],
    tips: ['边走边拍，有代入感', '指给镜头看，介绍细节', '用数字说话，更可信'],
    shots: ['行走纪实（手持微晃，车间/仓库/门店）', '产品细节特写（材质、工艺、库存）', '近景收尾'],
    editRules: ['行走镜头保留真实晃动感', '特写每段不超过1.5秒', '全片无滤镜，保留原生色彩'],
  },
  D: {
    questions: ['你最想对客户说什么？', '合作过的人怎么评价你？', '为什么选择你而不是别人？'],
    tips: ['真诚最重要，不要演', '语速放慢，别赶着说完', '结尾看着镜头，强调重点'],
    shots: ['全景展示（工厂/仓库/门店全景）', '手持边走边讲', '产品堆货/设备特写'],
    editRules: ['全景镜头不少于3秒', '型号和数据字幕标注', '结尾小字固定引流格式'],
  },
  E: {
    questions: ['你最想对客户说什么？', '这么多年坚持下来靠的是什么？', '为什么客户会一直选择你？'],
    tips: ['情绪要真实，不要说大道理', '语速平缓，不要赶', '结尾微微前倾，引导私信'],
    shots: ['近景口播', '穿插成交发货纪实素材', '结尾定格引导'],
    editRules: ['全片不加速人声', '三句\"不想\"分句分行字幕', '结尾统一：想要实在报价→私信'],
  },
}

export default function GuidePage() {
  const [scripts, setScripts] = useState<ScriptItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [aiGuides, setAiGuides] = useState<Record<string, GuideResult>>({})
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('lanlaoban_scripts')
    if (stored) { try { setScripts(JSON.parse(stored)) } catch {} }
  }, [])

  const generateGuide = async (script: ScriptItem) => {
    setGeneratingId(script.id)
    try {
      const res = await fetch('/api/generate/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: script.id, scriptContent: script.content, industry: '未指定' }),
      })
      const data = await res.json()
      if (data.guide) {
        setAiGuides(prev => ({ ...prev, [script.id]: data.guide }))
      }
    } catch {}
    setGeneratingId(null)
  }

  const getGuide = (script: ScriptItem): GuideData => {
    if (aiGuides[script.id]) {
      const g = aiGuides[script.id]!
      return { questions: [g.question1, g.question2, g.question3].filter(Boolean), tips: g.tips || [], shots: [], editRules: [] }
    }
    const def = defaultGuides[script.module] || defaultGuides.A
    return { questions: def.questions, tips: def.tips, shots: def.shots || [], editRules: def.editRules || [] }
  }

  const handleExport = () => {
    const lines = scripts.map(s => {
      const g = getGuide(s)
      return `【${s.id.toUpperCase()}】${s.title}\n脚本：${s.content}\n引导问题：\n${g.questions.map((q, i) => `  ${i+1}. ${q}`).join('\n')}\n`
    }).join('\n---\n\n')
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '懒老板-拍摄指导.txt'
    a.click()
  }

  if (scripts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">懒</div><span className="text-xl font-bold">懒老板</span></Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <FiCamera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">还没有生成脚本</h2>
          <p className="text-gray-500 mb-6">先去生成内容，再来看拍摄指导</p>
          <Link href="/generate" className="btn-primary">去生成脚本</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">懒</div><span className="text-xl font-bold">懒老板</span></Link>
            <span className="text-sm text-gray-400">| 拍摄指导</span>
          </div>
          <button onClick={handleExport} className="btn-outline text-sm flex items-center gap-1"><FiDownload className="w-3 h-3" />导出</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">拍摄指导</h1>
            <p className="text-gray-500 text-sm">李八字体系 · 逐镜引导</p>
          </div>
          <Link href="/schedule" className="btn-primary text-sm flex items-center gap-1"><FiRefreshCw className="w-3 h-3" />查看排期</Link>
        </div>

        {/* 体系概览 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
          <h3 className="font-semibold text-sm mb-3">三大固定镜头标准（每条必备）</h3>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-brand-50/50 rounded-lg p-3">
              <span className="font-medium text-brand-700">近景口播</span>
              <p className="text-xs text-gray-500 mt-1">胸口以上 · 固定机位 · 自然光 · 占60%</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <span className="font-medium text-blue-700">纪实行走</span>
              <p className="text-xs text-gray-500 mt-1">手持微晃 · 边走边讲 · 车间/门店 · 占25%</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <span className="font-medium text-amber-700">产品特写</span>
              <p className="text-xs text-gray-500 mt-1">材质细节 · 手部动作 · 库存实拍 · 占15%</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400 flex flex-wrap gap-3">
            <span>剪辑：23±2秒 | 0-3s钩子 → 3-19s正文 → 19s-结尾引流</span>
            <span>字幕：黑体加粗居中 | 无花字无贴纸 | BGM轻音乐≤人声20%</span>
          </div>
        </div>

        <div className="space-y-3">
          {scripts.map(s => {
            const guide = getGuide(s)
            const isExpanded = expandedId === s.id
            const hasAi = !!aiGuides[s.id]
            return (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all">
                <button className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{s.id.toUpperCase()}</span>
                    <span className="font-medium text-sm">{s.title}</span>
                    {hasAi && <span className="text-xs text-brand-400 bg-brand-50 px-1.5 py-0.5 rounded">AI定制</span>}
                  </div>
                  {isExpanded ? <FiChevronUp className="text-gray-400 shrink-0" /> : <FiChevronDown className="text-gray-400 shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="space-y-3 mb-4">
                      {guide.questions.map((q, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-brand-50/50 rounded-lg">
                          <FiHelpCircle className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-700">{q}</p>
                        </div>
                      ))}
                    </div>
                    {guide.shots.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-blue-800 mb-2">镜头方案</p>
                        <div className="flex flex-wrap gap-2">
                          {guide.shots.map((s, i) => (
                            <span key={i} className="text-xs bg-white px-2 py-1 rounded text-blue-700 border border-blue-100">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="bg-amber-50 rounded-lg p-3 mb-4">
                      <p className="text-xs font-medium text-amber-800 mb-2">拍摄小贴士</p>
                      <div className="flex flex-wrap gap-2">
                        {guide.tips.map((t, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded text-amber-700 border border-amber-100">{t}</span>
                        ))}
                      </div>
                    </div>
                    {guide.editRules.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-purple-800 mb-2">剪辑标准</p>
                        <div className="flex flex-wrap gap-2">
                          {guide.editRules.map((r, i) => (
                            <span key={i} className="text-xs bg-white px-2 py-1 rounded text-purple-700 border border-purple-100">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">脚本原文</p>
                      <p className="text-sm text-gray-700">{s.content}</p>
                    </div>
                    {!hasAi && (
                      <button onClick={() => generateGuide(s)} disabled={generatingId === s.id}
                        className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-500 transition-colors">
                        <FiZap className="w-4 h-4" />{generatingId === s.id ? 'AI生成中...' : 'AI 重新生成拍摄指导'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-8 flex gap-3">
          <Link href="/coaching" className="btn-outline flex-1 text-center"><FiCamera className="w-4 h-4 mr-1 inline" />出镜纠错</Link>
          <Link href="/schedule" className="btn-primary flex-1 text-center"><FiRefreshCw className="w-3 h-3 mr-1 inline" />排期表</Link>
        </div>
      </main>
    </div>
  )
}
