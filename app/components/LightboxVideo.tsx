'use client'

import { useEffect, useRef } from 'react'
import { FiX, FiVolume2, FiVolumeX } from 'react-icons/fi'

interface LightboxVideoProps {
  src: string
  poster?: string
  title?: string
  onClose: () => void
}

/**
 * 全屏沉浸式视频播放器（Lightbox）
 * 点击 Showcase 案例后弹出，全屏播放视频，支持 ESC 关闭
 */
export default function LightboxVideo({ src, poster, title, onClose }: LightboxVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // ESC 关闭 + 锁定背景滚动
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    // 自动开始播放
    videoRef.current?.play()

    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        aria-label="关闭"
      >
        <FiX className="w-6 h-6" />
      </button>

      {/* 视频容器 */}
      <div
        className="relative max-w-full max-h-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="max-h-[78vh] max-w-full rounded-2xl shadow-2xl shadow-black/50 bg-black"
          controls
          autoPlay
          playsInline
          loop
        />
        {title && (
          <div className="mt-4 flex items-center gap-3 text-white">
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="静音切换"
            >
              <FiVolumeX className="w-5 h-5" />
            </button>
            <span className="text-lg font-semibold">{title}</span>
          </div>
        )}
      </div>
    </div>
  )
}
