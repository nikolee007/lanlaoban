'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage } from '../types'
import { formatTime } from '../utils'

interface MessageBubbleProps {
  message: ChatMessage
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end px-4 py-3">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #FF6034, #8B5CF6)' }}>
          <p>{message.content}</p>
          <p className="mt-1 text-right text-[10px] opacity-60">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #FF6034, #8B5CF6)' }}>AI</div>
        <div className="min-w-0 flex-1 rounded-2xl bg-white px-4 py-3 shadow-apple">
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
          <p className="mt-1 text-[10px] text-gray-400">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    </div>
  )
}
