'use client'
import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

const stats = [
  { value: '142+', labelKey: 'about.stats.products' },
  { value: '117+', labelKey: 'about.stats.suppliers' },
  { value: '28+', labelKey: 'about.stats.categories' },
  { value: '10+', labelKey: 'about.stats.industries' },
]

const steps = [
  { num: '1', titleKey: 'about.step1.title', descKey: 'about.step1.desc' },
  { num: '2', titleKey: 'about.step2.title', descKey: 'about.step2.desc' },
  { num: '3', titleKey: 'about.step3.title', descKey: 'about.step3.desc' },
]

export default function AboutPage() {
  const { locale } = useLocale()

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-14 text-center">
        <h1 className="section-title">
          {t('about.title', locale)}
        </h1>
        <p className="section-subtitle mt-4 max-w-2xl mx-auto">
          {t('about.subtitle', locale)}
        </p>
      </section>

      {/* Mission */}
      <section>
        <div className="mx-auto max-w-3xl px-6 pb-12">
          <div className="card p-8 sm:p-10 text-center">
            <h2 className="section-title mb-6">{t('about.mission.title', locale)}</h2>
            <p className="text-xl font-semibold leading-relaxed text-brand-400">
              {t('about.mission.statement', locale)}
            </p>
            <p className="mt-4 text-gray-500 leading-relaxed">
              {t('about.mission.desc', locale)}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="mx-auto max-w-4xl px-6 pb-14">
          <div className="card p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
                <div key={s.labelKey}>
                  <p className="text-3xl font-bold text-brand-400">{s.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{t(s.labelKey, locale)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Three Steps */}
      <section>
        <div className="mx-auto max-w-4xl px-6 pb-14">
          <h2 className="section-title text-center mb-10">
            {t('about.how.title', locale)}
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {steps.map((step) => (
              <div key={step.num} className="card p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white mb-4 bg-brand-400">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t(step.titleKey, locale)}</h3>
                <p className="text-sm text-gray-500">{t(step.descKey, locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Philosophy */}
      <section>
        <div className="mx-auto max-w-3xl px-6 pb-14">
          <div className="card p-8 sm:p-10 text-center">
            <h2 className="section-title mb-4">{t('about.team.title', locale)}</h2>
            <p className="text-lg font-semibold leading-relaxed mb-4 text-brand-400">
              {t('about.team.philosophy', locale)}
            </p>
            <p className="text-gray-500 leading-relaxed max-w-2xl mx-auto">
              {t('about.team.desc', locale)}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-4xl px-6 pb-14">
          <div className="card p-10 text-center" style={{ background: 'linear-gradient(135deg, #FFF5F0 0%, #EEF2FF 100%)' }}>
            <h2 className="section-title">{t('about.cta.title', locale)}</h2>
            <p className="mt-3 text-gray-500">{t('about.cta.subtitle', locale)}</p>
            <div className="mt-6">
              <Link href="/global-supply" className="btn-primary inline-flex items-center gap-2">
                {t('about.cta.button', locale)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-gray-400">
          {t('about.footer', locale)}
        </div>
      </footer>
    </div>
  )
}
