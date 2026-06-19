'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiCalendar, FiClock, FiPlay, FiRefreshCw, FiDownload, FiZap, FiCamera, FiEdit3 } from 'react-icons/fi'

interface ScriptItem { id: string; module: string; title: string; content: string; duration?: string }

const weekdays = ['一', '二', '三', '四', '五', '六', '日']

const PHASE_TEMPLATES: Record<string, { days: number; short: number; long: number; label: string; theme: string }> = {
  cold: { days: 7, short: 5, long: 2, label: '冷启动期', theme: '人设打底+痛点引流' },
  growth: { days: 14, short: 3, long: 4, label: '爬坡起量期', theme: '干货+实景穿插' },
  stable: { days: 9, short: 2, long: 5, label: '稳定变现期', theme: '案例+招商+转化' },
}

const CONTENT_THEMES: Record<string, string[]> = {
  A: ['人设故事', '创业经历', '做人底线', '性格标签', '从业初心', '老板承诺'],
  B: ['行业真话', '内幕揭秘', '行业规则', '低价陷阱', '行业变局', '实体感悟'],
  C: ['踩坑案例', '隐形套路', '选品标准', '避坑指南', '防骗技巧', '行业对比'],
  D: ['工厂实景', '库存展示', '产品细节', '成交现场', '质检流程', '交付实拍'],
  E: ['真诚必杀技', '长期主义', '老客户复购', '拒绝内卷', '引流收口', '人设升华'],
}

export default function SchedulePage() {
  const [scripts, setScripts] = useState<ScriptItem[]>([])
  const [coach, setCoach] = useState('libazi')
  const [phase, setPhase] = useState<'cold' | 'growth' | 'stable'>('growth')
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const s = localStorage.getItem('lanlaoban_scripts')
    if (s) { try { setScripts(JSON.parse(s)) } catch {} }
    const c = localStorage.getItem('lanlaoban_coach')
    if (c) setCoach(c)
  }, [])

  const coachName = coach === 'boge' ? '烟火派·同城共情' : coach === 'zhuge' ? '认知派·高客单' : coach === 'geng' ? '工业派·B端' : '纪实派·全品类'
  const ph = PHASE_TEMPLATES[phase]
  const totalDays = ph.days

  // 生成排期
  const schedule = Array.from({ length: totalDays }, (_, i) => {
    const dayDate = new Date(date)
    dayDate.setDate(dayDate.getDate() + i)
    const scriptIdx = i % scripts.length
    const script = scripts[scriptIdx]
    const modKeys = Object.keys(CONTENT_THEMES)
    const themeIdx = i % modKeys.length
    const themeList = CONTENT_THEMES[modKeys[themeIdx]] || CONTENT_THEMES.A
    const isShort = i < ph.short
    const period = isShort ? (i % 2 === 0 ? '上午7:30' : '中午12:00') : (i % 2 === 0 ? '晚8:00' : '晚6:00')
    const weekIdx = dayDate.getDay()
    const weekLabel = weekdays[weekIdx === 0 ? 6 : weekIdx - 1]
    return {
      day: i + 1, date: `${dayDate.getMonth() + 1}月${dayDate.getDate()}日`, week: weekLabel,
      period, type: isShort ? '引流款' : '成交款', duration: isShort ? '20-30s' : '60-120s',
      theme: themeList[i % themeList.length],
      title: script?.title || themeList[i % themeList.length],
      id: script?.id || `t${i}`,
    }
  })

  const handleExport = () => {
    let text = `懒老板 - ${coachName} · 30天发布排期\n阶段：${ph.label}（${ph.theme}）\n\n`
    schedule.forEach(s => { text += `D${s.day} ${s.date} 周${s.week} ${s.period} [${s.type}] ${s.duration} ${s.theme}\n` })
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '懒老板-发布排期.txt'
    a.click()
  }

  if (scripts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavHeader />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">还没有生成内容</h2>
          <Link href="/generate" className="btn-primary">去生成脚本</Link>
        </main>
      </div>
    )
  }

  const phaseColors: Record<string, string> = { cold: 'bg-blue-500', growth: 'bg-amber-500', stable: 'bg-green-500' }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold mb-1">发布排期</h1><p className="text-sm text-gray-400">{coachName}</p></div>
          <button onClick={handleExport} className="btn-outline text-sm"><FiDownload className="w-3 h-3 mr-1" />导出</button>
        </div>

        {/* 阶段选择 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['cold', 'growth', 'stable'] as const).map(p => {
            const t = PHASE_TEMPLATES[p]
            return (
              <button key={p} onClick={() => setPhase(p)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${phase === p ? 'bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}
                style={phase === p ? { borderColor: '#FF6034' } : {}}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${phaseColors[p]}`} />
                  <span className="font-semibold text-sm">{t.label}</span>
                </div>
                <p className="text-xs text-gray-500">{t.days}天 · {t.short}短+{t.long}长 · {t.theme}</p>
              </button>
            )
          })}
        </div>

        {/* 日历 */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {weekdays.map(d => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
          {schedule.map(s => (
            <div key={s.day}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs cursor-pointer transition-colors
                ${s.type === '引流款' ? 'bg-blue-50 text-blue-700' : 'bg-brand-50 text-brand-700'}
                hover:shadow-sm`}
              title={`D${s.day}: ${s.theme} [${s.type}] ${s.duration}`}>
              <span className="font-bold">{s.day}</span>
              <span className="text-[9px] opacity-70">{s.type === '引流款' ? '短' : '长'}</span>
            </div>
          ))}
        </div>

        {/* 图例 */}
        <div className="flex gap-4 text-xs text-gray-500 mb-6">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" /> 引流款（20-30s）</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand-50 border border-brand-200" /> 成交款（60-120s）</span>
        </div>

        {/* 排期列表 */}
        <div className="space-y-1.5">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm"><FiCalendar className="text-brand-400" /> {ph.label}每日计划</h2>
          {schedule.map(s => (
            <div key={s.day} className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center justify-between hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-center w-8">
                  <p className="text-sm font-bold text-gray-900">D{s.day}</p>
                  <p className="text-[10px] text-gray-400">{s.week}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">{s.theme}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.type === '引流款' ? 'bg-blue-50 text-blue-600' : 'bg-brand-50 text-brand-600'}`}>{s.type}</span>
                    <span className="text-[10px] text-gray-400">{s.duration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <FiClock className="w-3 h-3" />{s.period}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t">
          <Link href="/scripts" className="btn-outline flex-1 text-center"><FiEdit3 className="w-4 h-4 mr-1 inline" />脚本库</Link>
          <Link href="/scenes" className="btn-outline flex-1 text-center"><FiCamera className="w-4 h-4 mr-1 inline" />场景方案</Link>
          <Link href="/guide" className="btn-primary flex-1 text-center"><FiZap className="w-4 h-4 mr-1 inline" />拍摄指导</Link>
        </div>
      </main>
    </div>
  )
}
