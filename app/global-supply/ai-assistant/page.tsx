'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Breadcrumb from '../../components/Breadcrumb'
import { FiMessageSquare, FiPlus } from 'react-icons/fi'
import type { Tab, ChatMessage, Conversation, IpProfileData } from './types'
import {
  CONVERSATIONS_KEY, ACTIVE_CONV_KEY, IP_PROFILE_KEY,
  FOLLOW_UP_QUESTIONS, DEFAULT_PROFILE,
} from './constants'
import { genId, genConvId, saveToLS, loadFromLS } from './utils'
import MobileTabBar from './components/MobileTabBar'
import ChatSidebar from './components/ChatSidebar'
import ChatWindow from './components/ChatWindow'
import ProfilePanel from './components/ProfilePanel'
import MaterialsPanel from './components/MaterialsPanel'

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
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, context: contextStr }),
      })
      const json = await res.json()
      const reply = json?.data?.reply || '抱歉，我现在有点卡壳，换个问题再试试？'
      setMessages(prev => [...prev, {
        id: genId(), role: 'assistant', content: reply, timestamp: Date.now(),
      }])
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
  }, [loading, activeId, conversations, messages, profile, persist])

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
    </div>
  )
}
