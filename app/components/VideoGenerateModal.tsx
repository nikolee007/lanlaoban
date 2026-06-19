'use client'
import { useState, useEffect, useRef } from 'react'
import { FiX, FiZap, FiLoader, FiCheckCircle, FiCopy, FiDownload, FiPlay } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { useToast } from '../contexts/ToastContext'

interface VideoGenerateModalProps {
  open: boolean
  onClose: () => void
  productName?: string
}

const AGNES_API_KEY = 'sk-wpsLt5JiISV9fjtN5h3bALz3oj0AtqbyAy0fcgpBhUN6UHCw'
const AGNES_API_URL = 'https://apihub.agnes-ai.com/v1/chat/completions'

const TARGET_MARKETS = [
  { value: 'southeast-asia', label: 'Southeast Asia' },
  { value: 'europe-america', label: 'Europe & America' },
  { value: 'south-america', label: 'South America' },
  { value: 'middle-east', label: 'Middle East' },
]

type Step = 'form' | 'loading' | 'result'

function getMarketLabel(value: string, locale: string): string {
  const labels: Record<string, Record<string, string>> = {
    zh: { 'southeast-asia': '东南亚', 'europe-america': '欧美', 'south-america': '南美', 'middle-east': '中东' },
    en: { 'southeast-asia': 'Southeast Asia', 'europe-america': 'Europe & America', 'south-america': 'South America', 'middle-east': 'Middle East' },
  }
  return labels[locale]?.[value] || labels.en[value] || value
}

