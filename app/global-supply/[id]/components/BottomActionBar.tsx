'use client'

import { FiHeart, FiShoppingCart, FiPlus, FiShare2 } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

interface BottomActionBarProps {
  favorited: boolean
  favoriteLoading: boolean
  cartLoading: boolean
  inCompare: boolean
  onToggleFavorite: () => void
  onAddToCart: () => void
  onToggleCompare: () => void
  onContact: () => void
}

export default function BottomActionBar({
  favorited, favoriteLoading, cartLoading, inCompare,
  onToggleFavorite, onAddToCart, onToggleCompare, onContact,
}: BottomActionBarProps) {
  const { locale } = useLocale()

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={onToggleFavorite} disabled={favoriteLoading}
            aria-label={t('detail.save', locale)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] ${
              favorited ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            <FiHeart className={`h-4 w-4 ${favorited ? 'fill-brand-400 text-brand-400' : ''}`} />
            {favorited ? t('detail.saved', locale) : t('detail.save', locale)}
          </button>
          <button onClick={onAddToCart} disabled={cartLoading}
            aria-label={t('common.loginToCart', locale)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 sm:px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]">
            <FiShoppingCart className={`h-4 w-4 ${cartLoading ? 'animate-pulse' : ''}`} />
            {cartLoading ? t('detail.addingToCart', locale) : t('detail.addToList', locale)}
          </button>
          <button onClick={onToggleCompare}
            className={`flex items-center gap-1.5 rounded-lg border px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
              inCompare ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            <FiPlus className="h-4 w-4" />
            {inCompare ? t('detail.alreadyCompared', locale) : t('detail.addCompare', locale)}
          </button>
          <button aria-label={t('detail.share', locale)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 sm:px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 min-h-[44px]">
            <FiShare2 className="h-4 w-4" />{t('detail.share', locale)}
          </button>
        </div>
        <button onClick={onContact}
          aria-label={t('supplier.contact', locale)}
          className="flex-1 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-500 sm:flex-initial sm:px-10 min-h-[44px]">
          {t('detail.contactFactory', locale)}
        </button>
      </div>
    </footer>
  )
}
