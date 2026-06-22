'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '../contexts/ToastContext'
import { renderPromotionVideo } from '@/lib/video-renderer'
import RemotionPreview from '@/components/RemotionPreview'
import {
  FiUpload, FiTrash2, FiCheck, FiPlay, FiDownload, FiGlobe,
  FiUser, FiVideo, FiCamera, FiZap, FiChevronLeft, FiChevronRight,
  FiRefreshCw, FiLoader, FiCheckCircle, FiXCircle, FiStar,
  FiPlus, FiImage, FiX,
} from 'react-icons/fi'

/* ─────────────────── Types ─────────────────── */

interface UploadedFile {
  id: string
  file: File
  preview: string
  type: 'photo' | 'video' | 'logo'
}

interface GenerationResult {
  language: string
  languageLabel: string
  videoUrl: string
  status: 'pending' | 'processing' | 'done' | 'error'
}

type Style = 'professional' | 'social' | 'tech' | 'sincere'
type DigitalHumanMode = 'none' | 'pip' | 'handhold'
type DigitalHumanGender = 'male' | 'female'

/* ─────────────────── Constants ─────────────────── */

const STYLES: { key: Style; label: string; desc: string; image: string }[] = [
  { key: 'professional', label: '专业商务', desc: '正式、专业、可信赖，适合B2B企业宣传', image: '/images/brand-promotion/style-professional.jpg' },
  { key: 'social', label: '社交热辣', desc: '活泼、吸睛、节奏快，适合TikTok/抖音带货', image: '/images/brand-promotion/style-social.jpg' },
  { key: 'tech', label: '科技感', desc: '未来感、极简、炫酷，适合科技产品与创新品牌', image: '/images/brand-promotion/style-tech.jpg' },
  { key: 'sincere', label: '朴实真诚', desc: '温暖、真实、接地气，适合工厂/手艺人/老字号', image: '/images/brand-promotion/style-sincere.jpg' },
]

const LANGUAGES: { key: string; flagCode: string; label: string }[] = [
  { key: 'zh', flagCode: 'cn', label: '简体中文' },
  { key: 'zh-tw', flagCode: 'tw', label: '繁体中文' },
  { key: 'en', flagCode: 'gb', label: '英语' },
  { key: 'ja', flagCode: 'jp', label: '日语' },
  { key: 'ko', flagCode: 'kr', label: '韩语' },
  { key: 'fr', flagCode: 'fr', label: '法语' },
  { key: 'de', flagCode: 'de', label: '德语' },
  { key: 'es', flagCode: 'es', label: '西班牙语' },
  { key: 'pt', flagCode: 'pt', label: '葡萄牙语' },
  { key: 'ru', flagCode: 'ru', label: '俄语' },
  { key: 'it', flagCode: 'it', label: '意大利语' },
  { key: 'ar', flagCode: 'sa', label: '阿拉伯语' },
  { key: 'th', flagCode: 'th', label: '泰语' },
  { key: 'vi', flagCode: 'vn', label: '越南语' },
  { key: 'id', flagCode: 'id', label: '印尼语' },
]

const DIGITAL_HUMAN_MODES: { key: DigitalHumanMode; label: string; desc: string; image: string }[] = [
  { key: 'none', label: '无数字人', desc: '纯产品展示 + AI配音，适合快速出片', image: '/images/brand-promotion/dh-none.jpg' },
  { key: 'pip', label: '画中画口播', desc: '数字人站姿讲解，产品以画中画形式展示', image: '/images/brand-promotion/dh-pip.jpg' },
  { key: 'handhold', label: '手持产品讲解', desc: '数字人手持产品展示讲解（需额外服务）', image: '/images/brand-promotion/dh-handhold.jpg' },
]

const DURATIONS = [60, 90, 120]

const PROGRESS_STEPS = [
  '正在生成文案…',
  '正在翻译多语言版本…',
  '正在生成配音…',
  '正在合成视频…',
  '正在生成数字人…',
]

function langLabel(key: string): string {
  return LANGUAGES.find(l => l.key === key)?.label || key
}

