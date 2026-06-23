'use client'

import Link from 'next/link'
import { FiPackage, FiShoppingBag, FiTruck, FiGlobe, FiTrendingUp } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import type { SceneCardData } from './types'
import SectionHeader from './SectionHeader'
import { FiSearch } from 'react-icons/fi'

const SCENE_CARDS: SceneCardData[] = [
  { icon: FiPackage, titleKey: 'supply.scene.factory', descKey: 'supply.scene.factoryDesc', href: '/global-supply/search?q=工厂代工' },
  { icon: FiShoppingBag, titleKey: 'supply.scene.spot', descKey: 'supply.scene.spotDesc', href: '/global-supply/search?q=现货采购' },
  { icon: FiTruck, titleKey: 'supply.scene.logistics', descKey: 'supply.scene.logisticsDesc', href: '/global-supply/search?q=跨境物流' },
  { icon: FiGlobe, titleKey: 'supply.scene.platform', descKey: 'supply.scene.platformDesc', href: '/global-supply/search?q=上架海外平台' },
  { icon: FiTrendingUp, titleKey: 'supply.scene.channel', descKey: 'supply.scene.channelDesc', href: '/global-supply/search?q=对接海外渠道' },
]

export default function SceneCards() {
  const { locale } = useLocale()
  return (
    <section className="mb-8" aria-label={t('supply.scene.title', locale)}>
      <SectionHeader icon={FiSearch} title={t('supply.scene.title', locale)} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(SCENE_CARDS || []).map((scene, idx) => {
          const Icon = scene.icon
          return (
            <Link
              key={scene.titleKey}
              href={scene.href}
              className="animate-stagger group rounded-2xl border border-gray-100/80 bg-white p-4 sm:p-5 shadow-apple transition-all duration-300 hover:border-brand-100 hover:shadow-apple-md"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 transition-colors group-hover:bg-brand-100">
                <Icon className="h-5 w-5 text-brand-400" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">{t(scene.titleKey, locale)}</h3>
              <p className="text-xs leading-relaxed text-gray-400">{t(scene.descKey, locale)}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
