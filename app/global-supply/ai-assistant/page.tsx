'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'; import { useRouter } from 'next/navigation'
import Breadcrumb from '../../components/Breadcrumb'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  FiSend, FiTrash2, FiZap, FiSearch, FiMessageSquare,
  FiClock, FiChevronRight, FiPlus, FiTrendingUp, FiUser,
  FiBook, FiCamera, FiStar, FiEdit3, FiCheck, FiAlertCircle,
  FiRefreshCw, FiHeart, FiTarget, FiAward, FiCalendar,
  FiDollarSign, FiGlobe, FiSmartphone,
} from 'react-icons/fi'

/* ─── Types ─────────────────────────────────────── */

type Tab = 'chat' | 'profile' | 'materials'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  lastMessage?: string
}

interface IpProfileData {
  name: string
  industry: string
  experience: string
  targetAudience: string
  originStory: string
  achievements: string[]
  keyEvents: string[]
  contentIdeas: string[]
  videoCount: number
  followUpCount: number
  lastChatAt: string
  nextFollowUpAt: string
}

/* ─── Constants ─────────────────────────────────── */

const CONVERSATIONS_KEY = 'lanlaoban_ip_conversations'
const ACTIVE_CONV_KEY = 'lanlaoban_ip_active_id'
const IP_PROFILE_KEY = 'lanlaoban_ip_profile'

const FOLLOW_UP_QUESTIONS = [
  '最近生意怎么样？有没有什么新鲜事想分享？',
  '上次聊的那个产品方向，你试了没有？',
  '有没有遇到什么瓶颈？说出来我帮你分析',
  '你最近的客户都是什么类型的？他们的反馈怎么样？',
  '有没有想过拓展新渠道？我帮你看看有什么机会',
]

const QUICK_ACTIONS = [
  { icon: FiStar, label: '讲你的创业故事', prompt: '给我讲讲你的创业/开店经历吧，我想了解你的故事' },
  { icon: FiTarget, label: '分析你的目标客户', prompt: '帮我分析一下我的目标客户应该是什么样的人' },
  { icon: FiCamera, label: '生成短视频脚本', prompt: '请为我生成一条专业的2分钟短视频脚本。要求：1. 开场前3秒必须有强钩子抓住注意力 2. 分6-8段，每段标注时间戳、画面描述、台词、拍摄机位 3. 台词要口语化，像是真人说话 4. 结尾要有明确的号召行动 5. 总共大约250-350字台词 6. 每段都要标注拍摄角度和景别' },
  { icon: FiDollarSign, label: '评估商业模式', prompt: '帮我看一下我的商业模式有什么可以优化的' },
  { icon: FiGlobe, label: '市场机会分析', prompt: '帮我分析一下我所在的行业有什么新机会' },
  { icon: FiTrendingUp, label: '内容策略建议', prompt: '帮我规划一下接下来一个月的内容发布策略' },
]

const SHOP_INDUSTRIES = ['餐饮美食','服装时尚','数码科技','家居生活','教育培训','美妆个护','宠物','运动户外','母婴亲子','其他']

const INDUSTRIES = ['餐饮美食','服装时尚','数码科技','家居生活','教育培训','美妆个护','宠物','运动户外','母婴亲子','其他']
const DEFAULT_PROFILE: IpProfileData = {
  name: '', industry: '', experience: '', targetAudience: '',
  originStory: '', achievements: [], keyEvents: [], contentIdeas: [],
  videoCount: 0, followUpCount: 0, lastChatAt: '', nextFollowUpAt: '',
}

/* ─── Helpers ───────────────────────────────────── */

let idCounter = 0
function genId(): string { idCounter += 1; return `msg_${Date.now()}_${idCounter}` }
function genConvId(): string { return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }

function formatTime(ts: number): string {
  const d = new Date(ts); const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function saveToLS(key: string, data: any) { try { localStorage.setItem(key, JSON.stringify(data)) } catch {} }
function loadFromLS<T>(key: string, fallback: T): T { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback } catch { return fallback } }

/* ═══════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════ */

