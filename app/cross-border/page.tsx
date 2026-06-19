'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '@/app/contexts/ToastContext'
import {
  FiCamera, FiUpload, FiGlobe, FiZap, FiChevronLeft, FiDownload,
  FiArrowRight, FiCheck, FiRefreshCw, FiGrid, FiImage, FiVideo,
  FiShoppingCart, FiTag, FiDollarSign, FiEdit3, FiTrash2, FiStar,
  FiCopy, FiPackage, FiUser, FiPlay,
} from 'react-icons/fi'

type Step = 'upload' | 'config' | 'generate' | 'result'

interface UploadedPhoto {
  id: string
  file: File
  preview: string
}

interface SellPointResult {
  title: string
  sellPoints: string[]
  description: string
  keywords: string
}

interface DetailImage {
  type: string
  label: string
  url: string
}

const PLATFORMS = [
  { id: 'shopee', name: 'Shopee', countries: ['SG', 'MY', 'TH', 'VN', 'PH', 'ID', 'TW', 'BR', 'MX', 'CO', 'CL'] },
  { id: 'amazon', name: 'Amazon', countries: ['US', 'UK', 'DE', 'FR', 'IT', 'ES', 'JP', 'CA', 'AU', 'MX', 'BR'] },
  { id: 'ozon', name: 'OZON', countries: ['RU', 'BY', 'KZ'] },
  { id: 'tiktok', name: 'TikTok Shop', countries: ['US', 'UK', 'ID', 'TH', 'VN', 'PH', 'MY', 'SG'] },
  { id: 'shopify', name: 'Shopify（独立站）', countries: ['US', 'UK', 'CA', 'AU', 'DE', 'FR'] },
  { id: 'temu', name: 'TEMU', countries: ['US', 'UK', 'DE', 'FR', 'IT', 'ES', 'JP', 'KR'] },
  { id: 'lazada', name: 'Lazada', countries: ['SG', 'MY', 'TH', 'VN', 'PH', 'ID'] },
  { id: 'aliexpress', name: 'AliExpress', countries: ['US', 'UK', 'RU', 'BR', 'ES', 'FR'] },
]

const COUNTRY_NAMES: Record<string, string> = {
  US: '美国', UK: '英国', DE: '德国', FR: '法国', IT: '意大利', ES: '西班牙',
  JP: '日本', CA: '加拿大', AU: '澳大利亚', SG: '新加坡', MY: '马来西亚',
  TH: '泰国', VN: '越南', PH: '菲律宾', ID: '印度尼西亚', TW: '台湾',
  BR: '巴西', MX: '墨西哥', CO: '哥伦比亚', CL: '智利', RU: '俄罗斯',
  BY: '白俄罗斯', KZ: '哈萨克斯坦', KR: '韩国',
}

const IMAGE_TYPES = [
  { id: 'main', label: '主图', desc: '白底商品主图' },
  { id: 'angle', label: '多角度图', desc: '不同角度展示' },
  { id: 'detail', label: '细节图', desc: '材质/工艺/LOGO放大' },
  { id: 'scene', label: '场景使用图', desc: '真实使用效果' },
  { id: 'comparison', label: '对比图', desc: '与竞品对比' },
  { id: 'accessories', label: '配件/包装图', desc: '赠品/包装展示' },
]

