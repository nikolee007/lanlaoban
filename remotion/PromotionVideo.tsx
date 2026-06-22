import React, { useMemo } from 'react'
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion'

/* ─────────────────── Types ─────────────────── */

export interface PromotionVideoProps {
  photos: string[]
  productName: string
  slogans: string[]
  audioUrl?: string
  logoUrl?: string
  language?: string
  duration: number // total frames (30fps × seconds)
}

/* ─────────────────── Constants ─────────────────── */

const BRAND_ORANGE = '#FF6034'
const BG_TOP = '#1a1a2e'
const BG_BOTTOM = '#0f0f23'
const FPS = 30

function getFontFamily(language?: string): string {
  if (!language || ['zh', 'zh-tw', 'ja', 'ko'].includes(language)) {
    return '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Noto Sans CJK SC", sans-serif'
  }
  if (language === 'ar') return '"Noto Naskh Arabic", "Traditional Arabic", sans-serif'
  if (language === 'th') return '"Noto Sans Thai", "Leelawadee UI", sans-serif'
  if (language === 'vi') return '"Noto Sans", "Segoe UI", sans-serif'
  return '"Segoe UI", "Helvetica Neue", Arial, sans-serif'
}

/* ─────────────────── Sub-components ─────────────────── */

/** Opening title card: logo + product name fade-in on dark gradient */
const OpeningTitle: React.FC<{
  productName: string
  logoUrl?: string
  language?: string
}> = ({ productName, logoUrl, language }) => {
  const frame = useCurrentFrame()
  const fontFamily = getFontFamily(language)

  const titleOpacity = spring({
    frame,
    fps: FPS,
    config: { damping: 12, stiffness: 100 },
  })
  const titleY = spring({
    frame,
    fps: FPS,
    config: { damping: 15, stiffness: 80 },
    from: 60,
    to: 0,
  })

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOTTOM} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Brand accent line */}
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '15%',
          right: '15%',
          height: 3,
          background: `linear-gradient(90deg, transparent, ${BRAND_ORANGE}, transparent)`,
          opacity: titleOpacity * 0.6,
        }}
      />

      {/* Logo */}
      {logoUrl && (
        <Img
          src={logoUrl}
          style={{
            width: 160,
            height: 160,
            objectFit: 'contain',
            marginBottom: 40,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        />
      )}

      {/* Product Name */}
      <h1
        style={{
          fontFamily,
          fontSize: 72,
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
          maxWidth: '80%',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textShadow: '0 4px 30px rgba(255, 96, 52, 0.3)',
        }}
      >
        {productName}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily,
          fontSize: 32,
          color: BRAND_ORANGE,
          marginTop: 20,
          opacity: spring({ frame: Math.max(0, frame - 15), fps: FPS, config: { damping: 12, stiffness: 100 } }),
        }}
      >
        {language === 'zh' || language === 'zh-tw' || !language
          ? 'AI 智能生成 · 品牌宣传片'
          : 'AI-Generated Brand Promotion'}
      </p>
    </AbsoluteFill>
  )
}

/** Single photo with Ken Burns effect */
const KenBurnsPhoto: React.FC<{
  src: string
  photoIndex: number
}> = ({ src, photoIndex }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Slow Ken Burns: subtle zoom + pan
  const scale = interpolate(frame, [0, fps * 4], [1.0, 1.08], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })
  const panX = interpolate(frame, [0, fps * 4], [-15, 15], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })
  const panY = interpolate(frame, [0, fps * 4], [-10, 10], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
        transformOrigin: 'center center',
      }}
    >
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </AbsoluteFill>
  )
}

/** Cross-fade transition between two photos */
const PhotoTransition: React.FC<{
  currentSrc: string
  nextSrc: string
}> = ({ currentSrc, nextSrc }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const transitionFrames = fps * 0.5 // 0.5 second transition

  const nextOpacity = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - nextOpacity }}>
        <KenBurnsPhoto src={currentSrc} photoIndex={0} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: nextOpacity }}>
        <KenBurnsPhoto src={nextSrc} photoIndex={1} />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

