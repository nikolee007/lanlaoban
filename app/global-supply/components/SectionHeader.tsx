'use client'

import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

export default function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  href?: string
}) {
  const { locale } = useLocale()
  if (href) {
    return (
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-brand-400" />
          <div>
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-xs text-brand-400 hover:underline"
        >
          {t('supply.viewAll', locale)} <FiArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-5 w-5 text-brand-400" />
      <div>
        <h2 className="text-base font-bold text-gray-900 sm:text-lg">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}
