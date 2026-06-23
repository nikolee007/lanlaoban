'use client'

import { FiRefreshCw } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

export default function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  const { locale } = useLocale()
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="px-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <FiRefreshCw className="h-7 w-7 text-red-400" />
        </div>
        <p className="mb-2 text-sm text-gray-600">{t('common.loadFailed', locale)}</p>
        <p className="mb-6 text-xs text-gray-400">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90"
          style={{ backgroundColor: '#FF6034' }}
        >
          <FiRefreshCw className="h-4 w-4" />
          {t('common.reload', locale)}
        </button>
      </div>
    </div>
  )
}
