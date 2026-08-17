'use client'
import { useState, useEffect } from 'react'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '@/app/contexts/ToastContext'
import PhotoUpload from './components/PhotoUpload'
import AvatarGenerate from './components/AvatarGenerate'
import ProductPicker from './components/ProductPicker'
import TemplatePicker from './components/TemplatePicker'
import PreviewResult from './components/PreviewResult'
import EngineSelector from './components/EngineSelector'
import RechargeModal from './components/RechargeModal'
import { fetchEngines, fetchBilling, fetchAvatars, getAuthHeaders, type EngineInfo, type AvatarInfo, type BillingInfo } from './lib'

type Step = 'photo' | 'avatar' | 'product' | 'template' | 'preview'

export default function ClonePage() {
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('photo')
  const [photos, setPhotos] = useState<string[]>([])
  const [avatar, setAvatar] = useState<AvatarInfo | null>(null)
  const [productImage, setProductImage] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [templateId, setTemplateId] = useState('owner_product')
  const [previewUrl, setPreviewUrl] = useState('')
  const [freeMode, setFreeMode] = useState(false) // 免费额度生成 → 加水印
  const [watermarkSeed, setWatermarkSeed] = useState(0)
  const [engines, setEngines] = useState<EngineInfo[]>([])
  const [engineId, setEngineId] = useState('')
  const [billing, setBilling] = useState<BillingInfo>({ freeUsed: 0, balance: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rechargeOpen, setRechargeOpen] = useState(false)

  const activeEngine = engines.find(e => e.id === engineId) || engines[0]
  const balanceUsed = billing.freeUsed >= 3

  useEffect(() => {
    fetchEngines().then(list => {
      setEngines(list)
      const saved = localStorage.getItem('clone_engine')
      const active = list.find(e => e.id === saved && e.status === 'active')
      setEngineId(active?.id || list.find(e => e.status === 'active')?.id || '')
    })
    fetchAvatars().then(list => {
      if (list.length > 0) {
        setAvatar({ id: list[0].id, name: list[0].name, avatarUrl: list[0].avatarUrl, engine: list[0].engine, status: list[0].status })
        setStep('avatar')
      }
    })
  }, [])

  const refreshBilling = () => fetchBilling().then(setBilling)

  const handleGenerateAvatar = async () => {
    if (photos.length === 0) { showToast('请先上传照片', 'error'); return }
    setLoading(true); setError('')
    try {
      const fd = new FormData()
      photos.forEach(p => fd.append('photos', p))
      if (engineId) fd.append('engine', engineId)
      const res = await fetch('/api/clone/avatar', { method: 'POST', headers: await getAuthHeaders(), body: fd })
      const data = await res.json()
      if (!data.success) { setError(data.error || '生成失败'); showToast(data.error || '生成失败', 'error'); return }
      setAvatar({ id: data.data.id, name: '我的分身', avatarUrl: data.data.url, engine: engineId, status: 'ready' })
      setFreeMode(data.data.mode === 'free')
      setWatermarkSeed(Date.now() % 100000)
      const avatars = await fetchAvatars()
      if (avatars.length > 0) setAvatar({ id: avatars[0].id, name: avatars[0].name, avatarUrl: avatars[0].avatarUrl, engine: avatars[0].engine, status: avatars[0].status })
      refreshBilling()
      showToast('克隆分身生成成功！', 'success')
      setStep('product')
    } finally { setLoading(false) }
  }

  const handleGeneratePreview = async () => {
    if (!avatar) { showToast('请先生成分身', 'error'); return }
    setLoading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('avatarUrl', avatar.avatarUrl)
      if (productImage) fd.append('productImage', productImage)
      if (productDesc) fd.append('productDesc', productDesc)
      fd.append('template', templateId)
      if (engineId) fd.append('engine', engineId)
      const res = await fetch('/api/clone/preview', { method: 'POST', headers: await getAuthHeaders(), body: fd })
      const data = await res.json()
      if (!data.success) {
        if (data.error === '余额不足，请先充值') setRechargeOpen(true)
        setError(data.error || '生成失败'); showToast(data.error || '生成失败', 'error'); return
      }
      setPreviewUrl(data.data.url)
      setFreeMode(data.data.mode === 'free')
      setWatermarkSeed(Date.now() % 100000)
      refreshBilling()
      showToast('预览图生成成功！', 'success')
      setStep('preview')
    } finally { setLoading(false) }
  }

  const changeEngine = (id: string) => {
    setEngineId(id)
    localStorage.setItem('clone_engine', id)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
        <Breadcrumb items={[{ label: '懒老板', href: '/' }, { label: '老板克隆分身' }]} />
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">

        {/* 顶部：余额 + 引擎切换 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">算力余额</span>
            <span className="text-2xl font-bold text-[#FF6034]">¥{billing.balance.toFixed(1)}</span>
            <button onClick={() => setRechargeOpen(true)} className="px-3 py-1.5 rounded-lg bg-[#FF6034] text-white text-sm font-medium hover:opacity-90">
              充值
            </button>
          </div>
          <EngineSelector engines={engines} engineId={engineId} onChange={changeEngine} />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}

        {/* 克隆形象库（克隆人库） */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm">我的克隆形象库</p>
            <span className="text-xs text-gray-400">{avatars.length} 个形象</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {avatars.map(a => (
              <div key={a.id} className="shrink-0 w-20 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.avatarUrl} alt={a.name} className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                <p className="text-[10px] text-gray-500 mt-1 truncate">{a.name}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            两种方式采集你的形象：<span className="text-gray-600">传照片</span>（简单，生成分身） ·
            <span className="text-gray-600">录 1-3 分钟视频</span>（更真实，会说话有姿态 · MiniMax 接入后开放）
          </p>
        </div>

        {step === 'photo' && (
          <PhotoUpload photos={photos} onPhotosChange={setPhotos}
            onNext={() => setStep('avatar')} hasAvatar={!!avatar} onUseExisting={() => setStep('product')} />
        )}
        {step === 'avatar' && (
          <AvatarGenerate photos={photos} avatar={avatar} loading={loading} balanceUsed={balanceUsed}
            enginePrice={activeEngine?.pricePerImage || 0} showWatermark={freeMode} watermarkSeed={watermarkSeed}
            onGenerate={handleGenerateAvatar} onBack={() => setStep('photo')} onNext={() => setStep('product')} />
        )}
        {step === 'product' && (
          <ProductPicker productImage={productImage} productDesc={productDesc} hasAvatar={!!avatar}
            onImageChange={setProductImage} onDescChange={setProductDesc}
            onBack={() => setStep('avatar')} onNext={() => setStep('template')} />
        )}
        {step === 'template' && (
          <TemplatePicker templateId={templateId} hasProduct={!!productImage}
            onSelect={setTemplateId} onBack={() => setStep('product')}
            onGenerate={handleGeneratePreview} loading={loading} balanceUsed={balanceUsed}
            enginePrice={activeEngine?.pricePerImage || 0} />
        )}
        {step === 'preview' && (
          <PreviewResult previewUrl={previewUrl} productDesc={productDesc} showWatermark={freeMode} watermarkSeed={watermarkSeed}
            onReset={() => { setStep('template'); setPreviewUrl('') }}
            onRegenerate={handleGeneratePreview} loading={loading} />
        )}

        <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} onRecharged={refreshBilling} />
      </div>
    </div>
  )
}
