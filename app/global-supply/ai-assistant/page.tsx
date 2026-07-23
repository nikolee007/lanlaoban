'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '../../components/Breadcrumb'
import { FiMessageSquare, FiPlus, FiX, FiUserPlus, FiZap } from 'react-icons/fi'
import type { Tab, ChatMessage, Conversation, IpProfileData } from './types'
import {
  CONVERSATIONS_KEY, ACTIVE_CONV_KEY, IP_PROFILE_KEY,
  FOLLOW_UP_QUESTIONS, DEFAULT_PROFILE, ANONYMOUS_COUNT_KEY,
} from './constants'
import { genId, genConvId, saveToLS, loadFromLS } from './utils'
import MobileTabBar from './components/MobileTabBar'
import ChatSidebar from './components/ChatSidebar'
import ChatWindow from './components/ChatWindow'
import ProfilePanel from './components/ProfilePanel'
import MaterialsPanel from './components/MaterialsPanel'

const ANONYMOUS_LIMIT = 3

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
  const [shopGenerating, setShopGenerating] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [remainingQuota, setRemainingQuota] = useState(ANONYMOUS_LIMIT)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem('lanlaoban_token')
    setIsAuthenticated(!!token)
    if (!token) {
      const used = loadFromLS<number>(ANONYMOUS_COUNT_KEY, 0)
      setRemainingQuota(Math.max(0, ANONYMOUS_LIMIT - used))
    }
  }, [])

  // Load data
  useEffect(() => {
    const convs = loadFromLS<Conversation[]>(CONVERSATIONS_KEY, [])
    setConversations(convs)
    setProfile(loadFromLS<IpProfileData>(IP_PROFILE_KEY, DEFAULT_PROFILE))
    const active = loadFromLS<string | null>(ACTIVE_CONV_KEY, null)
    if (active) {
      setActiveId(active)
      const found = convs.find(c => c.id === active)
      if (found) setMessages(found.messages)
    }
    if (convs.length > 0) setShowWelcome(false)
  }, [])

  // Load data
  useEffect(() => {
    const convs = loadFromLS<Conversation[]>(CONVERSATIONS_KEY, [])
    setConversations(convs)
    setProfile(loadFromLS<IpProfileData>(IP_PROFILE_KEY, DEFAULT_PROFILE))
    const active = loadFromLS<string | null>(ACTIVE_CONV_KEY, null)
    if (active) {
      setActiveId(active)
      const found = convs.find(c => c.id === active)
      if (found) setMessages(found.messages)
    }
    if (convs.length > 0) setShowWelcome(false)
  }, [])

  // Persist
  const persist = useCallback((convs: Conversation[]) => {
    setConversations(convs); saveToLS(CONVERSATIONS_KEY, convs)
  }, [])
  useEffect(() => { saveToLS(ACTIVE_CONV_KEY, activeId) }, [activeId])
  useEffect(() => { saveToLS(IP_PROFILE_KEY, profile) }, [profile])

  // Update conversation messages
  useEffect(() => {
    if (!activeId) return
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
    const conv: Conversation = {
      id: genConvId(), title: '新对话', messages: [],
      createdAt: Date.now(), updatedAt: Date.now(),
    }
    persist([conv, ...conversations])
    setActiveId(conv.id)
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

    // Check auth limit before sending
    if (!isAuthenticated) {
      const used = loadFromLS<number>(ANONYMOUS_COUNT_KEY, 0)
      if (used >= ANONYMOUS_LIMIT) {
        setShowAuthModal(true)
        return
      }
    }

    if (!activeId) {
      const conv: Conversation = {
        id: genConvId(), title: '新对话', messages: [],
        createdAt: Date.now(), updatedAt: Date.now(),
      }
      setActiveId(conv.id)
      persist([conv, ...conversations])
    }

    const userMsg: ChatMessage = { id: genId(), role: 'user', content: text, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Auto-update profile from chat
    const p = { ...profile }
    if (text.includes('做') && (text.includes('生意') || text.includes('开店') || text.includes('创业'))) {
      const match = text.match(/(?:做|卖|搞)(.{1,20})的/)
      if (match && !p.industry) p.industry = match[1]
    }
    if (p.industry && !p.name) {
      const nm = text.match(/(?:我叫|我是|我开|我搞)(.{1,10})/)
      if (nm) p.name = nm[1]
    }
    setProfile(p)

    // Build context from profile
    const ctx: string[] = []
    if (p.name) ctx.push(`用户品牌/名称：${p.name}`)
    if (p.industry) ctx.push(`行业：${p.industry}`)
    if (p.experience) ctx.push(`经历：${p.experience}`)
    if (p.targetAudience) ctx.push(`目标人群：${p.targetAudience}`)
    if (p.originStory) ctx.push(`创业故事：${p.originStory}`)
    const contextStr = ctx.length > 0
      ? `\n\n关于用户的已知信息：\n${ctx.join('\n')}`
      : ''

    try {
      // Track anonymous usage and build auth headers
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const token = localStorage.getItem('lanlaoban_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      } else {
        const used = loadFromLS<number>(ANONYMOUS_COUNT_KEY, 0)
        headers['x-anonymous-count'] = String(used)
        saveToLS(ANONYMOUS_COUNT_KEY, used + 1)
      }

      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, history, context: contextStr }),
      })

      // Handle auth errors
      if (res.status === 401) {
        const errData = await res.json().catch(() => ({}))
        if (errData.error === 'free_limit') {
          setShowAuthModal(true)
          setNeedsAuth(true)
          setMessages(prev => [...prev, {
            id: genId(), role: 'assistant',
            content: '💡 你已经体验了3次免费对话！注册懒老板即可继续使用所有AI功能，还能解锁更多创业工具。',
            timestamp: Date.now(),
          }])
        } else {
          setMessages(prev => [...prev, {
            id: genId(), role: 'assistant',
            content: errData.message || '请先登录后再使用AI助手',
            timestamp: Date.now(),
          }])
        }
        setLoading(false)
        return
      }

      const json = await res.json()
      const reply = json?.data?.reply || '抱歉，我现在有点卡壳，换个问题再试试？'
      const msgs: ChatMessage[] = [{ id: genId(), role: 'assistant', content: reply, timestamp: Date.now() }]

      // Add registration prompt for anonymous users
      if (!token && json.needsAuth && json.remainingQuota !== undefined && json.remainingQuota <= 0) {
        msgs.push({
          id: genId(), role: 'assistant',
          content: '💡 免费次数已用完，注册懒老板解锁无限对话 + 全部AI工具 → ',
          timestamp: Date.now(),
        })
        setNeedsAuth(true)
      } else if (!token && json.needsAuth && json.remainingQuota !== undefined && json.remainingQuota <= 1) {
        msgs[0] = {
          ...msgs[0],
          content: reply + '\n\n---\n💡 还剩' + json.remainingQuota + '次免费对话，注册懒老板可无限使用',
        }
      }

      setMessages(prev => [...prev, ...msgs])
      if (json.remainingQuota !== undefined) {
        setRemainingQuota(json.remainingQuota)
      }
      setProfile(prev => ({
        ...prev,
        followUpCount: (prev.followUpCount || 0) + 1,
        lastChatAt: new Date().toISOString(),
      }))
      const userMsgCount = messages.filter(m => m.role === 'user').length
      if (userMsgCount > 0 && (userMsgCount + 1) % 3 === 0) {
        setTimeout(() => setShowFollowUp(true), 1000)
      }
    } catch {
      setMessages(prev => [...prev, {
        id: genId(), role: 'assistant',
        content: '网络开小差了，稍后再试试 ',
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }, [loading, activeId, conversations, messages, profile, persist, isAuthenticated])

  const handleSend = () => { sendMessage(input) }
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSend() }

  const triggerFollowUp = () => {
    const q = FOLLOW_UP_QUESTIONS[Math.floor(Math.random() * FOLLOW_UP_QUESTIONS.length)]
    setInput(q)
    inputRef.current?.focus()
  }

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

  const clearChat = () => {
    if (!activeId) return
    setMessages([])
    const updated = conversations.map(c =>
      c.id === activeId
        ? { ...c, messages: [], updatedAt: Date.now(), title: '新对话' }
        : c
    )
    persist(updated)
  }

  const clearProfile = () => {
    setProfile(DEFAULT_PROFILE)
    saveToLS(IP_PROFILE_KEY, DEFAULT_PROFILE)
  }

  // Profile completeness
  const profileFields = [
    { key: 'industry', label: '行业', filled: !!profile.industry },
    { key: 'experience', label: '从业经历', filled: !!profile.experience },
    { key: 'targetAudience', label: '目标人群', filled: !!profile.targetAudience },
    { key: 'originStory', label: '创业故事', filled: !!profile.originStory },
  ] as const
  const profilePercent = Math.round(
    profileFields.filter(f => f.filled).length / profileFields.length * 100
  )

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
        <MobileTabBar
          tab={tab}
          onTabChange={setTab}
          showFollowUp={showFollowUp}
          profilePercent={profilePercent}
          videoCount={profile.videoCount || 0}
        />

        <div className={`${sidebarOpen ? 'block' : 'hidden'} sm:block w-56 lg:w-64 shrink-0`}>
          <ChatSidebar
            conversations={conversations}
            activeId={activeId}
            onNewConversation={newConversation}
            onSwitchConv={switchConv}
          />
        </div>

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
            <ChatWindow
              messages={messages}
              input={input}
              loading={loading}
              showWelcome={showWelcome}
              showFollowUp={showFollowUp}
              conversations={conversations}
              activeConv={activeConv}
              profile={profile}
              profilePercent={profilePercent}
              profileFields={profileFields}
              shopGenerating={shopGenerating}
              inputRef={inputRef}
              chatEndRef={chatEndRef}
              onInputChange={setInput}
              onSend={handleSend}
              onKeyDown={handleKeyDown}
              onQuickAction={handleQuickAction}
              onGenerateShop={generateShop}
              onClearChat={clearChat}
              onTriggerFollowUp={triggerFollowUp}
              onGoToProfile={() => setTab('profile')}
              onSendMessage={sendMessage}
            />
          )}

          {/* ═══ PROFILE TAB ═══ */}
          {tab === 'profile' && (
            <ProfilePanel
              profile={profile}
              editingProfile={editingProfile}
              profilePercent={profilePercent}
              onToggleEditing={() => setEditingProfile(!editingProfile)}
              onClearProfile={clearProfile}
              onProfileChange={(updater) => setProfile(updater)}
            />
          )}

          {/* ═══ MATERIALS TAB ═══ */}
          {tab === 'materials' && (
            <MaterialsPanel
              profile={profile}
              conversations={conversations}
              onSwitchConv={(conv) => { switchConv(conv); setTab('chat') }}
              onNewConversation={() => { newConversation(); setTab('chat') }}
            />
          )}
        </div>
      </div>

      {/* ═══ Registration Modal ═══ */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6034]/20 to-[#FF6034]/5 flex items-center justify-center border border-[#FF6034]/10">
                <FiUserPlus className="w-7 h-7 text-[#FF6034]" />
              </div>
              <h3 className="text-xl font-bold mb-2">注册懒老板</h3>
              <p className="text-sm text-gray-500 mb-6">
                免费试用已用完，注册后解锁全部功能：
              </p>
              <ul className="text-left space-y-2 mb-6">
                {[
                  '无限AI对话 · IP策划 · 短视频脚本',
                  '品牌宣传片智能制作',
                  '全球供应链资源对接',
                  '多语言·多画幅内容衍生',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <FiZap className="w-4 h-4 text-[#FF6034] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full text-center rounded-full bg-gradient-to-r from-[#FF6034] to-[#FF8A66] text-white px-6 py-3 text-sm font-semibold hover:shadow-lg hover:shadow-[#FF6034]/20 transition-all"
                >
                  立即注册 / 登录
                </Link>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="block w-full text-center rounded-full border border-gray-200 px-6 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-all"
                >
                  再想想
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
