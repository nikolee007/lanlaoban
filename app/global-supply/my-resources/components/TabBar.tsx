'use client'

import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { TABS } from '../constants'
import type { TabKey } from '../types'

interface TabBarProps {
  activeTab: TabKey
  onTabChange: (key: TabKey) => void
  tabBadge: (key: TabKey) => number | null
}

export default function TabBar({ activeTab, onTabChange, tabBadge }: TabBarProps) {
  const { locale } = useLocale()

  return (
    <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map(tab => {
        const badge = tabBadge(tab.key)
        const isActive = activeTab === tab.key
        const Icon = tab.icon
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
              isActive
                ? 'bg-brand-400 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {t(tab.labelKey, locale)}
            {badge != null && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
