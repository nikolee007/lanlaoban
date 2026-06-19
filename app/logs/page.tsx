'use client'
import { useState, useEffect } from 'react'
import NavHeader from '../components/NavHeader'
import { FiPlus, FiMic, FiFileText, FiTrash2, FiCalendar, FiTrendingUp, FiZap, FiChevronDown, FiChevronUp } from 'react-icons/fi'

interface LogEntry {
  id: string
  date: string
  title: string
  scriptContent: string
  recordingNote: string
  vibe: string
  feedback: string
  improvement: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', scriptContent: '', recordingNote: '', vibe: '正常', feedback: '', improvement: '' })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('lanlaoban_logs')
    if (stored) { try { setLogs(JSON.parse(stored)) } catch {} }
  }, [])

  useEffect(() => { if (mounted) localStorage.setItem('lanlaoban_logs', JSON.stringify(logs)) }, [logs, mounted])

  const addLog = () => {
    if (!form.title.trim()) return
    const entry: LogEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('zh-CN'),
      ...form,
    }
    setLogs([entry, ...logs])
    setForm({ title: '', scriptContent: '', recordingNote: '', vibe: '正常', feedback: '', improvement: '' })
    setShowForm(false)
  }

  const deleteLog = (id: string) => setLogs(logs.filter(l => l.id !== id))

  const getInsights = () => {
    if (logs.length < 3) return null
    const vibes = logs.map(l => l.vibe)
    const goodCount = vibes.filter(v => v === '好').length
    const total = vibes.length
    return { total, goodRate: Math.round(goodCount / total * 100), topImprovements: logs.filter(l => l.improvement).slice(0, 5) }
  }

  const insights = getInsights()

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">日常拍摄记录</h1>
            <p className="text-gray-500 text-sm">记录每次拍摄，系统越用越懂你</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-1">
            <FiPlus className="w-4 h-4" />记录
          </button>
        </div>

        {/* 洞察 */}
        {insights && (
          <div className="bg-gradient-to-r from-brand-50 to-orange-50 rounded-xl border border-brand-100 p-5 mb-6">
            <div className="flex items-center gap-2 mb-3"><FiTrendingUp className="text-brand-400" /><span className="font-weight-semibold">你的拍摄趋势</span></div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold text-brand-400">{insights.total}</p><p className="text-xs text-gray-500">总拍摄次数</p></div>
              <div><p className="text-2xl font-bold text-green-500">{insights.goodRate}%</p><p className="text-xs text-gray-500">满意率</p></div>
              <div><p className="text-2xl font-bold text-brand-400">{insights.topImprovements.length}</p><p className="text-xs text-gray-500">改进点记录</p></div>
            </div>
          </div>
        )}

        {/* 记录表单 */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <h2 className="font-semibold mb-4">记录本次拍摄</h2>
            <div className="space-y-3">
              <div><label className="text-sm font-medium mb-1 block">视频标题</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input" placeholder="如：自我介绍定人设" /></div>
              <div><label className="text-sm font-medium mb-1 block">脚本文案</label>
                <textarea value={form.scriptContent} onChange={e => setForm({ ...form, scriptContent: e.target.value })} className="input h-24" placeholder="粘贴或输入此次拍摄的脚本文案..." /></div>
              <div><label className="text-sm font-medium mb-1 block">拍摄记录（状态/感觉/心得）</label>
                <textarea value={form.recordingNote} onChange={e => setForm({ ...form, recordingNote: e.target.value })} className="input h-20" placeholder="今天拍了多少条？状态怎么样？哪里卡住了？" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">整体感觉</label>
                  <select value={form.vibe} onChange={e => setForm({ ...form, vibe: e.target.value })} className="input">
                    <option value="好">好</option><option value="正常">正常</option><option value="差">差</option>
                  </select>
                </div>
              </div>
              <div><label className="text-sm font-medium mb-1 block">自我反馈（哪里做得好）</label>
                <textarea value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} className="input h-16" placeholder="这次比上次进步的地方..." /></div>
              <div><label className="text-sm font-medium mb-1 block">改进点（下次注意什么）</label>
                <textarea value={form.improvement} onChange={e => setForm({ ...form, improvement: e.target.value })} className="input h-16" placeholder="眼神、语速、手势..." /></div>
              <button onClick={addLog} className="btn-primary w-full flex items-center justify-center gap-2"><FiPlus className="w-4 h-4" />保存记录</button>
            </div>
          </div>
        )}

        {/* 记录列表 */}
        {logs.length === 0 && !showForm && (
          <div className="text-center py-20">
            <FiMic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">还没有拍摄记录</h2>
            <p className="text-gray-500 mb-6 text-sm">每次拍完随手记一笔，系统会越来越懂你的表达习惯</p>
            <button onClick={() => setShowForm(true)} className="btn-primary"><FiPlus className="w-4 h-4 mr-1 inline" />记录第一次拍摄</button>
          </div>
        )}

        {/* 列表 */}
        {logs.length > 0 && (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${log.vibe === '好' ? 'bg-green-500' : log.vibe === '差' ? 'bg-red-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="font-medium text-sm">{log.title || '未命名'}</p>
                      <p className="text-xs text-gray-400">{log.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.recordingNote && <FiMic className="w-3.5 h-3.5 text-gray-300" />}
                    {log.scriptContent && <FiFileText className="w-3.5 h-3.5 text-gray-300" />}
                    <button onClick={e => { e.stopPropagation(); deleteLog(log.id) }} className="text-gray-300 hover:text-red-500 transition-colors">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                    {expandedId === log.id ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                  </div>
                </div>
                {expandedId === log.id && (
                  <div className="px-5 pb-4 border-t pt-3 space-y-3">
                    {log.scriptContent && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">脚本文案</p>
                        <p className="text-sm text-gray-700">{log.scriptContent}</p>
                      </div>
                    )}
                    {log.recordingNote && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-500 mb-1">拍摄记录</p>
                        <p className="text-sm text-blue-800">{log.recordingNote}</p>
                      </div>
                    )}
                    {log.feedback && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 mb-1">做得好的</p>
                        <p className="text-sm text-green-800">{log.feedback}</p>
                      </div>
                    )}
                    {log.improvement && (
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs text-amber-600 mb-1">下次改进</p>
                        <p className="text-sm text-amber-800">{log.improvement}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