/** Animated slogan text sliding in from bottom */
const SloganText: React.FC<{
  text: string
  fontFamily: string
}> = ({ text, fontFamily }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Slide in: 0-0.35s, stay: 0.35-2.55s, slide out: 2.55-2.9s
  const slideInDuration = 0.35 * fps
  const stayDuration = 2.2 * fps
  const slideOutDuration = 0.35 * fps

  const opacity = (() => {
    if (frame < slideInDuration) {
      return interpolate(frame, [0, slideInDuration], [0, 1], { extrapolateRight: 'clamp' })
    }
    if (frame < slideInDuration + stayDuration) return 1
    return interpolate(
      frame,
      [slideInDuration + stayDuration, slideInDuration + stayDuration + slideOutDuration],
      [1, 0],
      { extrapolateRight: 'clamp' }
    )
  })()

  const translateY = (() => {
    if (frame < slideInDuration) {
      return spring({
        frame,
        fps,
        config: { damping: 20, stiffness: 120 },
        from: 80,
        to: 0,
        durationInFrames: slideInDuration,
      })
    }
    if (frame < slideInDuration + stayDuration) return 0
    return interpolate(
      frame,
      [slideInDuration + stayDuration, slideInDuration + stayDuration + slideOutDuration],
      [0, -60],
      {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp',
        easing: Easing.inOut(Easing.ease),
      }
    )
  })()

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 280,
        left: '10%',
        right: '10%',
        display: 'flex',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          background: `rgba(0, 0, 0, ${opacity * 0.55})`,
          borderRadius: 20,
          padding: '24px 60px',
          maxWidth: '85%',
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 52,
            fontWeight: 700,
            color: BRAND_ORANGE,
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.35,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  )
}

/** Ending call-to-action card */
const EndingCard: React.FC<{
  language?: string
}> = ({ language }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  })
  const ctaScale = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 10, stiffness: 120 },
  })
  const fontFamily = getFontFamily(language)

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${BG_BOTTOM} 0%, #0a0a1a 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Brand orange accent ring */}
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: `3px solid ${BRAND_ORANGE}`,
          opacity: titleOpacity * 0.3,
          position: 'absolute',
          transform: `scale(${1 + titleOpacity * 0.5})`,
        }}
      />

      <h2
        style={{
          fontFamily,
          fontSize: 64,
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
          opacity: titleOpacity,
          marginBottom: 20,
        }}
      >
        懒老板 AI 生成
      </h2>

      <p
        style={{
          fontFamily,
          fontSize: 28,
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
          opacity: titleOpacity,
          marginBottom: 50,
        }}
      >
        {language === 'zh' || language === 'zh-tw' || !language
          ? 'AI 赋能品牌全球化 · 一键触达全球市场'
          : 'AI-Powered Brand Globalization'}
      </p>

      {/* CTA Button */}
      <div
        style={{
          fontFamily,
          fontSize: 36,
          fontWeight: 700,
          color: '#ffffff',
          background: BRAND_ORANGE,
          padding: '18px 60px',
          borderRadius: 50,
          transform: `scale(${ctaScale})`,
          boxShadow: `0 8px 40px rgba(255, 96, 52, 0.4)`,
        }}
      >
        {language === 'zh' || language === 'zh-tw' || !language ? '立即了解 →' : 'Learn More →'}
      </div>
    </AbsoluteFill>
  )
}

