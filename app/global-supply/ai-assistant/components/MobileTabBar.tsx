'use client'

import type { Tab } from '../types'

interface MobileTabBarProps {
  tab: Tab
  onTabChange: (t: Tab) => void
  showFollowUp: boolean
  profilePercent: number
  videoCount: number
}

export default function MobileTabBar({ tab, onTabChange, showFollowUp, profilePercent, videoCount }: MobileTabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex sm:hidden">
      {[
        { k: 'chat' as Tab, l: '对话', badge: showFollowUp ? '新' : '' },
        { k: 'profile' as Tab, l: '档案', badge: `${profilePercent}%` },
        { k: 'materials' as Tab, l: '素材', badge: `${videoCount || 0}` },
      ].map(t => (
        <button key={t.k} onClick={() => onTabChange(t.k)}
          className={`flex-1 py-2.5 text-center text-xs font-medium ${tab === t.k ? 'text-white' : 'text-gray-400'}`}
          style={tab === t.k ? { background: 'linear-gradient(135deg, #FF6034, #8B5CF6)' } : {}}>
          {t.l}
          {t.badge && <span className="ml-1 text-[10px] opacity-70">({t.badge})</span>}
        </button>
      ))}
    </div>
  )
}