export default function IpMaterialHub() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('chat')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<IpProfileData>(DEFAULT_PROFILE)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load data
  useEffect(() => {
    const convs = loadFromLS<Conversation[]>(CONVERSATIONS_KEY, [])
    setConversations(convs)
    const prof = loadFromLS<IpProfileData>(IP_PROFILE_KEY, DEFAULT_PROFILE)
    setProfile(prof)
    const active = loadFromLS<string | null>(ACTIVE_CONV_KEY, null)
    if (active) {
      setActiveId(active)
      const found = convs.find(c => c.id === active)
      if (found) setMessages(found.messages)
    }
    if (convs.length > 0) setShowWelcome(false)
  }, [])

  // Save
  const persist = useCallback((convs: Conversation[]) => {
    setConversations(convs); saveToLS(CONVERSATIONS_KEY, convs)
  }, [])
  useEffect(() => { saveToLS(ACTIVE_CONV_KEY, activeId) }, [activeId])
  useEffect(() => { saveToLS(IP_PROFILE_KEY, profile) }, [profile])

  // Update conversation messages
  useEffect(() => {
    if (!activeId) return
    const conv = conversations.find(c => c.id === activeId)
    const firstUserMsg = messages.find(m => m.role === 'user')
    const title = firstUserMsg
      ? (firstUserMsg.content.length > 18 ? firstUserMsg.content.slice(0, 16) + '...' : firstUserMsg.content)
      : '新对话'
    const updated = conversations.map(c =>
      c.id === activeId
        ? { ...c, messages, updatedAt: Date.now(), title,
            lastMessage: messages.filter(m => m.role === 'assistant').pop()?.content?.slice(0, 40) }
        : c
    )
    persist(updated)
  }, [messages])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const newConversation = () => {
    const id = genConvId()
    const conv: Conversation = {
      id, title: '新对话', messages: [], createdAt: Date.now(), updatedAt: Date.now(),
    }
    persist([conv, ...conversations])
    setActiveId(id)
    setMessages([])
    setSidebarOpen(false)
    setShowFollowUp(false)
  }

  const switchConv = (conv: Conversation) => {
    setActiveId(conv.id)
    setMessages(conv.messages)
    setSidebarOpen(false)
    setShowFollowUp(false)
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    setShowFollowUp(false)

    if (!activeId) {
      const id = genConvId()
      const conv: Conversation = {
        id, title: '新对话', messages: [], createdAt: Date.now(), updatedAt: Date.now(),
      }
      setActiveId(id)
      const updated = [conv, ...conversations]
      setConversations(updated)
      saveToLS(CONVERSATIONS_KEY, updated)
    }

    const userMsg: ChatMessage = { id: genId(), role: 'user', content: text, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Auto-update profile from chat
    const p = { ...profile }
    if (text.includes('做') && (text.includes('生意') || text.includes('开店') || text.includes('创业'))) {
      const match = text.match(/(?:做|卖|搞)(.{1,20})的/);
      if (match && !p.industry) p.industry = match[1]
    }
    if (p.industry && !p.name) {
      const nameMatch = text.match(/(?:我叫|我是|我开|我搞)(.{1,10})/)
      if (nameMatch) p.name = nameMatch[1]
    }
    setProfile(p)

    // Build context from profile
    const contextParts = []
    if (p.name) contextParts.push(`用户品牌/名称：${p.name}`)
    if (p.industry) contextParts.push(`行业：${p.industry}`)
    if (p.experience) contextParts.push(`经历：${p.experience}`)
    if (p.targetAudience) contextParts.push(`目标人群：${p.targetAudience}`)
    if (p.originStory) contextParts.push(`创业故事：${p.originStory}`)
    const contextStr = contextParts.length > 0 ? `\n\n关于用户的已知信息：\n${contextParts.join('\n')}` : ''

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          context: contextStr,
        }),
      })
      const json = await res.json()
      const reply = json?.data?.reply || '抱歉，我现在有点卡壳，换个问题再试试？'
      const assistMsg: ChatMessage = { id: genId(), role: 'assistant', content: reply, timestamp: Date.now() }
      setMessages(prev => [...prev, assistMsg])

      // Update follow-up count
      setProfile(prev => ({ ...prev, followUpCount: (prev.followUpCount || 0) + 1, lastChatAt: new Date().toISOString() }))

      // Auto-suggest follow-up after 3 turns
      const userTurns = messages.filter(m => m.role === 'user').length
      if (userTurns > 0 && userTurns % 3 === 0) {
        setTimeout(() => setShowFollowUp(true), 1000)
      }

    } catch {
      setMessages(prev => [...prev, { id: genId(), role: 'assistant', content: '网络开小差了，稍后再试试 ', timestamp: Date.now() }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, activeId, conversations, messages, profile])

  const handleSend = () => { sendMessage(input) }
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSend() }

  // Follow-up question
  const triggerFollowUp = () => {
    const q = FOLLOW_UP_QUESTIONS[Math.floor(Math.random() * FOLLOW_UP_QUESTIONS.length)]
    setInput(q)
    inputRef.current?.focus()
  }

  // Quick action
  const [shopGenerating, setShopGenerating] = useState(false)
  
  const generateShop = async () => {
    setShopGenerating(true)
    try {
      const res = await fetch('/api/shop/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: profile.industry || '综合',
          brandName: profile.name || '我的小店',
          productName: '',
          sellPoints: profile.contentIdeas?.join(',') || '品质保证',
          story: profile.originStory || `${profile.name || '我'}在${profile.industry || '这个行业'}深耕多年`,
          name: profile.name || '',
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        sessionStorage.setItem('lanlaoban_my_shop', JSON.stringify(json.data))
        router.push(`/myshop/${json.data.id}`)
      } else {
        window.alert('生成失败，请重试')
      }
    } catch {
      window.alert('网络异常，请重试')
    } finally {
      setShopGenerating(false)
    }
  }

  const handleQuickAction = (prompt: string) => {
    const p = prompt
      .replace('我的', profile.industry || '我的')
      .replace('给我分享', profile.name ? `跟${profile.name}分享` : `跟我分享`)
    sendMessage(p)
  }

  const clearProfile = () => { setProfile(DEFAULT_PROFILE); saveToLS(IP_PROFILE_KEY, DEFAULT_PROFILE) }

  // Profile completeness
  const profileFields = [
    { key: 'industry', label: '行业', filled: !!profile.industry },
    { key: 'experience', label: '从业经历', filled: !!profile.experience },
    { key: 'targetAudience', label: '目标人群', filled: !!profile.targetAudience },
    { key: 'originStory', label: '创业故事', filled: !!profile.originStory },
  ] as const
  const profilePercent = Math.round(profileFields.filter(f => f.filled).length / profileFields.length * 100)

  const activeConv = conversations.find(c => c.id === activeId)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-3">
        <Breadcrumb items={[
          { label: '懒老板', href: '/' },
          { label: 'AI IP素材库' },
        ]} />
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 flex gap-4 px-4 sm:px-6 pb-6">
        {/* ─── Tab Bar (Mobile) ─── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex sm:hidden">
          {[
            { k: 'chat' as Tab, l: '对话', badge: showFollowUp ? '新' : '' },
            { k: 'profile' as Tab, l: '档案', badge: `${profilePercent}%` },
            { k: 'materials' as Tab, l: '素材', badge: `${profile.videoCount || 0}` },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`flex-1 py-2.5 text-center text-xs font-medium ${tab === t.k ? 'text-white' : 'text-gray-400'}`}
              style={tab === t.k ? { background: 'linear-gradient(135deg, #FF6034, #8B5CF6)' } : {}}>
              {t.l}
              {t.badge && <span className="ml-1 text-[10px] opacity-70">({t.badge})</span>}
            </button>
          ))}
        </div>

        {/* ─── Sidebar (Chat History) ─── */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} sm:block w-56 lg:w-64 shrink-0`}>
          <div className="card overflow-hidden !p-0 sm:sticky sm:top-20">
            <div className="p-3 border-b border-gray-50">
              <button onClick={newConversation}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FF6034' }}>
                <FiPlus className="h-4 w-4" /> 新对话
              </button>
            </div>
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">暂无历史对话</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {conversations.map(conv => (
                    <button key={conv.id} onClick={() => switchConv(conv)}
                      className={`w-full text-left px-3 py-3 transition-colors hover:bg-gray-50 ${activeId === conv.id ? 'bg-brand-50' : ''}`}>
                      <div className="flex items-start gap-2">
                        <FiMessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-gray-700">{conv.title}</p>
                          {conv.lastMessage && <p className="truncate text-[10px] text-gray-400 mt-0.5">{conv.lastMessage}</p>}
                          <p className="text-[10px] text-gray-400 mt-0.5">{formatTime(conv.updatedAt)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Main Content ─── */}
        <div className="flex-1 min-w-0 max-w-3xl">

          {/* Mobile actions */}
          <div className="mb-3 flex sm:hidden items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500">
              <FiMessageSquare className="h-3.5 w-3.5" /> 历史
            </button>
            <button onClick={newConversation}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500">
              <FiPlus className="h-3.5 w-3.5" /> 新对话
            </button>
          </div>

          {/* ═══ CHAT TAB ═══ */}
          {tab === 'chat' && (
            <>
              {/* Welcome / Profile Status */}
              {showWelcome && conversations.length === 0 && (
                <div className="mb-4 card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: '#FFF0EB' }}>
                      <FiZap className="h-6 w-6" style={{ color: '#FF6034' }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">你的 IP 素材库</h2>
                      <p className="text-xs text-gray-400">聊得越多，AI越了解你，生成的脚本越精准</p>
                    </div>
                  </div>

                  {/* Profile completeness bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-700">IP完整度</span>
                      <span className="text-xs font-semibold" style={{ color: profilePercent >= 75 ? '#10B981' : profilePercent >= 50 ? '#F59E0B' : '#FF6034' }}>{profilePercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full transition-all bg-gradient-to-r from-brand-400 via-purple-500 to-green-500 animate-gradient-x" style={{ width: `${profilePercent}%` }} />
                    </div>
                    <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
                      {profileFields.map(f => (
                        <span key={f.key} className={`flex items-center gap-0.5 ${f.filled ? 'text-green-600' : 'text-gray-400'}`}>
                          <FiCheck className={`h-3 w-3 ${f.filled ? 'text-green-500' : 'text-gray-300'}`} />
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-2 gap-2">
                    {profilePercent >= 25 && (
                      <button onClick={generateShop} disabled={shopGenerating}
                        className="btn-ai col-span-2 text-xs disabled:opacity-50">
                        <FiZap className="h-4 w-4 shrink-0" />
                        <span className="text-left">{shopGenerating ? '生成中...' : '一键生成独立站'}</span>
                      </button>
                    )}
                    {QUICK_ACTIONS.map((action, i) => {
                      const Icon = action.icon
                      return (
                        <button key={i} onClick={() => handleQuickAction(action.prompt)}
                          className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-xs text-gray-700 hover:border-brand-100 hover:bg-brand-50 transition-all">
                          <Icon className="h-4 w-4 shrink-0" style={{ color: '#FF6034' }} />
                          <span className="text-left">{action.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Profile reminder (when not complete) */}
              {!showWelcome && profilePercent < 100 && profilePercent > 0 && (
                <div className="mb-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiAlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-amber-700">IP完整度 {profilePercent}% — <button onClick={() => setTab('profile')} className="font-semibold underline">补全资料</button>让AI更懂你</span>
                    </div>
                    {showFollowUp && (
                      <button onClick={triggerFollowUp} className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold text-amber-700">
                        定时跟进
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Chat Area */}
          <div className="flex-1 rounded-xl border border-gray-100 bg-white shadow-apple">
                <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#FFF0EB' }}>
                        <FiZap className="h-6 w-6" style={{ color: '#FF6034' }} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">开始你的 IP 之旅</p>
                      <p className="text-xs text-gray-400 mb-4 max-w-sm">告诉我你的行业、经历、目标——聊得越细，AI越懂你</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          { label: '我是餐饮老板', val: '我开了一家川菜馆，开了3年，想打造个人IP' },
                          { label: '我在做跨境电商', val: '我在Shopee上卖家居用品，想拓展TikTok' },
                          { label: '我是手艺人', val: '我是做手工皮具的，想通过短视频获客' },
                          { label: '我是工厂老板', val: '我有个小工厂做电子配件，想找海外客户' },
                        ].map(tag => (
                          <button key={tag.label} onClick={() => sendMessage(tag.val)}
                            className="rounded-full border border-brand-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-brand-300 hover:text-brand-400"
                            style={{ borderColor: '#FFD6C8' }}>
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {messages.map(msg => (
                        <div key={msg.id}>
                          {msg.role === 'user' ? (
                            <div className="flex justify-end px-4 py-3">
                              <div className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #FF6034, #8B5CF6)' }}>
                                <p>{msg.content}</p>
                                <p className="mt-1 text-right text-[10px] opacity-60">{formatTime(msg.timestamp)}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="px-4 py-4">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #FF6034, #8B5CF6)' }}>AI</div>
                                <div className="min-w-0 flex-1 rounded-2xl bg-white px-4 py-3 shadow-apple">
                                  <div className="prose prose-sm max-w-none text-gray-700">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                  </div>
                                  <p className="mt-1 text-[10px] text-gray-400">{formatTime(msg.timestamp)}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Follow-up suggestion */}
                      {showFollowUp && (
                        <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FiRefreshCw className="h-3.5 w-3.5 text-amber-500" />
                              <span className="text-xs text-amber-700">聊得不错！要不要来个定时跟进？</span>
                            </div>
                            <button onClick={triggerFollowUp}
                              className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold text-amber-700">好的，问我吧</button>
                          </div>
                        </div>
                      )}

                      {loading && (
                        <div className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full text-white text-[10px] font-bold" style={{ backgroundColor: '#FF6034' }}>AI</div>
                            <div className="flex items-center gap-1.5 bg-gray-100 rounded-2xl px-4 py-3">
                              <span className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: '#FF6034', animationDelay: '0ms' }} />
                              <span className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: '#FF6034', animationDelay: '150ms' }} />
                              <span className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: '#FF6034', animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-gray-50 p-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition-all duration-200 focus-within:border-brand-400 focus-within:shadow-ai-glow">
                    <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="聊聊你的生意、经历、目标..."
                      disabled={loading}
                      className="flex-1 border-none bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400" />
                    <button onClick={handleSend} disabled={loading || !input.trim()}
                      className="flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#FF6034' }}>
                      <FiSend className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Link to video generator */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>聊完了试试 <Link href="/ai-video" className="text-brand-400 font-semibold hover:underline">AI一键生成短视频脚本 →</Link></span>
                {activeConv && (
                  <button onClick={() => {
                    setMessages([])
                    const updated = conversations.map(c => c.id === activeId ? { ...c, messages: [], updatedAt: Date.now(), title: '新对话' } : c)
                    persist(updated)
                  }} className="text-gray-400 hover:text-gray-600">清空对话</button>
                )}
              </div>
            </>
          )}

          {/* ═══ PROFILE TAB ═══ */}
          {tab === 'profile' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">IP 档案</h2>
                <div className="flex gap-2">
                  <button onClick={() => setEditingProfile(!editingProfile)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    {editingProfile ? '完成' : '编辑'}
                  </button>
                  <button onClick={clearProfile} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-50">重置</button>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">品牌/店铺名称</label>
                  <input disabled={!editingProfile} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    placeholder="你的品牌或店名"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">行业</label>
                  {editingProfile ? (
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRIES.map(ind => (
                        <button key={ind} onClick={() => setProfile(p => ({ ...p, industry: ind }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${profile.industry === ind ? 'text-white' : 'text-gray-600 border-gray-200 hover:border-brand-200'}`}
                          style={profile.industry === ind ? { backgroundColor: '#FF6034', borderColor: '#FF6034' } : {}}>
                          {ind}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">{profile.industry || '未设置（通过聊天自动采集）'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">从业经历</label>
                  <textarea disabled={!editingProfile} value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))}
                    placeholder="做了多久？之前是做什么的？"
                    rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400 resize-none focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">目标人群</label>
                  <input disabled={!editingProfile} value={profile.targetAudience} onChange={e => setProfile(p => ({ ...p, targetAudience: e.target.value }))}
                    placeholder="你的客户是什么样的人？"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">创业/品牌故事</label>
                  <textarea disabled={!editingProfile} value={profile.originStory} onChange={e => setProfile(p => ({ ...p, originStory: e.target.value }))}
                    placeholder="当初为什么开始做这个？有什么故事？"
                    rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400 resize-none focus:outline-none focus:border-brand-400" />
                </div>
              </div>

              {/* Quick fill from chat */}
              {profile.industry && !editingProfile && (
                <div className="mt-6 rounded-lg bg-brand-50 p-4">
                  <p className="text-xs font-semibold text-brand-700 mb-2">AI自动采集到以下信息</p>
                  <div className="space-y-1 text-xs text-brand-600">
                    {profile.name && <p>• 品牌/名称：{profile.name}</p>}
                    {profile.industry && <p>• 行业：{profile.industry}</p>}
                    {profile.experience && <p>• 经历：{profile.experience}</p>}
                    {profile.originStory && <p>• 故事：已采集</p>}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{profile.videoCount || 0}</p>
                  <p className="text-[10px] text-gray-400">生成视频</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{profile.followUpCount || 0}</p>
                  <p className="text-[10px] text-gray-400">AI跟进次数</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{profilePercent}%</p>
                  <p className="text-[10px] text-gray-400">IP完整度</p>
                </div>
              </div>

              {/* Go generate video */}
              <div className="mt-6 rounded-xl p-4 text-center" style={{ background: 'linear-gradient(135deg, #FFF5F0, #FFE4D6)' }}>
                <p className="text-sm font-semibold text-gray-900">档案完善了？用AI生成一条短视频脚本吧</p>
                <Link href="/ai-video" className="mt-2 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: '#FF6034' }}>
                  <FiCamera className="h-4 w-4" /> 去生成短视频
                </Link>
              </div>
            </div>
          )}

          {/* ═══ MATERIALS TAB ═══ */}
          {tab === 'materials' && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">内容素材库</h2>

              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <Link href="/ai-video" className="rounded-xl border border-gray-100 bg-gradient-to-br from-orange-50 to-amber-50 p-5 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white"><FiCamera className="h-5 w-5" style={{ color: '#FF6034' }} /></div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">AI 一键生成短视频</p>
                      <p className="text-xs text-gray-400">填写信息，AI自动出脚本</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">5 种视频类型 × 7 段精编 × 2 分钟</p>
                </Link>

                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white"><FiBook className="h-5 w-5" style={{ color: '#3B82F6' }} /></div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">对话素材</p>
                      <p className="text-xs text-gray-400">从聊天中自动提取</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {profile.originStory && <p className="text-xs text-gray-500"><FiCheck className="inline h-3 w-3 text-green-500 mr-0.5" /> 创业故事已采集</p>}
                    {profile.experience && <p className="text-xs text-gray-500"><FiCheck className="inline h-3 w-3 text-green-500 mr-0.5" /> 从业经历已采集</p>}
                    {profile.industry && <p className="text-xs text-gray-500"><FiCheck className="inline h-3 w-3 text-green-500 mr-0.5" /> 行业信息已采集</p>}
                    {!profile.originStory && !profile.experience && <p className="text-xs text-gray-400">去聊天吧，AI会自动采集你的素材</p>}
                  </div>
                </div>
              </div>

              {/* Recent conversations as material */}
              <h3 className="text-sm font-semibold text-gray-900 mb-3">最近对话</h3>
              {conversations.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">还没有对话记录，开始聊天吧</p>
              ) : (
                <div className="space-y-2">
                  {conversations.slice(0, 5).map(conv => (
                    <button key={conv.id} onClick={() => { switchConv(conv); setTab('chat') }}
                      className="w-full text-left rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700 truncate">{conv.title}</p>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">{formatTime(conv.updatedAt)}</span>
                      </div>
                      {conv.lastMessage && <p className="text-xs text-gray-400 line-clamp-1">{conv.lastMessage}</p>}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 text-center">
                <button onClick={() => { newConversation(); setTab('chat') }}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: '#FF6034' }}>
                  <FiPlus className="h-4 w-4" /> 开始新对话
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
