'use client'
import Link from 'next/link'
import { FiZap, FiCheck, FiAlertCircle, FiRefreshCw, FiSend } from 'react-icons/fi'
import type { ChatMessage, Conversation, IpProfileData } from '../types'
import { QUICK_ACTIONS } from '../constants'
import MessageBubble from './MessageBubble'

interface ChatWindowProps {
  messages: ChatMessage[]
  input: string
  loading: boolean
  showWelcome: boolean
  showFollowUp: boolean
  conversations: Conversation[]
  activeConv: Conversation | undefined
  profile: IpProfileData
  profilePercent: number
  profileFields: readonly { key: string; label: string; filled: boolean }[]
  shopGenerating: boolean
  inputRef: React.RefObject<HTMLInputElement>
  chatEndRef: React.RefObject<HTMLDivElement>
  onInputChange: (v: string) => void
  onSend: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onQuickAction: (prompt: string) => void
  onGenerateShop: () => void
  onClearChat: () => void
  onTriggerFollowUp: () => void
  onGoToProfile: () => void
  onSendMessage: (text: string) => void
}

export default function ChatWindow({
  messages, input, loading, showWelcome, showFollowUp,
  conversations, activeConv, profile, profilePercent,
  profileFields, shopGenerating, inputRef, chatEndRef,
  onInputChange, onSend, onKeyDown, onQuickAction,
  onGenerateShop, onClearChat, onTriggerFollowUp,
  onGoToProfile, onSendMessage,
}: ChatWindowProps) {
  return (
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
              <button onClick={onGenerateShop} disabled={shopGenerating}
                className="btn-ai col-span-2 text-xs disabled:opacity-50">
                <FiZap className="h-4 w-4 shrink-0" />
                <span className="text-left">{shopGenerating ? '生成中...' : '一键生成独立站'}</span>
              </button>
            )}
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon
              return (
                <button key={i} onClick={() => onQuickAction(action.prompt)}
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
              <span className="text-xs text-amber-700">IP完整度 {profilePercent}% — <button onClick={onGoToProfile} className="font-semibold underline">补全资料</button>让AI更懂你</span>
            </div>
            {showFollowUp && (
              <button onClick={onTriggerFollowUp} className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold text-amber-700">
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
                  <button key={tag.label} onClick={() => onSendMessage(tag.val)}
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
                  <MessageBubble message={msg} />
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
                    <button onClick={onTriggerFollowUp}
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
            <input ref={inputRef} type="text" value={input} onChange={e => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="聊聊你的生意、经历、目标..."
              disabled={loading}
              className="flex-1 border-none bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400" />
            <button onClick={onSend} disabled={loading || !input.trim()}
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
          <button onClick={onClearChat} className="text-gray-400 hover:text-gray-600">清空对话</button>
        )}
      </div>
    </>
  )
}
