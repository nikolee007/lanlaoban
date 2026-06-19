'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import NavHeader from '../components/NavHeader'
import { FiSend, FiMic, FiStopCircle, FiImage, FiFile, FiZap, FiCheck, FiTrash2, FiPaperclip } from 'react-icons/fi'

type MediaItem = { type: 'image' | 'document'; name: string; data: string; preview?: string }
type ChatMessage = { role: 'user' | 'assistant'; content: string }

// 从 localStorage 获取 token
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem('lanlaoban_token') } catch { return null }
}

// 保存聊天到 API（登录用户）
async function saveChat(role: string, content: string, metadata?: Record<string, unknown>) {
  const token = getToken()
  if (!token) return
  try {
    await fetch('/api/ip-profile/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role, content, metadata }),
    })
  } catch {} // 静默失败，不影响用户体验
}

// 保存 IP 档案到 API
async function saveProfile(extract: Record<string, string>) {
  const token = getToken()
  if (!token) return
  try {
    await fetch('/api/ip-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(extract),
    })
  } catch {}
}


export default function InterviewPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '嘿，你好！我是懒老板的编导。先说说你怎么称呼？做什么行业的？随便聊，不用紧张 ' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [extract, setExtract] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [listening, setListening] = useState(false)
  const [media, setMedia] = useState<MediaItem[]>([])
  const recognitionRef = useRef<any>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 加载待处理的跟进消息（登录用户）
  useEffect(() => {
    async function loadFollowUps() {
      try {
        const token = localStorage.getItem('lanlaoban_token')
        if (!token) return
        const res = await fetch('/api/ip-profile/follow-up', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (json.success && json.data?.due) {
          // 有到期跟进，触发一条新的跟进消息
          const fwRes = await fetch('/api/ip-profile/follow-up', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
          const fwJson = await fwRes.json()
          if (fwJson.success && fwJson.data?.message) {
            setMessages(prev => {
              // 不重复添加同一条消息
              if (prev.some(m => m.content === fwJson.data.message)) return prev
              return [...prev, { role: 'assistant' as const, content: fwJson.data.message }]
            })
          }
        }
      } catch {}
    }
    loadFollowUps()
  }, [])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    const finalText = text + (media.length > 0 ? `\n[附件: ${media.map(m => m.name).join(', ')}]` : '')
    if (!finalText.trim()) return

    const userMsg: ChatMessage = { role: 'user', content: finalText }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setMedia([])
    setLoading(true)

    // 保存用户消息
    saveChat('user', finalText)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data = await res.json()
      const reply = data.reply || '刚才走神了，你再说一遍？'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      // 保存 AI 回复
      saveChat('assistant', reply)
      if (data.extract) {
        setExtract(data.extract)
        if (data.extract.progress) setProgress(data.extract.progress)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '刚才走神了，你再说一遍？' }])
    }
    setLoading(false)
  }, [messages, media])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const toggleVoice = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert('当前浏览器不支持语音输入'); return }
    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e: any) => setInput(prev => prev + e.results[0][0].transcript)
    recognition.onend = () => setListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setListening(true)
  }, [listening])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setMedia(prev => [...prev, { type: 'image', name: file.name, data: reader.result as string, preview: reader.result as string }])
    reader.readAsDataURL(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setMedia(prev => [...prev, { type: 'document', name: file.name, data: reader.result as string }])
    reader.readAsDataURL(file)
  }

  const finishInterview = () => {
    localStorage.setItem('lanlaoban_interview', JSON.stringify(extract))
    localStorage.setItem('lanlaoban_persona_source', JSON.stringify(extract))
    // 保存到数据库（登录用户）
    saveProfile(extract)
    const kw = (extract.industry || '').toLowerCase()
    let coach = 'libazi'
    if (/餐饮|饭店|火锅|烧烤|奶茶/.test(kw)) coach = 'boge'
    else if (/装修|建材|家具|全屋定制/.test(kw)) coach = 'zhuge'
    else if (/工厂|加工|制造|五金/.test(kw)) coach = 'geng'
    localStorage.setItem('lanlaoban_coach', coach)
    router.push('/ai-video')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* 进度 */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span className="text-brand-400 font-medium">编导采访</span>
            <span>了解度 {progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(extract).filter(([k, v]) => v && k !== 'progress').map(([k, v]) => (
              <span key={k} className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-200">
                {k === 'name' ? '称呼' : k === 'industry' ? '行业' : k === 'product' ? '产品' : k === 'customer' ? '客户' : k === 'personality' ? '性格' : k === 'goal' ? '目标' : k === 'commitment' ? 'Slogan' : k}
              </span>
            ))}
          </div>
        </div>

        {/* 聊天 */}
        <div ref={chatRef} className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[350px] px-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-brand-400 text-white flex items-center justify-center text-sm font-bold shrink-0">编</div>
              )}
              <div className={`rounded-2xl px-4 py-3 max-w-[82%] ${
                msg.role === 'user' ? 'bg-brand-400 text-white rounded-tr-sm' : 'bg-white border border-gray-100 shadow-sm rounded-tl-sm text-gray-800'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-400 text-white flex items-center justify-center text-sm font-bold shrink-0">编</div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3.5 border border-gray-100 shadow-sm">
                <div className="flex gap-1.5"><span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" /><span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div>
              </div>
            </div>
          )}
        </div>

        {/* 附件预览 */}
        {media.length > 0 && (
          <div className="flex gap-2 mb-2 px-1">
            {media.map((m, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 px-3 py-2 flex items-center gap-2 text-sm">
                {m.type === 'image' ? <img src={m.data} alt="" className="h-10 w-10 rounded object-cover" loading="lazy" /> : <FiFile className="w-4 h-4 text-gray-400" />}
                <span className="text-xs text-gray-600 max-w-[100px] truncate">{m.name}</span>
                <button onClick={() => setMedia(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500"><FiTrash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}

        {/* 输入区 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-end gap-2 p-3">
            <div className="flex gap-1">
              <button onClick={() => imageInputRef.current?.click()} className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors" title="传图片">
                <FiImage className="w-4 h-4" />
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors" title="传文档">
                <FiFile className="w-4 h-4" />
              </button>
              <button onClick={toggleVoice} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${listening ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`} title={listening ? '停止' : '语音'}>
                {listening ? <FiStopCircle className="w-4 h-4" /> : <FiMic className="w-4 h-4" />}
              </button>
            </div>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              placeholder={listening ? '正在听...' : '跟编导聊聊你的故事...'} disabled={loading} />
            {progress >= 80 ? (
              <button onClick={finishInterview} className="btn-primary text-sm flex items-center gap-1.5 whitespace-nowrap">
                <FiCheck className="w-4 h-4" /> 完成采访
              </button>
            ) : (
              <button onClick={() => sendMessage(input)} disabled={!input.trim() && media.length === 0 || loading}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${input.trim() || media.length > 0 ? 'bg-brand-400 text-white hover:bg-brand-500' : 'bg-gray-100 text-gray-300'}`}>
                <FiSend className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileUpload} />
    </div>
  )
}
