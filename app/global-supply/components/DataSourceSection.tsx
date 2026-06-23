'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

export default function DataSourceSection() {
  const { locale } = useLocale()
  const [dateStr, setDateStr] = useState('')
  useEffect(() => {
    const d = new Date()
    setDateStr(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }, [])
  return (
    <div className="mb-4 rounded-2xl border border-gray-100/80 bg-white p-5 text-center text-xs text-gray-400">
      {t('supply.dataSource', locale)} {dateStr}
    </div>
  )
}
