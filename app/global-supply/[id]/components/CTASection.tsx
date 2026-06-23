'use client'

import { FiMessageSquare, FiShoppingCart, FiHeart } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

interface CTASectionProps {
  favorited: boolean
  favoriteLoading: boolean
  cartLoading: boolean
  onContact: () => void
  onAddToCart: () => void
  onToggleFavorite: () => void
}

export default function CTASection({
  favorited, favoriteLoading, cartLoading,
  onContact, onAddToCart, onToggleFavorite,
}: CTASectionProps) {
  const { locale } = useLocale()

  return (
    <section className="mt-8">
      <div className="rounded-2xl bg-gradient-to-br from-brand-50 via-white to-purple-50/40 p-6 shadow-apple border border-brand-100/50">
        <h3 className="mb-5 text-center text-lg font-bold text-gray-800">
          {t('detail.interested', locale)}
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={onContact}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-8 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-500">
            <FiMessageSquare className="w-5 h-5" />{t('detail.contactFactory', locale)}
          </button>
          <button onClick={onAddToCart} disabled={cartLoading}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-brand-400 px-8 py-3 text-base font-bold text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50">
            <FiShoppingCart className={`w-5 h-5 ${cartLoading ? 'animate-pulse' : ''}`} />
            {cartLoading ? t('detail.addingToCart', locale) : t('detail.addToList', locale)}
          </button>
          <button onClick={onToggleFavorite} disabled={favoriteLoading}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 px-8 py-3 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              favorited ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-brand-400 text-brand-600 hover:bg-brand-50'}`}>
            <FiHeart className={`w-5 h-5 ${favorited ? 'fill-brand-400 text-brand-400' : ''}`} />
            {favorited ? t('detail.saved', locale) : t('detail.save', locale)}
          </button>
        </div>
      </div>
    </section>
  )
}
