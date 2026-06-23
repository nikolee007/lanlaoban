import { FiMessageSquare, FiCalendar } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import StarRating from './StarRating'
import { PLATFORM_COLORS } from '../constants'
import type { UIReview } from '../types'

interface BuyerReviewsSectionProps {
  reviews: UIReview[]
}

export default function BuyerReviewsSection({ reviews }: BuyerReviewsSectionProps) {
  const { locale } = useLocale()

  return (
    <section className="card mb-4">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
        <FiMessageSquare className="h-5 w-5 text-brand-500" />
        {t('detail.reviews.title', locale)}
      </h2>
      <div className="space-y-5">
        {(reviews || []).map((review) => (
          <div key={review.id}
            className="rounded-xl border border-gray-100/80 bg-white px-4 py-3.5 shadow-apple transition-all duration-300 hover:border-gray-200 hover:shadow-apple-md">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                  {review.avatar}
                </span>
                <div>
                  <span className="text-sm font-semibold text-gray-800">{review.username}</span>
                  {review.platform && (
                    <span className={`ml-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white ${PLATFORM_COLORS[review.platform] || 'bg-gray-500'}`}>
                      {review.platform}
                    </span>
                  )}
                </div>
              </div>
              {review.time && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                  <FiCalendar className="h-3 w-3" />{review.time}
                </span>
              )}
            </div>
            <div className="mb-1.5"><StarRating value={review.rating} /></div>
            <p className="text-sm leading-relaxed text-gray-600">&ldquo;{review.content}&rdquo;</p>
          </div>
        ))}
      </div>
    </section>
  )
}
