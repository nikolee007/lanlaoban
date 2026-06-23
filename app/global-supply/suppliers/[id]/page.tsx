'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '../../../components/Breadcrumb'
import ContactModal from '../../../components/ContactModal'
import { useToast } from '../../../contexts/ToastContext'
import {
  FiArrowLeft, FiHeart, FiMapPin, FiPackage, FiShield,
  FiAward, FiCheckCircle, FiMessageSquare, FiGlobe,
  FiClock, FiUsers, FiCalendar, FiDollarSign, FiStar,
  FiFileText, FiPhone, FiUser, FiHome,
} from 'react-icons/fi'
import { safeJsonParse, formatDate } from './helpers'
import type { SupplierDetail, SupplierDetailResponse, CollectionItem } from './types'
import StarRating from './components/StarRating'
import StatCard from './components/StatCard'
import SupplierProductCard from './components/SupplierProductCard'
import DetailSkeleton from './components/DetailSkeleton'
import ErrorSection from './components/ErrorSection'
import EmptySection from './components/EmptySection'
import FiBarChart2Icon from './components/FiBarChart2Icon'

export default function SupplierDetailPage() {
  const params = useParams()
  const id = String(params.id ?? '')
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null)
  const [favorited, setFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)

  const fetchSupplier = useCallback(async () => {
    if (!id) return
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/global-supply/suppliers/${id}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('供应商不存在或已下线')
        throw new Error(`请求失败 (${res.status})`)
      }
      const json: SupplierDetailResponse = await res.json()
      if (!json.success || !json.data) throw new Error('获取供应商信息失败')
      setSupplier(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败，请稍后重试')
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchSupplier() }, [fetchSupplier])

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const t_ = localStorage.getItem('lanlaoban_token')
        const res = await fetch('/api/global-supply/collections', { headers: t_ ? { Authorization: `Bearer ${t_}` } : {} })
        if (!res.ok) return
        const json = await res.json()
        if (json.success) {
          const items = json?.data || []
          const found = Array.isArray(items) ? items.some((c: CollectionItem) => c.targetType === 'supplier' && c.targetId === id) : false
          setFavorited(found)
        }
      } catch { /* non-critical */ }
    })()
  }, [id])

  const toggleFavorite = async () => {
    if (favoriteLoading) return
    const t_ = localStorage.getItem('lanlaoban_token')
    if (!t_) { showToast?.('请先登录再收藏', 'warning'); return }
    setFavoriteLoading(true)
    try {
      const headers_: Record<string, string> = { 'Content-Type': 'application/json' }
      if (t_) headers_['Authorization'] = `Bearer ${t_}`
      if (favorited) {
        const res = await fetch('/api/global-supply/collections', { method: 'DELETE', headers: headers_, body: JSON.stringify({ targetId: id, targetType: 'supplier' }) })
        if (res.ok) { setFavorited(false); showToast('已取消收藏', 'info') }
      } else {
        const res = await fetch('/api/global-supply/collections', { method: 'POST', headers: headers_, body: JSON.stringify({ targetId: id, targetType: 'supplier' }) })
        if (res.ok) { setFavorited(true); showToast('已收藏', 'success') }
      }
    } catch { /* silently ignore */ } finally { setFavoriteLoading(false) }
  }

  if (loading) return <DetailSkeleton />
  if (error) return <ErrorSection message={error} onRetry={fetchSupplier} />
  if (!supplier) return <EmptySection />

  const tags = safeJsonParse<string[]>(supplier.businessTags, [])
  const certs = safeJsonParse<string[]>(supplier.certifications, [])
  const exportDests = safeJsonParse<string[]>(supplier.exportDestinations, [])
  const annualExportDisplay = supplier.annualExportRevenue != null && supplier.annualExportRevenue > 0
    ? `$${(supplier.annualExportRevenue / 100).toFixed(0)}M` : '--'

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <Link href="/global-supply/suppliers" className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400">
              <FiArrowLeft className="h-5 w-5" />返回
            </Link>
            <span className="truncate text-sm font-semibold text-gray-900">{supplier.nameZh}</span>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6">
          <Breadcrumb items={[
            { label: '懒老板', href: '/' },
            { label: '全球供应链', href: '/global-supply' },
            { label: '供应商列表', href: '/global-supply/suppliers' },
            { label: supplier.nameZh },
          ]} className="mb-4" />

          {/* Supplier Info Card */}
          <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-apple">
            <div className="relative px-6 py-8 sm:px-8" style={{ background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE4D6 100%)' }}>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 bg-brand-400" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full opacity-10 bg-brand-400" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-bold text-brand-400 shadow-sm">
                    {(supplier.nameZh || '供').charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{supplier.nameZh}</h1>
                      {supplier.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          <FiAward className="h-3.5 w-3.5" />认证供应商
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{supplier.nameEn}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1"><FiMapPin className="h-4 w-4 text-brand-400" />{supplier.location}</span>
                      <span className="inline-flex items-center gap-1">
                        <StarRating value={supplier.rating} />
                        <span className="ml-1 font-medium text-gray-700">{supplier.rating.toFixed(1)}</span>
                        <span className="text-gray-400">({supplier.reviewCount} 条评价)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setContactModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-500">
                    <FiMessageSquare className="h-4 w-4" />联系供应商
                  </button>
                  <button onClick={toggleFavorite} disabled={favoriteLoading}
                    className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${favorited ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-brand-400 text-brand-600 hover:bg-brand-50'}`}>
                    <FiHeart className={`h-4 w-4 ${favorited ? 'fill-brand-400 text-brand-400' : ''}`} />
                    {favorited ? '已收藏' : '收藏'}
                  </button>
                </div>
              </div>
            </div>
            {(supplier.contactName || supplier.contactPhone) && (
              <div className="border-t border-gray-50 bg-gray-50/50 px-6 py-3 sm:px-8">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                  {supplier.contactName && <span className="inline-flex items-center gap-1.5 text-gray-600"><FiUser className="h-4 w-4 text-gray-400" />联系人: {supplier.contactName}</span>}
                  {supplier.contactPhone && <span className="inline-flex items-center gap-1.5 text-gray-600"><FiPhone className="h-4 w-4 text-gray-400" />{supplier.contactPhone}</span>}
                </div>
              </div>
            )}
          </section>

          {/* Company Intro */}
          {supplier.companyIntro && (
            <section className="mb-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, #FFF5F0, #FFF0EB)' }}>
              <div className="p-5 sm:p-6">
                <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800"><FiFileText className="h-5 w-5 text-brand-400" />公司简介</h2>
                <p className="text-sm leading-relaxed text-gray-600">{supplier.companyIntro}</p>
              </div>
            </section>
          )}

          {/* Stats */}
          <section className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800"><FiBarChart2Icon />企业数据</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={FiCalendar} label="成立年份" value={supplier.yearEstablished || '--'} />
              <StatCard icon={FiUsers} label="员工人数" value={supplier.employeeCount ? `${supplier.employeeCount}人` : '--'} />
              <StatCard icon={FiDollarSign} label="年出口额" value={annualExportDisplay} />
              <StatCard icon={FiStar} label="综合评分" value={supplier.rating.toFixed(1)} />
            </div>
          </section>

          {/* Enterprise Details */}
          <section className="card mb-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800"><FiHome className="h-5 w-5 text-brand-400" />企业详情</h2>
            <dl className="divide-y divide-gray-50">
              <DetailRow label="企业名称" value={supplier.nameZh} />
              <DetailRow label="英文名称" value={supplier.nameEn} />
              <DetailRow label="所在地区" value={supplier.location} icon={<FiMapPin className="h-3.5 w-3.5 text-brand-400" />} />
              <DetailRow label="成立年份" value={supplier.yearEstablished} suffix={<span className="ml-2 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">成立 {new Date().getFullYear() - supplier.yearEstablished} 年</span>} />
              <DetailRow label="员工人数" value={`${supplier.employeeCount} 人`} />
              <DetailRow label="年出口额" value={annualExportDisplay} />
              {supplier.contactName && <DetailRow label="联系人" value={supplier.contactName} />}
              {supplier.contactPhone && <DetailRow label="联系电话" value={supplier.contactPhone} icon={<FiPhone className="h-3.5 w-3.5 text-gray-400" />} />}
              {tags.length > 0 && <DetailRow label="主营业务" value={<div className="flex flex-wrap gap-1.5">{tags.map((tag: string) => <span key={tag} className="inline-block rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">{tag}</span>)}</div>} />}
              {exportDests.length > 0 && <DetailRow label="出口去向" value={exportDests.join(' / ')} />}
            </dl>
          </section>

          {/* Certifications */}
          {certs.length > 0 && (
            <section className="card mb-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800"><FiShield className="h-5 w-5 text-brand-400" />资质认证</h2>
              <div className="flex flex-wrap gap-2">
                {certs.map((cert: string) => (
                  <span key={cert} className="inline-flex items-center gap-1 rounded-lg border border-green-100 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                    <FiCheckCircle className="h-4 w-4" />{cert}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Products Grid */}
          {supplier.products.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800"><FiPackage className="h-5 w-5 text-brand-400" />全部商品<span className="text-sm font-normal text-gray-400">({supplier.products.length} 件)</span></h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {supplier.products.map((product) => <SupplierProductCard key={product.id} product={product} />)}
              </div>
            </section>
          )}

          {/* Reviews */}
          {supplier.reviews.length > 0 && (
            <section className="card mb-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800"><FiGlobe className="h-5 w-5 text-brand-400" />多平台口碑</h2>
              <div className="space-y-3">
                {supplier.reviews.map((review) => (
                  <div key={review.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">{review.platform}</span>
                      <StarRating value={review.rating} />
                      <span className="text-sm font-medium text-gray-700">{review.rating}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{review.reviewCount.toLocaleString()} 条评价</span>
                      {review.returnRate != null && <span className="text-red-500">退货率 {review.returnRate}%</span>}
                      <span className="inline-flex items-center gap-1"><FiClock className="h-3 w-3" />{formatDate(review.collectedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="card text-center">
            <h3 className="mb-5 text-center text-lg font-bold text-gray-800">对这个供应商感兴趣？</h3>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button onClick={() => setContactModalOpen(true)} className="flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-8 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-500">
                <FiMessageSquare className="h-5 w-5" />联系供应商
              </button>
              <button onClick={toggleFavorite} disabled={favoriteLoading}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 px-8 py-3 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${favorited ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-brand-400 text-brand-600 hover:bg-brand-50'}`}>
                <FiHeart className={`h-5 w-5 ${favorited ? 'fill-brand-400 text-brand-400' : ''}`} />
                {favorited ? '已收藏' : '收藏该供应商'}
              </button>
            </div>
          </section>

          <div className="mt-6 text-center">
            <Link href="/global-supply/suppliers" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-brand-400">
              <FiArrowLeft className="h-4 w-4" />查看全部供应商
            </Link>
          </div>
          <div className="mt-6 text-center text-xs text-gray-400">
            数据来源: 百度企业信用 / 1688 / 企查查等多平台公开信息 | 更新于: {formatDate(supplier.updatedAt)}
          </div>
        </div>
      </main>

      <ContactModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} supplierName={supplier.nameZh} supplierId={supplier.id} />
    </>
  )
}

function DetailRow({ label, value, icon, suffix }: { label: string; value: React.ReactNode; icon?: React.ReactNode; suffix?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
      <dt className="min-w-[7rem] text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">
        {icon && <span className="inline-flex items-center gap-1">{icon}{value}{suffix}</span>}
        {!icon && <>{value}{suffix}</>}
      </dd>
    </div>
  )
}
