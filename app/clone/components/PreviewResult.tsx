'use client'
import { FiDownload, FiRefreshCw, FiShare2 } from 'react-icons/fi'
import { useToast } from '@/app/contexts/ToastContext'
import { WatermarkLayer, addWatermarkToImage } from './Watermark'

interface Props {
  previewUrl: string
  productDesc: string
  showWatermark: boolean
  watermarkSeed: number
  onReset: () => void
  onRegenerate: () => void
  loading: boolean
}

export default function PreviewResult({ previewUrl, productDesc, showWatermark, watermarkSeed, onReset, onRegenerate, loading }: Props) {
  const { showToast } = useToast()

  const download = async () => {
    try {
      // 免费版下载：Canvas 合成带水印图；付费版下载原图
      let url = previewUrl
      if (showWatermark) {
        url = await addWatermarkToImage(previewUrl, watermarkSeed)
      }
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `懒老板产品宣传图_${Date.now()}.jpg`
      a.click()
      showToast('已开始下载', 'success')
    } catch { showToast('下载失败', 'error') }
  }

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: '我的老板宣传图', url: previewUrl })
      } else {
        await navigator.clipboard.writeText(previewUrl)
        showToast('链接已复制', 'success')
      }
    } catch {}
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">你的老板宣传图</h2>
      <p className="text-sm text-gray-500 mb-5">{productDesc || '克隆分身 + 产品可视化预览图'}</p>

      <div className="relative rounded-2xl overflow-hidden border border-gray-200 mb-5">
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="宣传图" className="w-full object-cover" />
            <WatermarkLayer show={showWatermark} seed={watermarkSeed} />
          </>
        ) : (
          <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-300">加载中...</div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onReset} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">换模板重出</button>
        <div className="flex items-center gap-3">
          <button onClick={onRegenerate} disabled={loading} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50">
            <FiRefreshCw className="inline mr-1" />换引擎重出
          </button>
          <button onClick={share} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
            <FiShare2 className="inline mr-1" />分享
          </button>
          <button onClick={download} className="px-6 py-2.5 rounded-xl bg-[#FF6034] text-white font-medium hover:opacity-90">
            <FiDownload className="inline mr-1" />下载
          </button>
        </div>
      </div>
    </div>
  )
}
