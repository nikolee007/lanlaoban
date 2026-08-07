'use client'

import { useState, useRef } from 'react'
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize } from 'react-icons/fi'

interface VideoPlayerProps {
  src?: string
  poster?: string
  title?: string
  description?: string
  aspectRatio?: string
  /** 视频方向：竖屏(portrait)用 3/4 比例，横屏(landscape)用 16/9。传 aspectRatio 时以此为准 */
  orientation?: 'portrait' | 'landscape'
  /** 当没有视频源时显示占位 */
  placeholder?: boolean
}

export default function VideoPlayer({
  src,
  poster,
  title,
  description,
  aspectRatio,
  orientation = 'landscape',
  placeholder = false,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 方向自适应：默认竖屏 3/4、横屏 16/9；显式传 aspectRatio 优先
  const resolvedAspect = aspectRatio || (orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-video')

  const togglePlay = () => {
    if (placeholder) return
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !muted
    setMuted(!muted)
  }

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  // Placeholder mode — show CTA card when no video source
  if (placeholder || !src) {
    return (
      <div className={`relative ${resolvedAspect} rounded-2xl bg-gradient-to-br from-[#FF6034]/5 to-[#FF8A66]/5 border border-[#FF6034]/10 flex items-center justify-center overflow-hidden group`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FF6034]/20 to-[#FF6034]/5 flex items-center justify-center border border-[#FF6034]/10">
            <FiPlay className="w-7 h-7 text-[#FF6034] ml-0.5" />
          </div>
          {title && <h4 className="font-bold text-[#0A0A0B] mb-1">{title}</h4>}
          {description && <p className="text-sm text-[#6B7280] max-w-sm">{description}</p>}
          {!title && !description && (
            <>
              <h4 className="font-bold text-[#0A0A0B] mb-1">演示视频即将上线</h4>
              <p className="text-sm text-[#6B7280] max-w-sm">我们正在制作懒老板使用教程，敬请期待</p>
            </>
          )}
        </div>
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #FF6034 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${resolvedAspect} rounded-2xl overflow-hidden bg-black group cursor-pointer`}
      onClick={togglePlay}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        playsInline
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Play/Pause overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <FiPlay className="w-7 h-7 text-[#FF6034] ml-1" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-white hover:text-[#FF6034] transition-colors">
              {playing ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
            </button>
            <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors">
              {muted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={handleFullscreen} className="text-white/80 hover:text-white transition-colors">
            <FiMaximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
