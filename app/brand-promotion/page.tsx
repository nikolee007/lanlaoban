'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '../contexts/ToastContext'
import { renderPromotionVideo } from '@/lib/video-renderer'
import { FiCheck } from 'react-icons/fi'
import type { UploadedFile, GenerationResult, Style, DigitalHumanMode, DigitalHumanGender } from './components/types'
import UploadStep from './components/UploadStep'
import ConfigStep from './components/ConfigStep'
import PreviewStep from './components/PreviewStep'
import { langLabel, splitIntoSlogans } from './components/helpers'

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
      ;(window as Window & { __lastSlogans?: string[] }).__lastSlogans = sloganLines

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '生成失败，请重试'
      setError(message)
      setProgressStep(-1)
      toast?.showToast('生成失败: ' + (err instanceof Error ? err.message : '未知错误'), 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  /* ─── Download handler ─── */

  const handleDownload = async () => {
    if (isDownloading || results.length === 0) return
    setIsDownloading(true)
    try {
      const sloganLines = (window as Window & { __lastSlogans?: string[] }).__lastSlogans || []
      const audioUrl = results[activeLangIdx]?.videoUrl || undefined
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
        language: results[activeLangIdx]?.language || 'zh',
      })

      // Trigger download
      const url = URL.createObjectURL(videoBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `brand-promotion-${results[activeLangIdx]?.language || 'zh'}.webm`
      a.click()
      URL.revokeObjectURL(url)
      toast?.showToast('视频下载已开始！', 'success')
    } catch (downloadErr: unknown) {
      const msg = downloadErr instanceof Error ? downloadErr.message : '下载失败'
      toast?.showToast('下载失败: ' + msg, 'error')
    } finally {
      setIsDownloading(false)
    }
  }

  /* ─── Derived values ─── */

  const photos = files.filter(f => f.type === 'photo')
  const logos = files.filter(f => f.type === 'logo')

  /* ─── Computed ─── */

  const canGoNextStep1 = files.length > 0
  const canGoNextStep2 = selectedLanguages.length > 0

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
          <UploadStep
            files={files}
            dragOver={dragOver}
            productName={productName}
            sellingPoints={sellingPoints}
            photoInputRef={photoInputRef}
            videoInputRef={videoInputRef}
            logoInputRef={logoInputRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onAddFiles={addFiles}
            onRemoveFile={removeFile}
            onProductNameChange={setProductName}
            onSellingPointsChange={setSellingPoints}
            onNext={() => setStep(2)}
            canGoNext={canGoNextStep1}
          />
        )}

        {/* ─── Step 2: Configure ─── */}
        {step === 2 && (
          <ConfigStep
            style={style}
            selectedLanguages={selectedLanguages}
            digitalHumanMode={digitalHumanMode}
            digitalHumanGender={digitalHumanGender}
            duration={duration}
            onStyleChange={setStyle}
            onToggleLanguage={toggleLanguage}
            onDigitalHumanModeChange={setDigitalHumanMode}
            onDigitalHumanGenderChange={setDigitalHumanGender}
            onDurationChange={setDuration}
            onPrev={() => setStep(1)}
            onNext={() => setStep(3)}
            canGoNext={canGoNextStep2}
          />
        )}

        {/* ─── Step 3: Generate & Preview ─── */}
        {step === 3 && (
          <PreviewStep
            files={files}
            photos={photos}
            logos={logos}
            productName={productName}
            sellingPoints={sellingPoints}
            style={style}
            selectedLanguages={selectedLanguages}
            digitalHumanMode={digitalHumanMode}
            duration={duration}
            isGenerating={isGenerating}
            progressStep={progressStep}
            results={results}
            activeLangIdx={activeLangIdx}
            error={error}
            isDownloading={isDownloading}
            onGenerate={handleGenerate}
            onSetActiveLangIdx={setActiveLangIdx}
            onDownload={handleDownload}
            onRetry={handleGenerate}
            onModifyConfig={() => setStep(2)}
            onBackToStep2={() => setStep(2)}
          />
        )}
      </div>
    </div>
  )
}