export default function VideoGenerateModal({
  open,
  onClose,
  productName = '',
}: VideoGenerateModalProps) {
  const { locale } = useLocale()
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({
    productName: productName,
    brandName: '',
    sellingPoints: '',
    targetMarket: 'southeast-asia',
  })
  const [generatedScript, setGeneratedScript] = useState('')
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { showToast } = useToast()
  const typingRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (typingRef.current !== null) clearTimeout(typingRef.current)
    }
  }, [])

  const startTypingEffect = (text: string) => {
    setDisplayedText('')
    setIsTyping(true)
    let index = 0
    const speed = 30

    const type = () => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
        typingRef.current = window.setTimeout(type, speed)
      } else {
        setIsTyping(false)
      }
    }
    type()
  }

  const handleSubmit = async () => {
    setStep('loading')
    try {
      const marketLabel =
        TARGET_MARKETS.find((m) => m.value === form.targetMarket)?.label || 'Global'
      const prompt = `为商品[${form.productName}]（品牌：${form.brandName || form.productName}，卖点：${form.sellingPoints}，目标市场：${marketLabel}）生成一个30秒TikTok带货视频脚本。格式：\n\n【开场钩子】(前3秒)\n【产品展示】(4-15秒)\n【使用场景】(16-25秒)\n【号召行动】(26-30秒)`

      const res = await fetch(AGNES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AGNES_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'agnes-1.5-flash',
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) throw new Error(`请求失败: ${res.status}`)

      const data = await res.json()
      const content =
        data.choices?.[0]?.message?.content ||
        data.reply ||
        data.content ||
        data.script ||
        data.text ||
        JSON.stringify(data)
      setGeneratedScript(content)
      setStep('result')
      setTimeout(() => startTypingEffect(content), 100)
      showToast(
        locale === 'en' ? 'Script generated successfully!' : '脚本生成成功!',
        'success',
      )
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : locale === 'en' ? 'Unknown error' : '未知错误'
      setGeneratedScript(
        `${locale === 'en' ? 'Generation failed:' : '生成失败:'} ${errMsg}`,
      )
      setStep('result')
      setDisplayedText(
        `${locale === 'en' ? 'Generation failed:' : '生成失败:'} ${errMsg}`,
      )
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript)
      showToast(locale === 'en' ? 'Copied!' : '已复制!', 'success')
    } catch {
      showToast(locale === 'en' ? 'Copy failed' : '复制失败', 'error')
    }
  }

  const handleClose = () => {
    if (typingRef.current !== null) clearTimeout(typingRef.current)
    setStep('form')
    setForm({
      productName: '',
      brandName: '',
      sellingPoints: '',
      targetMarket: 'southeast-asia',
    })
    setGeneratedScript('')
    setDisplayedText('')
    setIsTyping(false)
    onClose()
  }

  if (!open) return null

  const renderScriptContent = () => {
    const text = isTyping ? displayedText : displayedText || generatedScript
    const sections = text.split(/(?=【)/)
    if (sections.length <= 1) {
      return (
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {text}
          {isTyping && (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse align-middle bg-brand-400" />
          )}
        </pre>
      )
    }
    return (
      <>
        {sections.map((section, i) => {
          const trimmed = section.trim()
          if (!trimmed) return null
          const match = trimmed.match(/^【(.+?)】/)
          if (match) {
            const title = match[1]
            const content = trimmed.slice(match[0].length)
            return (
              <div key={i} className="mb-3 last:mb-0">
                <h4 className="mb-1 text-sm font-bold text-brand-400">
                  【{title}】
                </h4>
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {content}
                </p>
              </div>
            )
          }
          return (
            <p key={i} className="whitespace-pre-wrap text-sm text-gray-700">
              {trimmed}
            </p>
          )
        })}
        {isTyping && (
          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse align-middle bg-brand-400" />
        )}
      </>
    )
  }

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
          className="relative mx-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label={
            locale === 'en' ? 'AI Video Generation' : 'AI视频生成'
          }
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <FiZap className="h-5 w-5 text-brand-400" />
              <h2 className="text-lg font-bold text-gray-900">
                {locale === 'en' ? 'AI Video Generation' : 'AI 生成视频素材'}
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
                {/* Product name */}
                <div>
                  <label className="input-label">
                    {locale === 'en' ? 'Product Name' : '商品名称'}
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder={
                      locale === 'en'
                        ? 'Enter product name'
                        : '输入商品名称'
                    }
                    value={form.productName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, productName: e.target.value }))
                    }
                  />
                </div>

                {/* Brand name */}
                <div>
                  <label className="input-label">
                    {locale === 'en' ? 'Brand Name' : '品牌名称'}
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder={
                      locale === 'en'
                        ? 'Enter brand name (optional)'
                        : '输入品牌名称（选填）'
                    }
                    value={form.brandName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, brandName: e.target.value }))
                    }
                  />
                </div>

                {/* Selling points */}
                <div>
                  <label className="input-label">
                    {locale === 'en' ? 'Key Selling Points' : '核心卖点'}
                  </label>
                  <textarea
                    className="input min-h-[100px] resize-y"
                    placeholder={
                      locale === 'en'
                        ? 'One selling point per line, e.g.:\nActive Noise Cancellation\n40h battery life\nIPX5 waterproof'
                        : '一行一个卖点，例如：\n主动降噪 ANC\n40小时超长续航\nIPX5 防水等级'
                    }
                    value={form.sellingPoints}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sellingPoints: e.target.value }))
                    }
                  />
                </div>

                {/* Target market */}
                <div>
                  <label className="input-label">
                    {locale === 'en' ? 'Target Market' : '目标市场'}
                  </label>
                  <select
                    className="input appearance-none"
                    value={form.targetMarket}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, targetMarket: e.target.value }))
                    }
                  >
                    {TARGET_MARKETS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {getMarketLabel(m.value, locale)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!form.productName.trim()}
                  className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiZap className="h-4 w-4" />
                  {locale === 'en' ? 'Generate' : '开始生成'}
                </button>
              </div>
            )}

            {step === 'loading' && (
              <div className="flex flex-col items-center py-12">
                <FiLoader className="mb-4 h-10 w-10 animate-spin text-brand-400" />
                <p className="text-base font-medium text-gray-700">
                  {locale === 'en' ? 'Generating...' : '正在生成...'}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {locale === 'en'
                    ? 'AI is analyzing product info to create the best script'
                    : 'AI正在分析商品信息并创作最佳脚本'}
                </p>
              </div>
            )}

            {step === 'result' && (
              <div>
                {/* Success indicator */}
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    {isTyping
                      ? locale === 'en'
                        ? 'Generating script...'
                        : '脚本生成中...'
                      : locale === 'en'
                        ? 'Script generated, ready to use'
                        : '脚本生成完成，可直接使用'}
                  </span>
                </div>

                {/* Script content with typing effect */}
                <div className="mb-4 max-h-[320px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                  {renderScriptContent()}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={isTyping}
                    className="btn-outline flex flex-1 items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FiCopy className="h-4 w-4" />
                    {locale === 'en' ? 'Copy Script' : '复制脚本'}
                  </button>
                  <button
                    disabled
                    className="btn-primary flex flex-1 items-center justify-center gap-2 cursor-not-allowed opacity-50"
                    title={locale === 'en' ? 'Coming soon' : '即将上线'}
                  >
                    <FiPlay className="h-4 w-4" />
                    {locale === 'en' ? 'Generate Video' : '生成视频'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="btn-outline flex flex-1 items-center justify-center gap-2"
                  >
                    {locale === 'en' ? 'Done' : '完成'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
