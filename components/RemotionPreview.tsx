'use client'

import React, { useState, useCallback, useMemo, useRef } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import PromotionVideo, { type PromotionVideoProps } from '@/remotion/PromotionVideo'
import { FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi'

/* ─────────────────── Types ─────────────────── */

interface RemotionPreviewProps {
  photos: string[]
  productName: string
  slogans: string[]
  audioUrl?: string
  logoUrl?: string
  language?: string
  duration: number // seconds
}

/* ─────────────────── Component ─────────────────── */

const RemotionPreview: React.FC<RemotionPreviewProps> = ({
  photos,
  productName,
  slogans,
  audioUrl,
  logoUrl,
  language,
  duration,
}) => {
  const playerRef = useRef<PlayerRef>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const totalFrames = Math.ceil(duration * 30)

  const inputProps: PromotionVideoProps = useMemo(
    () => ({
      photos: photos.length > 0 ? photos : ['/images/brand-promotion/style-professional.jpg'],
      productName: productName || 'Product',
      slogans: slogans.length > 0 ? slogans : ['Your Brand Story'],
      audioUrl: isMuted ? undefined : audioUrl,
      logoUrl,
      language,
      duration: totalFrames,
    }),
    [photos, productName, slogans, audioUrl, logoUrl, language, totalFrames, isMuted]
  )

  const handleTogglePlay = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    if (player.isPlaying()) {
      player.pause()
      setIsPlaying(false)
    } else {
      player.play()
      setIsPlaying(true)
    }
  }, [])

  const handleToggleMute = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    if (player.isMuted()) {
      player.unmute()
      setIsMuted(false)
    } else {
      player.mute()
      setIsMuted(true)
    }
  }, [])

  // Wrapper to satisfy Remotion Player's LooseComponentType constraint
  const WrappedPromotionVideo = useMemo(
    () =>
      ((props: Record<string, unknown>) => (
        <PromotionVideo {...(props as unknown as PromotionVideoProps)} />
      )) as React.FC<Record<string, unknown>>,
    []
  )

  return (
    <div className="flex flex-col items-center">
      {/* Player wrapper — 9:16 aspect ratio, max 500px height */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl bg-black"
        style={{
          width: 'auto',
          maxHeight: 500,
          aspectRatio: '9 / 16',
        }}
      >
        <Player
          ref={playerRef}
          component={WrappedPromotionVideo}
          inputProps={inputProps}
          durationInFrames={totalFrames}
          compositionWidth={1080}
          compositionHeight={1920}
          fps={30}
          style={{ width: '100%', height: '100%' }}
          controls={false}
          loop={false}
          autoPlay={false}
          clickToPlay={false}
        />
      </div>

      {/* Custom Controls */}
      <div className="flex items-center gap-4 mt-4">
        {/* Play/Pause */}
        <button
          onClick={handleTogglePlay}
          className="w-12 h-12 rounded-full bg-[#FF6034] text-white flex items-center justify-center hover:bg-[#E8552E] transition-all shadow-lg"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} className="ml-0.5" />}
        </button>

        {/* Mute */}
        <button
          onClick={handleToggleMute}
          className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-all"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
        </button>
      </div>
    </div>
  )
}

export default RemotionPreview
