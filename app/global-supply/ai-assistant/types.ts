export type Tab = 'chat' | 'profile' | 'materials'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  lastMessage?: string
}

export interface IpProfileData {
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