export default function CrossBorderPage() {
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('upload')
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [platform, setPlatform] = useState('shopee')
  const [country, setCountry] = useState('SG')
  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [category, setCategory] = useState('electronics')
  const [selectedImageTypes, setSelectedImageTypes] = useState<string[]>(['main', 'scene'])
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [sellPoints, setSellPoints] = useState<SellPointResult | null>(null)
  const [detailImages, setDetailImages] = useState<DetailImage[]>([])
  const [videoTaskId, setVideoTaskId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [editedSellPoints, setEditedSellPoints] = useState<string[]>([])
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const currentPlatform = PLATFORMS.find(p => p.id === platform)!

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPhotos = files.map(f => ({
      id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      file: f,
      preview: URL.createObjectURL(f),
    }))
    setPhotos(prev => [...prev, ...newPhotos])
  }

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const toggleImageType = (id: string) => {
    setSelectedImageTypes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // 生成卖点
  const generateSellPoints = async () => {
    if (!productName.trim()) {
      showToast('请先填写商品名称', 'warning')
      return
    }
    setLoading(true)
    setStatusMessage('AI 正在生成多语言卖点...')
    setError('')
    try {
      const res = await fetch('/api/cross-border', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sell-points',
          platform, country,
          product: { name: productName, description: productDesc, category },
        }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setSellPoints(data.data)
        setEditedSellPoints(data.data.sellPoints || [])
        showToast('卖点文案已生成', 'success')
      } else {
        setError(data.error || '生成失败')
      }
    } catch (e: any) {
      setError(e.message || '网络错误')
    }
    setLoading(false)
    setStatusMessage('')
  }

  // 生成详情图
  const generateImages = async () => {
    if (selectedImageTypes.length === 0) {
      showToast('请至少选择一种图片类型', 'warning')
      return
    }
    setLoading(true)
    setStatusMessage(`正在生成 ${selectedImageTypes.length} 张详情图（每次约 30 秒）...`)
    setError('')
    try {
      const res = await fetch('/api/cross-border', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'detail-images',
          platform, country,
          product: { name: productName, description: productDesc, category },
          imageTypes: selectedImageTypes,
          style: 'clean',
        }),
      })
      const data = await res.json()
      if (data.success && data.data?.images) {
        setDetailImages(prev => [...prev, ...data.data.images])
        showToast(`${data.data.images.length} 张详情图已生成`, 'success')
      } else {
        setError(data.error || '生成失败')
      }
    } catch (e: any) {
      setError(e.message || '网络错误')
    }
    setLoading(false)
    setStatusMessage('')
  }

  // 生成视频
  const generateVideo = async () => {
    if (!sellPoints?.description && !productDesc) {
      showToast('请先生成卖点文案', 'warning')
      return
    }
    setLoading(true)
    setStatusMessage('AI 正在生成带货视频...')
    setError('')
    try {
      const scriptText = `Product: ${productName}. ${sellPoints?.description || productDesc}. Key features: ${(editedSellPoints || []).slice(0, 3).join(', ')}. Shop now on ${platform}!`
      const res = await fetch('/api/cross-border', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'video',
          platform, country,
          product: { name: productName, description: scriptText, category },
          script: scriptText,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setVideoTaskId(data.data.taskId)
        showToast('视频生成任务已提交，后台渲染中', 'success')

        // 轮询
        const poll = setInterval(async () => {
          try {
            const sr = await fetch(`/api/digital-human/status?taskId=${data.data.taskId}`)
            const sd = await sr.json()
            if (sd.success) {
              const s = sd.data
              if (s.status === 'completed' || s.status === 'done' || s.status === 'succeeded') {
                setVideoUrl(s.output?.url || '')
                clearInterval(poll)
                setLoading(false)
                setStatusMessage('')
                showToast('带货视频已生成！', 'success')
              } else if (s.status === 'failed') {
                clearInterval(poll)
                setLoading(false)
                setStatusMessage('')
                setError('视频生成失败')
              }
            }
          } catch {}
        }, 4000)
      } else {
        setError(data.error || '提交失败')
        setLoading(false)
        setStatusMessage('')
      }
    } catch (e: any) {
      setError(e.message || '网络错误')
      setLoading(false)
      setStatusMessage('')
    }
  }

  const resetAll = () => {
    setStep('upload')
    setPhotos([])
    setPlatform('shopee')
    setCountry('SG')
    setProductName('')
    setProductDesc('')
    setCategory('electronics')
    setSelectedImageTypes(['main', 'scene'])
    setSellPoints(null)
    setDetailImages([])
    setVideoTaskId('')
    setVideoUrl('')
    setError('')
  }

  const copySellPoints = () => {
    const text = [
      `Title: ${sellPoints?.title || ''}`,
      '',
      ...(editedSellPoints || []).map((s, i) => `${i + 1}. ${s}`),
      '',
      `Description: ${sellPoints?.description || ''}`,
      `Keywords: ${sellPoints?.keywords || ''}`,
    ].join('\n')
    navigator.clipboard.writeText(text)
    showToast('文案已复制', 'success')
  }

  const stepNav = [
    { k:'upload' as Step, stepNo:'第一步', l:'上传商品照片', desc:'多维度拍摄上传', icon:FiCamera },
    { k:'config' as Step, stepNo:'第二步', l:'选择平台/国家', desc:'配置目标市场', icon:FiGlobe },
    { k:'generate' as Step, stepNo:'第三步', l:'AI生成内容', desc:'卖点+图片+视频', icon:FiZap },
    { k:'result' as Step, stepNo:'第四步', l:'预览/下载', desc:'查看效果并下载', icon:FiDownload },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
        <Breadcrumb items={[{ label: '懒老板', href: '/' }, { label: '跨境电商 AI 工具' }]} />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">

        {/* 步骤导航 */}
        {step !== 'result' && (
          <div className="mb-8">
            <div className="grid gap-2 sm:grid-cols-4">
              {stepNav.filter(s => s.k !== 'generate' || step === 'generate').map(item => (
                <button key={item.k} onClick={() => { if (!loading) setStep(item.k) }}
                  className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 border-2 ${
                    step === item.k ? 'border-transparent shadow-lg scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                  }`}
                  style={step === item.k ? { background: 'linear-gradient(135deg, #FF603415, #8B5CF608)', borderColor: '#FF6034' } : {}}>
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                      step === item.k ? 'text-white shadow-md' : 'bg-gray-100 text-gray-400'
                    }`} style={step === item.k ? { backgroundColor: '#FF6034' } : {}}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">{item.stepNo}</span>
                      <p className={`text-base font-bold ${step === item.k ? 'text-gray-900' : 'text-gray-700'}`}>{item.l}</p>
                      <p className="text-[11px] text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400">
              {[1, 2, 3, 4].map(n => (
                <span key={n} className="flex items-center gap-2">
                  {n > 1 && <span className="text-gray-300">—</span>}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-[10px]">{n}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 第一步：上传照片 ═══ */}
        {step === 'upload' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 text-center">
              <h1 className="section-title">跨境电商 AI 工具</h1>
              <p className="section-subtitle mt-2">上传商品照片 → 选平台 → AI 生成多语言卖点+详情图+带货视频</p>
            </div>

            <div className="card p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">上传商品照片</h2>
              <p className="text-sm text-gray-400 mb-4">多维度拍摄效果更好，建议 3-6 张</p>

              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all mb-4">
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <FiUpload className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">点击上传照片</p>
                <p className="text-xs text-gray-400">支持 JPG/PNG，建议用美图秀秀 / 豆包处理好再上传</p>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {photos.map(p => (
                    <div key={p.id} className="relative group">
                      <img src={p.preview} alt="" className="w-full aspect-square rounded-xl object-cover border border-gray-100" />
                      <button onClick={() => removePhoto(p.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiTrash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">拍摄建议</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">多角度拍摄</p>
                  <ul className="space-y-1 text-[11px] text-gray-500">
                    <li>正面、侧面、背面各一张</li>
                    <li>45 度角展示立体感</li>
                    <li>细节特写（材质、LOGO、接口）</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-brand-50 p-3">
                  <p className="text-xs font-semibold text-brand-700 mb-1">场景与光线</p>
                  <ul className="space-y-1 text-[11px] text-gray-500">
                    <li>自然光拍摄色彩最真实</li>
                    <li>纯色背景方便后期抠图</li>
                    <li>美图秀秀 / 豆包可优化画质</li>
                  </ul>
                </div>
              </div>
            </div>

            <button onClick={() => setStep('config')} disabled={photos.length === 0}
              className="btn-ai w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
              <FiArrowRight className="h-4 w-4" /> 下一步：选择平台和国家
            </button>
          </div>
        )}

        {/* ═══ 第二步：选择平台/国家 ═══ */}
        {step === 'config' && (
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setStep('upload')} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
              <FiChevronLeft className="h-4 w-4" /> 返回上传照片
            </button>

            <div className="card p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">选择目标平台</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => { setPlatform(p.id); setCountry(p.countries[0]) }}
                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                      platform === p.id ? 'border-brand-400 bg-brand-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl mx-auto mb-2 ${
                      platform === p.id ? 'bg-brand-400 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <FiShoppingCart className="h-5 w-5" />
                    </div>
                    <p className={`text-xs font-semibold ${platform === p.id ? 'text-brand-400' : 'text-gray-600'}`}>{p.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">选择目标国家</h2>
              <div className="flex flex-wrap gap-2">
                {currentPlatform.countries.map(c => (
                  <button key={c} onClick={() => setCountry(c)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all border-2 ${
                      country === c ? 'border-brand-400 bg-brand-400 text-white shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {COUNTRY_NAMES[c] || c}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">商品信息</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">商品名称</label>
                  <input value={productName} onChange={e => setProductName(e.target.value)}
                    placeholder="例：Wireless Bluetooth Earphones 5.3"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">商品描述</label>
                  <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)}
                    placeholder="例：Bluetooth 5.3, 40h battery, noise cancelling, IPX5 waterproof..."
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 resize-none" />
                </div>
              </div>
            </div>

            <button onClick={() => setStep('generate')} disabled={!productName.trim()}
              className="btn-ai w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
              <FiArrowRight className="h-4 w-4" /> 下一步：AI 生成内容
            </button>
          </div>
        )}

        {/* ═══ 第三步：AI 生成 ═══ */}
        {step === 'generate' && (
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setStep('config')} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
              <FiChevronLeft className="h-4 w-4" /> 返回配置
            </button>

            {/* 1. 生成卖点文案 */}
            <div className="card p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">1. 生成卖点文案</h2>
                <button onClick={generateSellPoints} disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all"
                  style={{ backgroundColor: '#8B5CF6' }}>
                  <FiZap className="h-3 w-3" /> {sellPoints ? '重新生成' : 'AI 生成卖点'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-3">语言自动适配 {COUNTRY_NAMES[country] || country} 市场</p>

              {sellPoints ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-brand-50 p-3">
                    <p className="text-xs font-semibold text-brand-700 mb-1">标题</p>
                    <p className="text-sm text-gray-800">{sellPoints.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">卖点（点击编辑）</p>
                    <div className="space-y-2">
                      {editedSellPoints.map((sp, i) => (
                        <input key={i} value={sp} onChange={e => {
                          const next = [...editedSellPoints]
                          next[i] = e.target.value
                          setEditedSellPoints(next)
                        }}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">描述</p>
                    <p className="text-sm text-gray-700">{sellPoints.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copySellPoints}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                      <FiCopy className="h-3 w-3" /> 复制全部
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-gray-400">
                  <FiTag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>点击按钮生成适配 {PLATFORMS.find(p => p.id === platform)?.name} {COUNTRY_NAMES[country]} 市场的卖点文案</p>
                </div>
              )}
            </div>

            {/* 2. 生成详情页图片 */}
            <div className="card p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">2. 生成详情页图片</h2>
                <button onClick={generateImages} disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all"
                  style={{ backgroundColor: '#FF6034' }}>
                  <FiImage className="h-3 w-3" /> {loading && statusMessage.includes('图片') ? '生成中...' : 'AI 生成图片'}
                </button>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">选择需要的图片类型：</p>
                <div className="flex flex-wrap gap-2">
                  {IMAGE_TYPES.map(t => (
                    <button key={t.id} onClick={() => toggleImageType(t.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border-2 ${
                        selectedImageTypes.includes(t.id) ? 'border-brand-400 bg-brand-50 text-brand-400' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {detailImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detailImages.map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                      <img src={img.url} alt={img.label} className="w-full aspect-square object-cover" loading="lazy" />
                      <p className="text-[10px] text-gray-400 text-center py-1">{img.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. 生成带货视频 */}
            <div className="card p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">3. 生成带货视频</h2>
                <button onClick={generateVideo} disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all"
                  style={{ backgroundColor: '#059669' }}>
                  <FiVideo className="h-3 w-3" /> {loading && statusMessage.includes('视频') ? '生成中...' : 'AI 生成视频'}
                </button>
              </div>
              {videoUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-100 bg-black max-w-sm">
                  <video src={videoUrl} controls className="w-full aspect-[9/16] object-contain" />
                </div>
              )}
              {!videoUrl && (
                <div className="text-center py-6 text-sm text-gray-400">
                  <FiVideo className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>基于文案 + 商品信息，一键生成带货视频</p>
                </div>
              )}
            </div>

            {/* 生成结果预览 */}
            {(sellPoints || detailImages.length > 0 || videoUrl) && (
              <div className="text-center">
                <button onClick={() => setStep('result')}
                  className="btn-ai">
                  <FiArrowRight className="h-4 w-4" /> 查看完整效果
                </button>
              </div>
            )}

            {loading && (
              <div className="card p-4 text-center text-sm text-gray-500">
                <FiRefreshCw className="h-5 w-5 mx-auto mb-2 animate-spin" />
                {statusMessage}
              </div>
            )}

            {error && (
              <div className="card p-4 text-center text-sm text-red-500 border-red-100 mt-4">
                {error}
              </div>
            )}
          </div>
        )}

        {/* ═══ 第四步：结果预览 ═══ */}
        {step === 'result' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="section-title">生成结果</h1>
              <p className="section-subtitle mt-2">{PLATFORMS.find(p => p.id === platform)?.name} · {COUNTRY_NAMES[country] || country}</p>
            </div>

            {/* 卖点文案 */}
            {sellPoints && (
              <div className="card p-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-gray-900">卖点文案</h2>
                  <button onClick={copySellPoints}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    <FiCopy className="h-3 w-3" /> 复制
                  </button>
                </div>
                <div className="rounded-lg bg-brand-50 p-3 mb-3">
                  <p className="text-xs font-semibold text-brand-700 mb-1">标题</p>
                  <p className="text-sm text-gray-800">{sellPoints.title}</p>
                </div>
                <div className="space-y-1 mb-3">
                  {editedSellPoints.map((sp, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <FiStar className="h-3 w-3 mt-1 text-brand-400 shrink-0" />
                      <span>{sp}</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
                  关键词：{sellPoints.keywords}
                </div>
              </div>
            )}

            {/* 详情图 */}
            {detailImages.length > 0 && (
              <div className="card p-6 mb-4">
                <h2 className="text-base font-bold text-gray-900 mb-3">详情页图片</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detailImages.map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                      <img src={img.url} alt={img.label} className="w-full aspect-square object-cover" loading="lazy" />
                      <p className="text-[10px] text-gray-400 text-center py-1">{img.label}</p>
                      <a href={img.url} download={`${img.type}.jpg`}
                        className="block text-center text-[10px] text-brand-400 pb-1 hover:underline">下载</a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 视频 */}
            {videoUrl && (
              <div className="card p-6 mb-4">
                <h2 className="text-base font-bold text-gray-900 mb-3">带货视频</h2>
                <div className="rounded-xl overflow-hidden border border-gray-100 bg-black max-w-sm mx-auto">
                  <video src={videoUrl} controls className="w-full aspect-[9/16] object-contain" />
                </div>
                <div className="text-center mt-3">
                  <a href={videoUrl} download="带货视频.mp4"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500">
                    <FiDownload className="h-4 w-4" /> 下载视频
                  </a>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button onClick={resetAll}
                className="btn-outline">
                <FiRefreshCw className="h-4 w-4" /> 重新开始
              </button>
              <button onClick={() => setStep('generate')}
                className="btn-primary">
                <FiArrowRight className="h-4 w-4" /> 继续生成
              </button>
            </div>
          </div>
        )}

        {/* 底部 */}
        {step !== 'result' && (
          <div className="mt-8 rounded-2xl bg-gradient-to-b from-brand-50 to-white border border-brand-100/50 p-6 text-center">
            <p className="text-sm font-semibold text-gray-900">支持平台</p>
            <p className="text-xs text-gray-400 mt-1">
              Shopee · Amazon · OZON · TikTok Shop · Shopify · TEMU · Lazada · AliExpress ·
              语言自动适配目标国家 · 图片由 Agnes AI 生成
            </p>
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/ai-video" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                <FiCamera className="h-3 w-3" /> 一键短视频
              </Link>
              <Link href="/digital-human" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                <FiUser className="h-3 w-3" /> 数字人口播
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
