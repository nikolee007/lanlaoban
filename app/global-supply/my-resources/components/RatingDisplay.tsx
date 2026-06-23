'use client'

import { FiStar } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

/** Star rating display for suppliers */
export default function RatingDisplay({ rating }: { rating: number | null }) {
  const { locale } = useLocale()
  if (rating == null) return <span className="text-xs text-gray-400">{t('common.noData', locale)}</span>
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-500">
      <FiStar className="w-3.5 h-3.5 fill-current" />
      <span>{rating.toFixed(1)}</span>
    </span>
  )
}
