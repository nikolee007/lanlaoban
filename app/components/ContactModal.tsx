'use client'
import { useState } from 'react'
import { FiX, FiSend, FiCheckCircle, FiMessageSquare, FiLoader } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { useToast } from '../contexts/ToastContext'

interface ContactModalProps {
  open: boolean
  onClose: () => void
  supplierName?: string
  productId?: number
  supplierId?: number
}

type Step = 'form' | 'loading' | 'done'

export default function ContactModal({
  open,
  onClose,
  supplierName = '',
  productId,
  supplierId,
}: ContactModalProps) {
  const { locale } = useLocale()
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    message: '',
  })
  const [submitResult, setSubmitResult] = useState<{ id: number; createdAt: string } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { showToast } = useToast()

  const handleSubmit = async () => {
    setStep('loading')
    setSubmitError(null)
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        phone: form.phone,
        message: form.message,
      }
      if (form.company.trim()) body.company = form.company.trim()
      if (productId !== undefined) body.productId = productId
      if (supplierId !== undefined) body.supplierId = supplierId

      const t_ = localStorage.getItem('lanlaoban_token')
      const h_: Record<string, string> = { 'Content-Type': 'application/json' }
      if (t_) h_['Authorization'] = `Bearer ${t_}`
      const res = await fetch('/api/global-supply/contact', {
        method: 'POST',
        headers: h_,
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || `提交失败: ${res.status}`)
      }

      setSubmitResult(data.data)
      setStep('done')
      showToast(locale === 'en' ? 'Inquiry sent! Lanlaoban support will contact you within 24h' : '询盘已发送！懒老板客服将在24h内联系', 'success')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '提交失败，请重试')
      setStep('done')
    }
  }

  const handleClose = () => {
    setStep('form')
    setForm({ name: '', company: '', phone: '', message: '' })
    setSubmitResult(null)
    setSubmitError(null)
    onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative mx-auto w-full max-w-md rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label={t('supplier.contact', locale)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <FiMessageSquare className="h-5 w-5 text-brand-400" />
              <h2 className="text-lg font-bold text-gray-900">
                {supplierName ? `${t('supplier.contact', locale)} ${supplierName}` : t('supplier.contact', locale)}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {step === 'form' && (
              <div className="space-y-4">
                <div>
                  <label className="input-label">{locale === 'en' ? 'Your Name' : '您的姓名'}</label>
                  <input
                    type="text"
                    className="input"
                    placeholder={locale === 'en' ? 'Enter your name' : '请输入姓名'}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="input-label">{locale === 'en' ? 'Company Name' : '公司名称'}</label>
                  <input
                    type="text"
                    className="input"
                    placeholder={locale === 'en' ? 'Company name (optional)' : '公司名称（选填）'}
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="input-label">{locale === 'en' ? 'Phone / WeChat' : '电话 / 微信'}</label>
                  <input
                    type="text"
                    className="input"
                    placeholder={locale === 'en' ? 'Phone or WeChat number' : '手机号或微信号'}
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="input-label">{locale === 'en' ? 'Requirements' : '需求描述'}</label>
                  <textarea
                    className="input min-h-[100px] resize-y"
                    placeholder={locale === 'en' ? 'Describe your needs, e.g. quantity, specifications' : '请描述您的需求，例如采购数量、产品规格等'}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!form.name.trim() || !form.phone.trim()}
                  className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiSend className="h-4 w-4" />
                  {locale === 'en' ? 'Submit Inquiry' : '提交咨询'}
                </button>
              </div>
            )}

            {step === 'loading' && (
              <div className="flex flex-col items-center py-12">
                <FiLoader className="mb-4 h-10 w-10 animate-spin text-brand-400" />
                <p className="text-base font-medium text-gray-700">{locale === 'en' ? 'Submitting...' : '提交中...'}</p>
                <p className="mt-1 text-sm text-gray-400">
                  {locale === 'en' ? 'Submitting your inquiry' : '正在提交您的咨询信息'}
                </p>
              </div>
            )}

            {step === 'done' && (
              <div className="flex flex-col items-center py-10 text-center">
                {submitError ? (
                  <>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                      <FiX className="h-7 w-7 text-red-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{locale === 'en' ? 'Submission Failed' : '提交失败'}</p>
                    <p className="mt-2 text-sm text-gray-500">{submitError}</p>
                    <button
                      onClick={() => setStep('form')}
                      className="btn-primary mt-6 inline-flex items-center gap-2"
                    >
                      {locale === 'en' ? 'Re-fill' : '重新填写'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                      <FiCheckCircle className="h-7 w-7 text-green-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{locale === 'en' ? 'Inquiry Submitted' : '咨询已提交'}</p>
                    {submitResult && (
                      <div className="mt-3 space-y-1 text-sm text-gray-500">
                        <p>{locale === 'en' ? 'Inquiry ID:' : '咨询编号:'} {submitResult.id}</p>
                        <p>{locale === 'en' ? 'Submitted at:' : '提交时间:'} {submitResult.createdAt ? new Date(submitResult.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN') : ''}</p>
                      </div>
                    )}
                    <p className="mt-4 text-sm text-gray-400">{locale === 'en' ? 'Lanlaoban support will contact you within 24 hours' : '懒老板客服将在24小时内联系您'}</p>
                    <button
                      onClick={handleClose}
                      className="btn-primary mt-6 inline-flex items-center gap-2"
                    >
                      {locale === 'en' ? 'Got it' : '我知道了'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