function splitIntoSlogans(text: string): string[] {
  // Split by sentence boundaries for various languages
  // Chinese: split by 。！？；， then filter
  // Other languages: split by .!?;\n then filter
  if (/[一-鿿㐀-䶿]/.test(text)) {
    // CJK text — split by sentence-ending punctuation
    const raw = text.split(/[。！？；，\n]+/).map(s => s.trim()).filter(Boolean)
    // If too few, split further by comma/space for shorter phrases
    if (raw.length <= 2) {
      return text.split(/[，,，\n]+/).map(s => s.trim()).filter(s => s.length > 2)
    }
    return raw
  }
  // Latin text — split by sentence boundaries
  const raw = text.split(/[.!?;]\s+/).map(s => s.trim()).filter(Boolean)
  if (raw.length <= 2) {
    return text.split(/[,;\n]+/).map(s => s.trim()).filter(s => s.length > 2)
  }
  return raw
}

/* ─────────────────── Component ─────────────────── */

export default function BrandPromotionPage() {
  const toast = useToast()

  // Step
  const [step, setStep] = useState(1)

  // Step 1 — Upload
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [productName, setProductName] = useState('')
  const [sellingPoints, setSellingPoints] = useState('')
  const [dragOver, setDragOver] = useState(false)

  // Step 2 — Config
  const [style, setStyle] = useState<Style>('professional')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['zh', 'en'])
  const [digitalHumanMode, setDigitalHumanMode] = useState<DigitalHumanMode>('none')
  const [digitalHumanGender, setDigitalHumanGender] = useState<DigitalHumanGender>('male')
  const [duration, setDuration] = useState(60)

  // Step 3 — Generate
  const [isGenerating, setIsGenerating] = useState(false)
  const [progressStep, setProgressStep] = useState(-1)
  const [results, setResults] = useState<GenerationResult[]>([])
  const [activeLangIdx, setActiveLangIdx] = useState(0)
  const [error, setError] = useState('')
  const [renderedVideo, setRenderedVideo] = useState<string | null>(null) // Blob URL
  const [isDownloading, setIsDownloading] = useState(false)

  // Refs
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  /* ─── Helpers ─── */

  const generateId = () => Math.random().toString(36).slice(2, 10)

  const addFiles = useCallback((incoming: FileList | null, type: UploadedFile['type']) => {
    if (!incoming) return
    const newFiles: UploadedFile[] = []
    for (let i = 0; i < incoming.length; i++) {
      const file = incoming[i]
      newFiles.push({
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
        type,
      })
    }
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const target = prev.find(f => f.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter(f => f.id !== id)
    })
  }, [])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview))
      if (renderedVideo) URL.revokeObjectURL(renderedVideo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ─── Drag & Drop ─── */

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dataTransfer = e.dataTransfer
    if (dataTransfer.files && dataTransfer.files.length > 0) {
      // Guess type by first file's MIME
      const first = dataTransfer.files[0]
      const type: UploadedFile['type'] = first.type.startsWith('video/') ? 'video' : 'photo'
      addFiles(dataTransfer.files, type)
    }
  }

  /* ─── Language toggle ─── */

  const toggleLanguage = (key: string) => {
    setSelectedLanguages(prev =>
      prev.includes(key) ? prev.filter(l => l !== key) : [...prev, key]
    )
  }

  /* ─── Step navigation ─── */

  const canGoNext = () => {
    if (step === 1) return files.length > 0
    if (step === 2) return selectedLanguages.length > 0
    return true
  }

  /* ─── Generate ─── */

  const handleGenerate = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    setError('')
    setProgressStep(0)
    setResults([])
    if (renderedVideo) {
      URL.revokeObjectURL(renderedVideo)
      setRenderedVideo(null)
    }

    try {
      // Step 1 — Upload files
      setProgressStep(0)
      const formData = new FormData()
      files.forEach(f => {
        const key = f.type === 'photo' ? 'photos' : f.type === 'video' ? 'videos' : 'logo'
        formData.append(key, f.file)
      })
      formData.append('productName', productName)
      formData.append('sellingPoints', sellingPoints)

      const uploadRes = await fetch('/api/brand-promotion/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('上传失败')
      const uploadData = await uploadRes.json()

      // Step 2 — Generate scripts
      setProgressStep(1)
      const scriptRes = await fetch('/api/brand-promotion/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          sellingPoints,
          style,
          languages: selectedLanguages,
          filePaths: uploadData.files,
        }),
      })
      if (!scriptRes.ok) throw new Error('文案生成失败')
      const scriptData = await scriptRes.json()

      // Step 3 — TTS for each language
      setProgressStep(2)
      const ttsResults: Record<string, string> = {} // audio blob URLs
      for (const lang of selectedLanguages) {
        const ttsRes = await fetch('/api/brand-promotion/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: scriptData.scripts[lang],
            language: lang,
            voiceStyle: style,
          }),
        })
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json()
          // Convert base64 to blob URL if audioData present, or use url if present
          if (ttsData.audioData) {
            const byteChars = atob(ttsData.audioData)
            const byteNums = new Uint8Array(byteChars.length)
            for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i)
            const audioBlob = new Blob([byteNums], { type: 'audio/mp3' })
            ttsResults[lang] = URL.createObjectURL(audioBlob)
          } else if (ttsData.audioUrl) {
            ttsResults[lang] = ttsData.audioUrl
          }
        }
      }

      // Step 4 — Prepare preview data (RemotionPreview handles real-time display)
      setProgressStep(3)

      const mainLang = selectedLanguages[0]

      // Extract slogans from the generated script text
      const mainScript = scriptData.scripts[mainLang] || ''
      const sloganLines = splitIntoSlogans(mainScript)

      // Store slogans globally for RemotionPreview to access
      ;(window as any).__lastSlogans = sloganLines

      // Build results — each language uses TTS audio URL (RemotionPreview + server render handle video)
      const genResults: GenerationResult[] = selectedLanguages.map(lang => ({
        language: lang,
        languageLabel: langLabel(lang),
        videoUrl: ttsResults[lang] || '',
        status: ttsResults[lang] ? 'done' : 'error',
      }))
      setResults(genResults)

      // Step 5 — Digital human (if enabled)
      if (digitalHumanMode !== 'none') {
        setProgressStep(4)
        // Digital human integration placeholder — would call Agnes API
        await new Promise(r => setTimeout(r, 500))
      }

      setProgressStep(-1)
      toast?.showToast('视频生成完成！', 'success')
    } catch (err: any) {
      setError(err.message || '生成失败，请重试')
      setProgressStep(-1)
      toast?.showToast('生成失败: ' + (err.message || '未知错误'), 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  /* ─── Active result ─── */

  const activeResult = results[activeLangIdx]

  /* ─── Render helpers ─── */

  const photos = files.filter(f => f.type === 'photo')
  const videos = files.filter(f => f.type === 'video')
  const logos = files.filter(f => f.type === 'logo')

  /* ─────────────────── Render ─────────────────── */

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Breadcrumb
          items={[
            { label: '首页', href: '/' },
            { label: '产品可视化', href: '/brand-promotion' },
          ]}
        />

        {/* Page Title */}
        <div className="mt-4 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-[#FF6034]">产品可视化</span> · AI智能生成产品宣传视频
          </h1>
          <p className="mt-2 text-gray-500">上传产品照片，选择风格与语言，AI全自动生成专业产品展示视频</p>
        </div>

        {/* ─── Step Indicators ─── */}
        <div className="flex items-center justify-center mb-10 gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => { if (s < step || (!isGenerating && s < step)) setStep(s) }}
                disabled={s > step}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${s < step
                    ? 'bg-[#FF6034] text-white cursor-pointer'
                    : s === step
                      ? 'bg-[#FF6034] text-white ring-4 ring-[#FF6034]/20'
                      : 'bg-gray-200 text-gray-400'
                  }
                `}
              >
                {s < step ? <FiCheck size={18} /> : s}
              </button>
              <span className={`text-sm font-medium hidden sm:block ${s <= step ? 'text-gray-800' : 'text-gray-400'}`}>
                {s === 1 ? '上传素材' : s === 2 ? '配置参数' : '生成预览'}
              </span>
              {s < 3 && <div className={`w-12 sm:w-20 h-0.5 mx-1 ${s < step ? 'bg-[#FF6034]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* ─── Step 1: Upload ─── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                ${dragOver
                  ? 'border-[#FF6034] bg-[#FFF0EB]'
                  : 'border-gray-300 bg-white hover:border-[#FF6034]/50 hover:bg-orange-50/30'
                }
              `}
              onClick={() => photoInputRef.current?.click()}
            >
              <FiUpload size={40} className="mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium text-gray-700">拖拽文件到此处，或点击上传</p>
              <p className="text-sm text-gray-400 mt-1">支持 JPG/PNG/MP4/MOV，单文件最大 100MB</p>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={e => addFiles(e.target.files, 'photo')}
              />
            </div>

            {/* Quick Upload Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FF6034]/40 hover:bg-orange-50/30 transition-all"
              >
                <FiCamera size={20} className="text-[#FF6034]" />
                <span className="text-sm font-medium text-gray-700">上传产品照片</span>
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FF6034]/40 hover:bg-orange-50/30 transition-all"
              >
                <FiVideo size={20} className="text-[#FF6034]" />
                <span className="text-sm font-medium text-gray-700">上传产品视频</span>
              </button>
              <button
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FF6034]/40 hover:bg-orange-50/30 transition-all"
              >
                <FiImage size={20} className="text-[#FF6034]" />
                <span className="text-sm font-medium text-gray-700">上传企业Logo</span>
              </button>
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => addFiles(e.target.files, 'video')} />
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => addFiles(e.target.files, 'logo')} />
            </div>

            {/* File Previews */}
            {files.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  已上传素材 ({files.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {files.map(f => (
                    <div key={f.id} className="relative group">
                      {f.type === 'video' ? (
                        <video
                          src={f.preview}
                          className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                          muted
                        />
                      ) : (
                        <img
                          src={f.preview}
                          alt="preview"
                          className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/50 text-white">
                        {f.type === 'photo' ? '照片' : f.type === 'video' ? '视频' : 'Logo'}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#FF6034]/50 hover:bg-orange-50/30 transition-all"
                  >
                    <FiPlus size={24} className="text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Product Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">产品信息（选填，不填则AI自动生成）</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">产品名称</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder="例如：FreshBlend Pro 便携榨汁机"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6034] focus:ring-2 focus:ring-[#FF6034]/15 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">卖点描述</label>
                  <input
                    type="text"
                    value={sellingPoints}
                    onChange={e => setSellingPoints(e.target.value)}
                    placeholder="例如：USB-C充电、30秒鲜榨、304不锈钢刀片"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6034] focus:ring-2 focus:ring-[#FF6034]/15 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canGoNext()}
                className="flex items-center gap-2 px-8 py-3 bg-[#FF6034] text-white rounded-xl font-semibold hover:bg-[#E8552E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                下一步 <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 2: Configure ─── */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Style Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">宣传风格</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {STYLES.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setStyle(s.key)}
                    className={`
                      relative p-3 rounded-xl border-2 text-left transition-all overflow-hidden
                      ${style === s.key
                        ? 'border-[#FF6034] bg-orange-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="relative h-20 rounded-lg overflow-hidden mb-2 bg-gray-100">
                      <img src={s.image} alt={s.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-white text-xs font-bold drop-shadow-sm">{s.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{s.desc}</p>
                    {style === s.key && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-[#FF6034] rounded-full flex items-center justify-center shadow-md">
                        <FiCheck size={13} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                目标语言
                <span className="ml-2 text-xs font-normal text-gray-400">
                  已选 {selectedLanguages.length} 种语言
                </span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {LANGUAGES.map(l => {
                  const selected = selectedLanguages.includes(l.key)
                  return (
                    <button
                      key={l.key}
                      onClick={() => toggleLanguage(l.key)}
                      className={`
                        flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                        ${selected
                          ? 'border-[#FF6034] bg-orange-50 text-[#FF6034]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }
                      `}
                    >
                      <img
                        src={`https://flagcdn.com/w40/${l.flagCode}.png`}
                        alt={l.label}
                        className="w-5 h-auto rounded-sm shadow-sm"
                      />
                      <span className="truncate">{l.label}</span>
                      {selected && <FiCheck size={14} className="ml-auto shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Digital Human Mode */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">数字人模式</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DIGITAL_HUMAN_MODES.map(m => (
                  <button
                    key={m.key}
                    onClick={() => setDigitalHumanMode(m.key)}
                    className={`
                      relative p-3 rounded-xl border-2 text-left transition-all overflow-hidden
                      ${digitalHumanMode === m.key
                        ? 'border-[#FF6034] bg-orange-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="relative h-20 rounded-lg overflow-hidden mb-2 bg-gray-100">
                      <img src={m.image} alt={m.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-white text-xs font-bold drop-shadow-sm">{m.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
                    {digitalHumanMode === m.key && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-[#FF6034] rounded-full flex items-center justify-center shadow-md">
                        <FiCheck size={13} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Digital Human Gender */}
              {digitalHumanMode !== 'none' && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">数字人形象</h4>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDigitalHumanGender('male')}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all
                        ${digitalHumanGender === 'male'
                          ? 'border-[#FF6034] bg-orange-50 text-[#FF6034]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }
                      `}
                    >
                      <img src="/images/brand-promotion/gender-male.jpg" alt="男" className="w-9 h-9 rounded-full object-cover" />
                      <span>男</span>
                      {digitalHumanGender === 'male' && <FiCheck size={14} />}
                    </button>
                    <button
                      onClick={() => setDigitalHumanGender('female')}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all
                        ${digitalHumanGender === 'female'
                          ? 'border-[#FF6034] bg-orange-50 text-[#FF6034]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }
                      `}
                    >
                      <img src="/images/brand-promotion/gender-female.jpg" alt="女" className="w-9 h-9 rounded-full object-cover" />
                      <span>女</span>
                      {digitalHumanGender === 'female' && <FiCheck size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Duration */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">视频时长</h3>
              <div className="flex gap-3">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`
                      px-6 py-3 rounded-xl border-2 font-medium text-sm transition-all
                      ${duration === d
                        ? 'border-[#FF6034] bg-orange-50 text-[#FF6034]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    {d}秒
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                <FiChevronLeft size={18} /> 上一步
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canGoNext()}
                className="flex items-center gap-2 px-8 py-3 bg-[#FF6034] text-white rounded-xl font-semibold hover:bg-[#E8552E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                下一步 <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Generate & Preview ─── */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Config Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">生成配置确认</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">素材数量</span>
                  <p className="font-medium text-gray-800">{files.length} 个文件</p>
                </div>
                <div>
                  <span className="text-gray-400">宣传风格</span>
                  <p className="font-medium text-gray-800">{STYLES.find(s => s.key === style)?.label}</p>
                </div>
                <div>
                  <span className="text-gray-400">目标语言</span>
                  <p className="font-medium text-gray-800">{selectedLanguages.length} 种</p>
                </div>
                <div>
                  <span className="text-gray-400">视频时长</span>
                  <p className="font-medium text-gray-800">{duration}秒</p>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            {!isGenerating && results.length === 0 && !error && (
              <div className="text-center py-8">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-3 px-12 py-4 bg-[#FF6034] text-white rounded-2xl font-bold text-lg hover:bg-[#E8552E] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF6034]/25 transition-all hover:shadow-xl hover:shadow-[#FF6034]/30 active:scale-[0.98]"
                >
                  <FiZap size={22} />
                  开始生成
                </button>
                <p className="mt-3 text-sm text-gray-400">AI将自动完成文案、翻译、配音、合成全流程</p>
              </div>
            )}

            {/* Generating Progress */}
            {isGenerating && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <FiLoader size={36} className="mx-auto mb-4 text-[#FF6034] animate-spin" />
                <h3 className="text-lg font-semibold text-gray-800 mb-4">正在生成中…</h3>
                <div className="max-w-md mx-auto space-y-2">
                  {PROGRESS_STEPS.map((label, idx) => {
                    const state: 'done' | 'active' | 'pending' =
                      idx < progressStep ? 'done' : idx === progressStep ? 'active' : 'pending'
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          state === 'active'
                            ? 'bg-orange-50 text-[#FF6034]'
                            : state === 'done'
                              ? 'text-gray-400'
                              : 'text-gray-300'
                        }`}
                      >
                        {state === 'done' ? (
                          <FiCheckCircle size={16} className="text-green-500 shrink-0" />
                        ) : state === 'active' ? (
                          <FiLoader size={16} className="animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                        )}
                        {label}
                      </div>
                    )
                  })}
                </div>
                {/* Progress bar */}
                <div className="max-w-md mx-auto mt-6">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF6034] rounded-full transition-all duration-500"
                      style={{ width: `${((progressStep + 1) / PROGRESS_STEPS.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 rounded-2xl p-6 border border-red-200 text-center">
                <FiXCircle size={28} className="mx-auto mb-2 text-red-500" />
                <p className="text-red-700 font-medium">{error}</p>
                <button
                  onClick={handleGenerate}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all"
                >
                  <FiRefreshCw size={16} /> 重新生成
                </button>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <>
                {/* Language Tabs */}
                <div className="flex flex-wrap gap-2">
                  {results.map((r, idx) => (
                    <button
                      key={r.language}
                      onClick={() => setActiveLangIdx(idx)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                        ${activeLangIdx === idx
                          ? 'bg-[#FF6034] text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }
                      `}
                    >
                      <FiGlobe size={14} />
                      {r.languageLabel}
                      {r.status === 'done' && <FiCheckCircle size={14} />}
                      {r.status === 'error' && <FiXCircle size={14} />}
                    </button>
                  ))}
                </div>

                {/* Remotion Preview */}
                {photos.length > 0 && (
                  <RemotionPreview
                    photos={photos.map(f => f.preview)}
                    productName={productName || 'Product'}
                    slogans={
                      (() => {
                        // Use generated slogans if available, otherwise use placeholder
                        const mainLang = selectedLanguages[0]
                        const mainResult = results.find(r => r.language === mainLang)
                        if (mainResult && activeResult) {
                          const scriptText = mainResult.status === 'done' ? '' : ''
                          // slogans are computed during generate — stored on window or derived
                          const lines = (window as any).__lastSlogans as string[] | undefined
                          if (lines && lines.length > 0) return lines
                        }
                        return sellingPoints
                          ? sellingPoints.split(/[,，]/).map(s => s.trim()).filter(Boolean)
                          : [productName || 'Your Brand Story']
                      })()
                    }
                    audioUrl={
                      activeResult?.status === 'done' && activeResult.videoUrl && !activeResult.videoUrl.startsWith('blob:')
                        ? activeResult.videoUrl
                        : activeResult?.videoUrl || undefined
                    }
                    logoUrl={logos[0]?.preview}
                    language={activeResult?.language || selectedLanguages[0]}
                    duration={duration}
                  />
                )}

                {activeResult && activeResult.status === 'error' && (
                  <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200 text-center">
                    <p className="text-yellow-700 font-medium">
                      {activeResult.languageLabel} 版本生成失败，请重试
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    disabled={isDownloading || results.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-[#FF6034] text-white rounded-xl font-semibold hover:bg-[#E8552E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    onClick={async () => {
                      if (isDownloading || results.length === 0) return
                      setIsDownloading(true)
                      try {
                        const sloganLines = (window as any).__lastSlogans as string[] || []
                        const audioUrl = activeResult?.videoUrl || undefined
                        const photoUrls = files.filter(f => f.type === 'photo').map(f => f.preview)

                        if (photoUrls.length === 0) {
                          throw new Error('没有可用的产品照片')
                        }

                        // Use Canvas-based renderer for download (produces WebM, client-side)
                        const videoBlob = await renderPromotionVideo({
                          photos: photoUrls,
                          audioUrl: audioUrl || '',
                          productName: productName || 'Product',
                          slogans: sloganLines.length > 0 ? sloganLines : [productName || 'Brand Story'],
                          duration,
                          logoUrl: logos[0]?.preview,
                          language: activeResult?.language || 'zh',
                        })

                        // Trigger download
                        const url = URL.createObjectURL(videoBlob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `brand-promotion-${activeResult?.language || 'zh'}.webm`
                        a.click()
                        URL.revokeObjectURL(url)
                        toast?.showToast('视频下载已开始！', 'success')
                      } catch (downloadErr: unknown) {
                        const msg = downloadErr instanceof Error ? downloadErr.message : '下载失败'
                        toast?.showToast('下载失败: ' + msg, 'error')
                      } finally {
                        setIsDownloading(false)
                      }
                    }}
                  >
                    {isDownloading ? (
                      <><FiLoader size={18} className="animate-spin" /> 渲染中…</>
                    ) : (
                      <><FiDownload size={18} /> 下载视频 (MP4)</>
                    )}
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FiRefreshCw size={18} /> 重新生成
                  </button>
                </div>

                {/* Back to Step 2 */}
                <div className="text-center">
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-gray-400 hover:text-gray-600 underline"
                  >
                    修改配置
                  </button>
                </div>
              </>
            )}

            {/* Back button when no results yet */}
            {!isGenerating && results.length === 0 && !error && (
              <div className="flex justify-center">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  <FiChevronLeft size={18} /> 返回修改配置
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
