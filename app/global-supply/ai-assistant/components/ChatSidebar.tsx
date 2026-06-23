'use client'
import { FiPlus, FiMessageSquare } from 'react-icons/fi'
import type { Conversation } from '../types'
import { formatTime } from '../utils'

interface ChatSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onNewConversation: () => void
  onSwitchConv: (conv: Conversation) => void
}

export default function ChatSidebar({ conversations, activeId, onNewConversation, onSwitchConv }: ChatSidebarProps) {
  return (
    <div className="card overflow-hidden !p-0 sm:sticky sm:top-20">
      <div className="p-3 border-b border-gray-50">
        <button onClick={onNewConversation}
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
              <button key={conv.id} onClick={() => onSwitchConv(conv)}
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
  )
}
