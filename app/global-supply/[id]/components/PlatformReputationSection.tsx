import { FiThumbsUp, FiClock } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import StarRating from './StarRating'
import { PLATFORM_COLORS } from '../constants'
import type { UIPlatformRating } from '../types'

interface PlatformReputationSectionProps {
  platforms: Record<string, UIPlatformRating>
}

export default function PlatformReputationSection({ platforms }: PlatformReputationSectionProps) {
  const { locale } = useLocale()

  return (
    <section className="card mb-4">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
        <FiThumbsUp className="h-5 w-5 text-brand-500" />
        {t('detail.reputation', locale)}
      </h2>
      <div className="space-y-4">
        {Object.entries(platforms || {}).map(([platform, data]) => (
          <div key={platform} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold text-white ${PLATFORM_COLORS[platform] || 'bg-gray-500'}`}>
                {platform}
              </span>
              <StarRating value={data.rating} />
              <span className="text-sm font-medium text-gray-700">{data.rating}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{t('detail.platformReviews', locale).replace('{count}', data.reviewCount.toLocaleString())}</span>
              {data.collectedAt && (
                <span className="inline-flex items-center gap-1">
                  <FiClock className="h-3 w-3" />{data.collectedAt}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
