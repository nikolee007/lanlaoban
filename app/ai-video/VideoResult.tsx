'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  FiCopy, FiPlay, FiClock, FiCamera, FiUser, FiStar, FiGlobe,
  FiEdit3, FiRefreshCw, FiCheck, FiMonitor, FiSmartphone,
  FiCheckSquare, FiArrowRight, FiZap,
} from 'react-icons/fi'
import { INFO, getTpl, getShotImage, shotTypeToId, COLOR_SCHEME } from './data'
import type { VideoType, Tab, ScriptBlock } from './data'

export default function VideoResult({
  vt, brand, prod, blocks, onBack, onCopyAll,
}: {
  vt: VideoType
  brand: string
  prod: string
  blocks: ScriptBlock[]
  onBack: () => void
  onCopyAll: () => void
}) {
  const [tab, setTab] = useState<Tab>('todo')
  const [hover, setHover] = useState<number | null>(null)
  const [doneTasks, setDoneTasks] = useState<string[]>([])
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const info = INFO[vt]
  const tpls = getTpl(vt)
  const toggleTask = (id: string) =>
    setDoneTasks(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const TABS: { k: Tab; step: string; l: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { k: 'todo', step: '第一步', l: '拍摄清单', desc: '核对拍摄所需的一切准备', icon: FiCheckSquare as React.ComponentType<{ className?: string }>, color: '#FF6034' },
    { k: 'script', step: '第二步', l: '完整脚本', desc: '逐段精读，记住台词', icon: FiEdit3 as React.ComponentType<{ className?: string }>, color: '#3B82F6' },
    { k: 'shots', step: '第三步', l: '怎么拍', desc: '每段脚本的拍摄指导+参考图', icon: FiCamera as React.ComponentType<{ className?: string }>, color: '#8B5CF6' },
    { k: 'guide', step: '参考', l: '机位库', desc: '8种机位的效果+架设图', icon: FiMonitor as React.ComponentType<{ className?: string }>, color: '#059669' },
  ]

  const TASKS = [
    { id: 'read', label: '通读一遍脚本，理解内容' },
    { id: 'props', label: '准备：手机+支架+充电+领夹麦' },
    { id: 'light', label: '找光线好的位置（脸朝向窗）' },
    { id: 'clean', label: '清理拍摄背景（不要太乱）' },
    { id: 'dress', label: '穿纯色衣服（不要条纹/格子）' },
    { id: 'test', label: '试拍10秒，检查声音和画面' },
    { id: 'film1', label: '拍摄第1-3段（开场+环境+人设）' },
    { id: 'film2', label: '拍摄第4-7段（产品+反馈+行动）' },
    { id: 'review', label: '回看素材，补拍不满意的部分' },
    { id: 'share', label: '发布！复制脚本发到抖音/TikTok' },
  ]

  const TIPS = [
    { title: '光线', tips: ['脸朝窗户或光源', '别在头顶只有一盏灯下拍', '黄昏前1小时光线最柔美'] },
    { title: '声音', tips: ['手机离嘴20-30cm', '安静环境拍', '嘈杂环境买¥30领夹麦'] },
    { title: '画面', tips: ['拍前擦镜头', '横屏握稳或放支架', '每个镜头至少5秒'] },
    { title: '剪辑', tips: ['剪映免费版够用', '字幕自动生成', '加背景音乐更专业'] },
    { title: '发布', tips: ['9:16竖屏发抖音', '标题带关键词', '发布时间晚7-9点'] },
    { title: '坚持', tips: ['至少连续发30天', '每天看数据优化', '前10条是练手'] },
  ]

  return (
    <div ref={resultRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: info.bg }}>
            <info.icon className="h-4 w-4" style={{ color: info.color }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{info.title}</h2>
            <p className="text-xs text-gray-400">{brand} × {prod} · 2:00</p>
          </div>
        </div>
        <button onClick={onBack} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
          <FiRefreshCw className="h-3.5 w-3.5" /> 重做
        </button>
      </div>

      {/* Tab navigation */}
      <div className="mb-8">
        <div className="grid gap-3 sm:grid-cols-4">
          {TABS.map(ti => (
            <button key={ti.k} onClick={() => setTab(ti.k)}
              className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 border-2 ${
                tab === ti.k ? 'border-transparent shadow-lg scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
              }`}
              style={tab === ti.k ? { background: `linear-gradient(135deg, ${ti.color}15, ${ti.color}08)`, borderColor: ti.color } : {}}>
              {tab === ti.k && (
                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full opacity-10"
                  style={{ background: `radial-gradient(circle, ${ti.color}, transparent 70%)` }} />
              )}
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                  tab === ti.k ? 'text-white shadow-md' : 'bg-gray-100 text-gray-400'
                }`} style={tab === ti.k ? { backgroundColor: ti.color } : {}}>
                  <ti.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${tab === ti.k ? 'opacity-80' : 'text-gray-400'}`}
                    style={tab === ti.k ? { color: ti.color } : {}}>{ti.step}</span>
                  <p className={`text-base font-bold ${tab === ti.k ? 'text-gray-900' : 'text-gray-700'}`}>{ti.l}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{ti.desc}</p>
                </div>
                {tab === ti.k && (
                  <div className="ml-auto"><div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 shadow-sm">
                    <FiArrowRight className="h-3 w-3" style={{ color: ti.color }} /></div></div>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400">
          {[1, 2, 3, 4].map(n => (<span key={n} className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-[10px]">{n}</span>))}
          <span className="text-gray-300 ml-2">按顺序从上往下做，每一步都准备好了再下一步</span>
        </div>
      </div>

      {/* ═══ Tab: 拍摄清单 ═══ */}
      {tab === 'todo' && (
        <div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-apple mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">拍摄清单</h3>
              <span className="text-xs text-gray-400">{doneTasks.length}/10 已完成</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div className="h-2 rounded-full transition-all bg-gradient-to-r from-brand-400 to-purple-500"
                style={{ width: `${doneTasks.length / 10 * 100}%` }} />
            </div>
            <div className="space-y-2">
              {TASKS.map(task => (
                <button key={task.id} onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all ${doneTasks.includes(task.id) ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${doneTasks.includes(task.id) ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                    {doneTasks.includes(task.id) && <FiCheck className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span className={`text-sm ${doneTasks.includes(task.id) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            {[{ tab: 'script' as Tab, label: '看完整脚本', color: '#FF6034' },
              { tab: 'shots' as Tab, label: '看拍摄指导', color: '#3B82F6' },
              { tab: 'guide' as Tab, label: '看机位库', color: '#8B5CF6' },
            ].map((t, i) => (
              <div key={t.tab} className="card text-center cursor-pointer" onClick={() => setTab(t.tab)}>
                <p className="text-2xl mb-1" style={{ fontSize: '20px', fontWeight: 700, color: t.color }}>{['A', 'B', 'C'][i]}</p>
                <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                <p className="text-[11px] text-gray-400">{['知道要说什么', '知道要怎么拍', '学全部技巧'][i]}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #FFF5F0, #FFE4D6, #F0EBFF)' }}>
            <p className="text-sm font-semibold text-gray-900">拍完了？去全球供应链找更多好货来拍！</p>
            <p className="text-xs text-gray-500 mt-1">每个商品都可以用AI一键生成短视频脚本</p>
            <Link href="/global-supply" className="mt-3 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: '#FF6034' }}>去找货源 <FiArrowRight className="h-4 w-4" /></Link>
            <button onClick={onCopyAll} className="mt-3 ml-3 inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold"
              style={{ borderColor: '#FF6034', color: '#FF6034' }}><FiCopy className="h-4 w-4" /> 复制脚本</button>
          </div>
        </div>
      )}

      {/* ═══ Tab: 完整脚本 ═══ */}
      {tab === 'script' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">完整脚本</h3>
            <button onClick={onCopyAll} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
              <FiCopy className="h-3.5 w-3.5" /> 复制全部</button>
          </div>
          <div className="text-xs text-gray-400 mb-4 flex items-center gap-2">
            <FiClock className="h-3 w-3" /> 总时长2:00 · {blocks.length}段 · {brand} × {prod}
          </div>
          <div className="space-y-4">
            {blocks.map((b, i) => {
              const emotionIcon = (b.emotion || '').match(/^(\p{Emoji})/u)?.[1] || ''
              const emotionText = (b.emotion || '').replace(/^\p{Emoji}\s*/u, '')
              return (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-gray-400">[{b.t0}→{b.t1}]</span>
                    <span className="text-xs font-semibold text-gray-700">{b.title}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{b.shotType}</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{b.line}</p>
                  <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100/60">
                    <span className="text-sm leading-none shrink-0 mt-0.5">{emotionIcon || '👁️'}</span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">🎣 情绪钩子 · 用户为什么不划走</span>
                      <p className="text-xs text-purple-700/80 leading-relaxed mt-0.5">{emotionText}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{b.shotDesc}</p>
                  {i < blocks.length - 1 && <hr className="mt-3 border-gray-100" />}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ Tab: 拍摄指导 ═══ */}
      {tab === 'shots' && (
        <div>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FiClock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">时间线 · 共2:00</span>
            </div>
            <div className="flex h-8 rounded-lg overflow-hidden shadow-sm">
              {blocks.map((b, i) => {
                const s = parseInt(b.t0) || 0
                const e = parseInt(b.t1) || 120
                return <div key={i} className="flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ width: `${(e - s) / 120 * 100}%`, minWidth: 16, background: `linear-gradient(135deg, ${COLOR_SCHEME[i % COLOR_SCHEME.length]}, ${COLOR_SCHEME[(i + 1) % COLOR_SCHEME.length]})` }}>
                  {e - s > 15 && b.t0}</div>
              })}
            </div>
          </div>
          <div className="space-y-3">
            {blocks.map((b, i) => (
              <div key={i} className="card p-4 hover:shadow-apple-md transition-all"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <div className="flex gap-3">
                  <div className="shrink-0 w-12 text-center pt-0.5">
                    <div className="text-base font-bold" style={{ color: COLOR_SCHEME[i % COLOR_SCHEME.length] }}>{b.t0}</div>
                    <div className="text-[9px] text-gray-400">→{b.t1}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLOR_SCHEME[i % COLOR_SCHEME.length] }} />
                      <h3 className="font-bold text-sm text-gray-900">{b.title}</h3>
                      <span className="text-[10px] text-gray-400 ml-auto">{b.shotType}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{b.line}</p>
                    {b.emotion && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px]">{b.emotion.match(/^(\p{Emoji})/u)?.[1] || '👁️'}</span>
                        <span className="text-[10px] text-purple-500/70 italic">🎣 {(b.emotion || '').replace(/^\p{Emoji}\s*/u, '').split('→')[0]}</span>
                      </div>
                    )}
                    {hover === i && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-2">
                        <div className="flex gap-3">
                          <div className="w-24 sm:w-28 shrink-0">
                            <div className="aspect-[3/4] rounded-lg bg-gray-200 overflow-hidden">
                              <img
                                src={(() => {
                                  const sid = shotTypeToId(b.shotType)
                                  const primary = getShotImage(sid, vt)
                                  const chineseMap: Record<string, string> = {
                                    'restaurant-特写': '/shooting-templates/restaurant-美食特写.png',
                                    'restaurant-自拍': '/shooting-templates/restaurant-老板面对镜头.png',
                                    'restaurant-行走': '/shooting-templates/restaurant-第一人称做菜.png',
                                    'restaurant-环境': '/shooting-templates/restaurant-环境全景.png',
                                    'brand-特写': '/shooting-templates/brand-产品细节.png',
                                    'brand-自拍': '/shooting-templates/brand-创始人肖像.png',
                                    'brand-环境': '/shooting-templates/brand-工作室氛围.png',
                                    'trust-特写': '/shooting-templates/trust-手工艺特写.png',
                                    'trust-自拍': '/shooting-templates/trust-面对面访谈.png',
                                    'trust-环境': '/shooting-templates/trust-老板工作室.png',
                                    'knowledge-自拍': '/shooting-templates/knowledge-口播正面.png',
                                    'review-特写': '/shooting-templates/review-功能演示.png',
                                  }
                                  return chineseMap[`${vt}-${sid}`] || chineseMap[`${vt}-${b.shotType}`] || primary
                                })()}
                                alt="" className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-gray-500 mb-0.5">{b.shotType}</p>
                            <p className="text-xs text-gray-600 mb-1">{b.shotDesc}</p>
                            <p className="text-xs text-gray-500">{b.tip}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Tab: 机位库 ═══ */}
      {tab === 'guide' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">共 {tpls.length} 种机位 · 每种含效果参考 + 手机/相机架设示意</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {tpls.map(t => (
              <div key={t.id} className="card overflow-hidden p-0 hover:shadow-apple-md transition-all">
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img src={getShotImage(t.id, vt)} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90">
                        <t.icon className="h-3.5 w-3.5" style={{ color: '#FF6034' }} /></div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-[9px] text-white font-medium">效果参考</div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-3">{t.desc}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {t.angles.map((a, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{a}</span>)}
                  </div>
                  {/* Phone setup */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2"><FiSmartphone className="h-3.5 w-3.5 text-gray-400" /><span className="text-[11px] font-semibold text-gray-700">手机架设</span></div>
                    {t.phoneSetup.map((s, i) => (
                      <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3 mb-2">
                        <p className="text-[11px] font-semibold text-gray-700">{s.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">人：{s.subjectPos}</p>
                        <p className="text-[10px] text-gray-400">机：{s.camPos}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                  {/* Camera setup */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2"><FiCamera className="h-3.5 w-3.5 text-gray-400" /><span className="text-[11px] font-semibold text-gray-700">相机架设</span></div>
                    {t.camSetup.map((s, i) => (
                      <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3 mb-2">
                        <p className="text-[11px] font-semibold text-gray-700">{s.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">人：{s.subjectPos}</p>
                        <p className="text-[10px] text-gray-400">机：{s.camPos}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-500 mb-1.5">拍摄技巧：</p>
                    {t.tips.map((tip, i) => <p key={i} className="text-[11px] text-gray-500">• {tip}</p>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 card">
            <h3 className="text-sm font-bold text-gray-900 mb-4">新手拍视频必看</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TIPS.map((s, i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">{s.title}</p>
                  <ul className="space-y-1">{s.tips.map((tip, j) => <li key={j} className="text-xs text-gray-600 flex gap-1.5"><span className="text-brand-400">•</span>{tip}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-8 rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #FFF5F0, #FFE4D6, #F0EBFF)' }}>
        <p className="text-sm font-semibold text-gray-900">拿到脚本了？现在就去拍第一条视频</p>
        <p className="text-xs text-gray-500 mt-1">拍完去全球供应链找更多好货来创作</p>
        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
          <button onClick={onCopyAll} className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: '#FF6034' }}><FiCopy className="h-4 w-4" /> 复制脚本</button>
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold"
            style={{ borderColor: '#FF6034', color: '#FF6034' }}><FiZap className="h-4 w-4" /> 再做一个</button>
          <Link href="/digital-human" className="inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold"
            style={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}><FiUser className="h-4 w-4" /> 数字人口播</Link>
          <Link href="/cross-border" className="inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold"
            style={{ borderColor: '#059669', color: '#059669' }}><FiGlobe className="h-4 w-4" /> 跨境AI工具</Link>
        </div>
      </div>
    </div>
  )
}
