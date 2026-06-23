'use client'

import Link from 'next/link'
import { FiLogIn, FiUser } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'

export default function UnauthenticatedState() {
  const { locale } = useLocale()
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <FiUser className="h-8 w-8 text-brand-400" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          {locale === 'en' ? 'Please Log In' : '请先登录'}
        </h2>
        <p className="mb-8 text-sm text-gray-500">
          {locale === 'en'
            ? 'Log in to view your data dashboard'
            : '登录后可查看您的数据看板'}
        </p>
        <Link
          href="/login"
          className="btn-primary inline-flex items-center gap-2 px-8 py-3"
        >
          <FiLogIn className="h-4 w-4" />
          {locale === 'en' ? 'Log In' : '立即登录'}
        </Link>
      </div>
    </div>
  )
}
