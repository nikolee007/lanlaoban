'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { useToast } from '../contexts/ToastContext'

type FeedbackType = '建议' | 'Bug' | '咨询'

const TYPE_OPTIONS: FeedbackType[] = ['建议', 'Bug', '咨询']

export default function FeedbackButton() {
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('建议')
  const [content, setContent] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleSubmit() {
    if (!content.trim()) {
      showToast(locale === 'en' ? 'Please fill in feedback content' : '请填写反馈内容', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content: content.trim(), contact: contact.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || '提交失败')
      }

      showToast(locale === 'en' ? 'Thank you for your feedback!' : '感谢您的反馈！', 'success')
      setContent('')
      setContact('')
      setType('建议')
      setOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (locale === 'en' ? 'Network error, please try again later' : '网络异常，请稍后重试')
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#FF6034' }}
        aria-label={locale === 'en' ? 'Feedback' : '反馈'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {locale === 'en' ? 'Feedback' : '反馈'}
      </button>

      {/* Feedback panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">{locale === 'en' ? 'Feedback' : '反馈意见'}</h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label={locale === 'en' ? 'Close' : '关闭'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Type selector */}
          <div className="mb-4">
            <label className="input-label">{locale === 'en' ? 'Type' : '类型'}</label>
            <div className="relative">
              <button
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                className="input flex items-center justify-between"
              >
                <span>{type}</span>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {typeDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                  {TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setType(opt); setTypeDropdownOpen(false) }}
                      className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-brand-50 ${
                        type === opt ? 'font-semibold text-brand-400' : 'text-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="input-label">{locale === 'en' ? 'Content' : '内容'}</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={locale === 'en' ? 'Describe your feedback or issue...' : '请描述您的意见或遇到的问题...'}
              rows={4}
              maxLength={1000}
              className="input resize-none"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{content.length}/1000</p>
          </div>

          {/* Contact */}
          <div className="mb-5">
            <label className="input-label">{locale === 'en' ? 'Contact (optional)' : '联系方式（选填）'}</label>
            <input
              value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder={locale === 'en' ? 'Phone / WeChat / Email' : '手机号 / 微信 / 邮箱'}
              className="input"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full"
            style={{
              backgroundColor: submitting ? '#ccc' : '#FF6034',
            }}
          >
            {submitting ? (locale === 'en' ? 'Submitting...' : '提交中...') : (locale === 'en' ? 'Submit Feedback' : '提交反馈')}
          </button>
        </div>
      )}
    </>
  )
}
