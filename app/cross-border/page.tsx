'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '@/app/contexts/ToastContext'
import { FiCamera, FiUser } from 'react-icons/fi'
import { PLATFORMS, COUNTRY_NAMES } from './constants'
import type { Step, UploadedPhoto, SellPointResult, DetailImage } from './types'
import StepNavigator from './components/StepNavigator'
import StepUpload from './components/StepUpload'
import StepConfig from './components/StepConfig'
import StepGenerate from './components/StepGenerate'
import StepResult from './components/StepResult'

export default function CrossBorderPage() {
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('upload')
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [platform, setPlatform] = useState('shopee')
  const [country, setCountry] = useState('SG')
  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [selectedImageTypes, setSelectedImageTypes] = useState<string[]>(['main', 'scene'])
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [sellPoints, setSellPoints] = useState<SellPointResult | null>(null)
  const [detailImages, setDetailImages] = useState<DetailImage[]>([])
  const [videoTaskId, setVideoTaskId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [editedSellPoints, setEditedSellPoints] = useState<string[]>([])
  const [error, setError] = useState('')

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPhotos = files.map(f => ({
      id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      file: f, preview: URL.createObjectURL(f),
    }))
    setPhotos(prev => [...prev, ...newPhotos])
  }

  const removePhoto = (id: string) => { setPhotos(prev => prev.filter(p => p.id !== id)) }
  const toggleImageType = (id: string) => {
    setSelectedImageTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const generateSellPoints = async () => {
    if (!productName.trim()) { showToast('请先填写商品名称', 'warning'); return }
    setLoading(true); setStatusMessage('AI 正在生成多语言卖点...'); setError('')
    try {
      const res = await fetch('/api/cross-border', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'sell-points', platform, country, product: { name: productName, description: productDesc, category: 'electronics' } }) })
      const data = await res.json()
      if (data.success && data.data) { setSellPoints(data.data); setEditedSellPoints(data.data.sellPoints || []); showToast('卖点文案已生成', 'success') }
      else setError(data.error || '生成失败')
    } catch (e) { setError(e instanceof Error ? e.message : '网络错误') }
    setLoading(false); setStatusMessage('')
  }

  const generateImages = async () => {
    if (selectedImageTypes.length === 0) { showToast('请至少选择一种图片类型', 'warning'); return }
    setLoading(true); setStatusMessage(`正在生成 ${selectedImageTypes.length} 张详情图...`); setError('')
    try {
      const res = await fetch('/api/cross-border', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'detail-images', platform, country, imageTypes: selectedImageTypes, product: { name: productName, description: productDesc } }) })
      const data = await res.json()
      if (data.success && data.data) { setDetailImages(data.data); showToast('详情图已生成', 'success') }
      else setError(data.error || '生成失败')
    } catch (e) { setError(e instanceof Error ? e.message : '网络错误') }
    setLoading(false); setStatusMessage('')
  }

  const generateVideo = async () => {
    setLoading(true); setStatusMessage('正在排队生成视频（约 2-3 分钟）...'); setError('')
    try {
      const res = await fetch('/api/cross-border', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'video', platform, country, product: { name: productName, description: productDesc }, sellPoints: editedSellPoints }) })
      const data = await res.json()
      if (data.success && data.data) { setVideoTaskId(data.data.taskId || ''); setVideoUrl(data.data.videoUrl || '') }
      else setError(data.error || '生成失败')
    } catch (e) { setError(e instanceof Error ? e.message : '网络错误') }
    setLoading(false); setStatusMessage('')
  }

  const resetAll = () => {
    setStep('upload'); setPhotos([]); setProductName(''); setProductDesc('');
    setSellPoints(null); setEditedSellPoints([]); setDetailImages([]);
    setVideoTaskId(''); setVideoUrl(''); setError('');
  }

  const copySellPoints = () => {
    const text = [`Title: ${sellPoints?.title || ''}`, '', ...(editedSellPoints || []).map((s, i) => `${i + 1}. ${s}`), '', `Description: ${sellPoints?.description || ''}`, `Keywords: ${sellPoints?.keywords || ''}`].join('\n')
    navigator.clipboard.writeText(text); showToast('文案已复制', 'success')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
        <Breadcrumb items={[{ label: '懒老板', href: '/' }, { label: '跨境电商 AI 工具' }]} />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">

        {step !== 'result' && <StepNavigator step={step} loading={loading} onStepChange={setStep} />}

        {step === 'upload' && (
          <StepUpload photos={photos} onPhotosAdd={handlePhotos} onPhotoRemove={removePhoto}
            onNext={() => setStep('config')} />
        )}

        {step === 'config' && (
          <StepConfig
            platform={platform} country={country} productName={productName} productDesc={productDesc}
            onPlatformChange={(p, c) => { setPlatform(p); setCountry(c) }}
            onCountryChange={setCountry} onProductNameChange={setProductName} onProductDescChange={setProductDesc}
            onBack={() => setStep('upload')} onNext={() => setStep('generate')} />
        )}

        {step === 'generate' && (
          <StepGenerate
            platform={platform} country={country} loading={loading} statusMessage={statusMessage} error={error}
            sellPoints={sellPoints} editedSellPoints={editedSellPoints} detailImages={detailImages} videoUrl={videoUrl}
            selectedImageTypes={selectedImageTypes}
            onSellPointEdit={(i, v) => { const next = [...editedSellPoints]; next[i] = v; setEditedSellPoints(next) }}
            onToggleImageType={toggleImageType}
            onGenerateSellPoints={generateSellPoints} onGenerateImages={generateImages} onGenerateVideo={generateVideo}
            onCopySellPoints={copySellPoints}
            onBack={() => setStep('config')} onNext={() => setStep('result')} />
        )}

        {step === 'result' && (
          <StepResult
            platform={platform} country={country} sellPoints={sellPoints} editedSellPoints={editedSellPoints}
            detailImages={detailImages} videoUrl={videoUrl}
            onCopy={copySellPoints} onReset={resetAll} onBackToGenerate={() => setStep('generate')} />
        )}

        {step !== 'result' && (
          <div className="mt-8 rounded-2xl bg-gradient-to-b from-brand-50 to-white border border-brand-100/50 p-6 text-center">
            <p className="text-sm font-semibold text-gray-900">支持平台</p>
            <p className="text-xs text-gray-400 mt-1">Shopee · Amazon · OZON · TikTok Shop · Shopify · TEMU · Lazada · AliExpress · 语言自动适配目标国家</p>
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/ai-video" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"><FiCamera className="h-3 w-3" /> 一键短视频</Link>
              <Link href="/digital-human" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"><FiUser className="h-3 w-3" /> 数字人口播</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
