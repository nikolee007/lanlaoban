'use client'
import Link from 'next/link'
import { FiCamera, FiBook, FiCheck, FiPlus } from 'react-icons/fi'
import type { IpProfileData, Conversation } from '../types'
import { formatTime } from '../utils'

interface MaterialsPanelProps {
  profile: IpProfileData
  conversations: Conversation[]
  onSwitchConv: (conv: Conversation) => void
  onNewConversation: () => void
}

export default function MaterialsPanel({ profile, conversations, onSwitchConv, onNewConversation }: MaterialsPanelProps) {
  return (
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
            <button key={conv.id} onClick={() => { onSwitchConv(conv) }}
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
        <button onClick={onNewConversation}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: '#FF6034' }}>
          <FiPlus className="h-4 w-4" /> 开始新对话
        </button>
      </div>
    </div>
  )
}