/** Dark bottom gradient overlay for text readability */
const BottomOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg,
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,0) 50%,
        rgba(0,0,0,0.35) 70%,
        rgba(0,0,0,0.7) 100%)`,
      pointerEvents: 'none',
    }}
  />
)

/** Bottom-right "懒老板 AI" watermark */
const Watermark: React.FC<{ language?: string }> = ({ language }) => {
  const fontFamily = getFontFamily(language)
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily,
        fontSize: 32,
        color: 'rgba(255, 255, 255, 0.4)',
        pointerEvents: 'none',
      }}
    >
      懒老板 AI
    </div>
  )
}

/** Top-right logo watermark */
const LogoWatermark: React.FC<{ logoUrl?: string }> = ({ logoUrl }) => {
  if (!logoUrl) return null
  return (
    <Img
      src={logoUrl}
      style={{
        position: 'absolute',
        top: 40,
        right: 40,
        width: 80,
        height: 80,
        objectFit: 'contain',
        opacity: 0.5,
      }}
    />
  )
}

/* ─────────────────── Main Component ─────────────────── */

const PromotionVideo: React.FC<PromotionVideoProps> = ({
  photos,
  productName,
  slogans,
  audioUrl,
  logoUrl,
  language,
  duration,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fontFamily = getFontFamily(language)

  // Calculate timing
  const totalFrames = duration
  const openingFrames = fps * 2 // 2 seconds
  const endingFrames = fps * 2 // 2 seconds
  const showcaseFrames = Math.max(1, totalFrames - openingFrames - endingFrames)

  // Photo display: each photo gets equal time in the showcase section
  const photosCount = Math.max(1, photos.length)
  const photoSlotFrames = Math.floor(showcaseFrames / photosCount)
  const transitionFrames = fps * 0.5 // 0.5s cross-fade

  // Slogan display: each slogan gets equal time in the showcase section
  const sloganCount = Math.max(1, slogans.length)
  const sloganSlotFrames = Math.floor(showcaseFrames / sloganCount)

  // Pre-compute photo sequence frames for Sequence usage
  const photoSequences = useMemo(() => {
    const seqs: Array<{ from: number; durationInFrames: number; photoIndex: number }> = []
    for (let i = 0; i < photosCount; i++) {
      const from = openingFrames + i * photoSlotFrames
      seqs.push({
        from,
        durationInFrames: i < photosCount - 1
          ? photoSlotFrames + transitionFrames // last slot includes transition overlap
          : showcaseFrames - i * photoSlotFrames,
        photoIndex: i,
      })
    }
    return seqs
  }, [openingFrames, photoSlotFrames, transitionFrames, photosCount, showcaseFrames])

  // Pre-compute slogan sequences
  const sloganSequences = useMemo(() => {
    const seqs: Array<{ from: number; durationInFrames: number; sloganIndex: number }> = []
    for (let i = 0; i < sloganCount; i++) {
      seqs.push({
        from: openingFrames + i * sloganSlotFrames,
        durationInFrames: sloganSlotFrames,
        sloganIndex: i,
      })
    }
    return seqs
  }, [openingFrames, sloganSlotFrames, sloganCount])

  return (
    <AbsoluteFill style={{ backgroundColor: BG_BOTTOM }}>
      {/* ── Opening Title (0-2s) ── */}
      <Sequence from={0} durationInFrames={openingFrames}>
        <OpeningTitle
          productName={productName}
          logoUrl={logoUrl}
          language={language}
        />
      </Sequence>

      {/* ── Product Showcase (2s - end-2s) ── */}
      <Sequence from={openingFrames} durationInFrames={showcaseFrames}>
        <AbsoluteFill>
          {/* Background gradient behind photos */}
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOTTOM} 100%)`,
            }}
          />

          {/* Photo sequences with cross-fade overlaps */}
          {photoSequences.map((seq, idx) => (
            <React.Fragment key={`photo-${seq.photoIndex}`}>
              {idx < photosCount - 1 ? (
                /* Photo with transition to next */
                <Sequence from={seq.from - openingFrames} durationInFrames={seq.durationInFrames}>
                  <PhotoTransition
                    currentSrc={photos[seq.photoIndex]}
                    nextSrc={photos[Math.min(seq.photoIndex + 1, photosCount - 1)]}
                  />
                </Sequence>
              ) : (
                /* Last photo — no transition */
                <Sequence from={seq.from - openingFrames} durationInFrames={seq.durationInFrames}>
                  <KenBurnsPhoto src={photos[seq.photoIndex]} photoIndex={seq.photoIndex} />
                </Sequence>
              )}
            </React.Fragment>
          ))}

          {/* Dark overlay for text readability */}
          <BottomOverlay />

          {/* Slogan sequences */}
          {sloganSequences.map(seq => (
            <Sequence
              key={`slogan-${seq.sloganIndex}`}
              from={seq.from - openingFrames}
              durationInFrames={seq.durationInFrames}
            >
              <SloganText
                text={slogans[seq.sloganIndex]}
                fontFamily={fontFamily}
              />
            </Sequence>
          ))}

          {/* Persistent overlays during showcase */}
          <LogoWatermark logoUrl={logoUrl} />
          <Watermark language={language} />
        </AbsoluteFill>
      </Sequence>

      {/* ── Ending Card (last 2s) ── */}
      <Sequence from={totalFrames - endingFrames} durationInFrames={endingFrames}>
        <EndingCard language={language} />
        <Watermark language={language} />
      </Sequence>

      {/* ── Audio ── */}
      {audioUrl && <Audio src={audioUrl} />}
    </AbsoluteFill>
  )
}

export default PromotionVideo
