import Link from 'next/link'
import { FiGlobe, FiArrowRight, FiMapPin } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import type { UIEnterprise } from '../types'

interface CompanyInfoSectionProps {
  enterprise: UIEnterprise
  supplierLinkId: number | null
}

export default function CompanyInfoSection({ enterprise, supplierLinkId }: CompanyInfoSectionProps) {
  const { locale } = useLocale()

  return (
    <section className="card mb-4">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
        <FiGlobe className="h-5 w-5 text-brand-500" />
        {t('detail.companyInfo', locale)}
      </h2>
      <dl className="divide-y divide-gray-50">
        {enterprise.name && (
          <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
            <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.enterpriseName', locale)}</dt>
            <dd className="text-sm text-gray-900">
              {supplierLinkId != null ? (
                <Link href={`/global-supply/suppliers/${supplierLinkId}`}
                  className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 hover:underline">
                  {enterprise.name}
                  <FiArrowRight className="h-3 w-3" />
                </Link>
              ) : enterprise.name}
            </dd>
          </div>
        )}
        {enterprise.established > 0 && (
          <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
            <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.establishedYear', locale)}</dt>
            <dd className="text-sm text-gray-900">
              {enterprise.established}
              <span className="ml-2 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                {t('detail.yearsExperience', locale).replace('{count}', String(new Date().getFullYear() - enterprise.established))}
              </span>
            </dd>
          </div>
        )}
        {enterprise.employeeCount > 0 && (
          <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
            <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.employeeCount', locale)}</dt>
            <dd className="text-sm text-gray-900">{enterprise.employeeCount} {t('common.unitPeople', locale)}</dd>
          </div>
        )}
        {enterprise.location && (
          <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
            <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.location', locale)}</dt>
            <dd className="inline-flex items-center gap-1 text-sm text-gray-900">
              <FiMapPin className="h-3.5 w-3.5 text-brand-400" />{enterprise.location}
            </dd>
          </div>
        )}
        {enterprise.annualExport && (
          <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
            <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.annualExport', locale)}</dt>
            <dd className="text-sm text-gray-900">{enterprise.annualExport}</dd>
          </div>
        )}
        {enterprise.certifications.length > 0 && (
          <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
            <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.certifications', locale)}</dt>
            <dd className="text-sm text-gray-900">
              {enterprise.certifications.map((c) => (
                <span key={c} className="mr-1.5 inline-block rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600">{c}</span>
              ))}
            </dd>
          </div>
        )}
        {enterprise.mainBusiness && (
          <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
            <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.mainBusiness', locale)}</dt>
            <dd className="text-sm text-gray-900">{enterprise.mainBusiness}</dd>
          </div>
        )}
        {enterprise.exportDestinations.length > 0 && (
          <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
            <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.exportDestinations', locale)}</dt>
            <dd className="text-sm text-gray-900">{enterprise.exportDestinations.join(' / ')}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}
