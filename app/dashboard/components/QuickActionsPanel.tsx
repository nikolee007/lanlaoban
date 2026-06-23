'use client'

import Link from 'next/link'
import { FiStar, FiArrowRight, FiRefreshCw } from 'react-icons/fi'

interface QuickLink {
  icon: React.ComponentType<{ className?: string }>
  label: string
  desc: string
  href: string
}

interface QuickActionsPanelProps {
  links: QuickLink[]
  locale: string
}

export default function QuickActionsPanel({ links, locale }: QuickActionsPanelProps) {
  const isEn = locale === 'en'

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
        <FiStar className="h-4 w-4 text-brand-400" />
        {isEn ? 'Quick Access' : '快速入口'}
      </h2>
      {links.map((link) => {
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className="card group flex items-center gap-4 transition-all hover:shadow-apple-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 transition-colors group-hover:bg-brand-100">
              <Icon className="h-5 w-5 text-brand-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900">
                {link.label}
              </div>
              <div className="text-xs text-gray-400">{link.desc}</div>
            </div>
            <FiArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-brand-400" />
          </Link>
        )
      })}

      {/* Extra: refresh */}
      <button
        onClick={() => window.location.reload()}
        className="card flex w-full items-center justify-center gap-2 p-4 text-sm text-gray-500 transition-all hover:text-brand-400 hover:shadow-apple-md"
      >
        <FiRefreshCw className="h-4 w-4" />
        {isEn ? 'Refresh Data' : '刷新数据'}
      </button>
    </div>
  )
}
