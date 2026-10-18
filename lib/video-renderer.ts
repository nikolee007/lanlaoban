'use client'

import {
  buildTtsMasterClock,
  captionCues,
  photoCutPoints,
  type AudioMasterClock,
  type CaptionCue,
} from './presenter-pipeline'

/* ─────────────────── Types ─────────────────── */

export interface RenderPromotionVideoOptions {
  photos: string[]         // Photo ObjectURLs or paths
  audioUrl: string         // TTS audio URL
  productName: string      // Product name for title card
  slogans: string[]        // Selling point lines (animated one by one)
  duration: number         // Total duration in seconds
  digitalHumanVideoUrl?: string  // Digital human video URL (PiP overlay)
  logoUrl?: string         // Logo URL (top-right watermark)
  language?: string        // Language code for font selection
}

export interface RenderResult {
  videoBlob: Blob
  audioBlob?: Blob
}

/* ─────────────────── Constants ─────────────────── */

const WIDTH = 1080
const HEIGHT = 1920
const FPS = 30
const BRAND_ORANGE = '#FF6034'
const BG_TOP = '#1a1a2e'
const BG_BOTTOM = '#0f0f23'

const TRANSITION_DURATION = 0.5  // seconds for photo cross-fade
const SLOGAN_SLIDE_DURATION = 0.35

/* ─────────────────── Helpers ─────────────────── */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true
    video.oncanplaythrough = () => resolve(video)
    video.onerror = () => reject(new Error(`Failed to load video: ${src}`))
    video.src = src
  })
}

function getFontFamily(language?: string): string {
  // Select appropriate system fonts for the language
  if (!language || language === 'zh' || language === 'zh-tw' || language === 'ja' || language === 'ko') {
    return '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Noto Sans CJK SC", sans-serif'
  }
  if (language === 'ar') {
    return '"Noto Naskh Arabic", "Traditional Arabic", sans-serif'
  }
  if (language === 'th') {
    return '"Noto Sans Thai", "Leelawadee UI", sans-serif'
  }
  if (language === 'vi') {
    return '"Noto Sans", "Segoe UI", sans-serif'
  }
  return '"Segoe UI", "Helvetica Neue", Arial, sans-serif'
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

/* ─────────────────── Drawing ─────────────────── */

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  gradient.addColorStop(0, BG_TOP)
  gradient.addColorStop(1, BG_BOTTOM)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
}

function drawPhotoKenBurns(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,  // 0..1 within this photo's display duration
): void {
  const scale = lerp(1.0, 1.08, progress)
  // Alternate pan direction based on context — use subtle diagonal pan
  const panX = lerp(-15, 15, progress)
  const panY = lerp(-10, 10, progress)

  ctx.save()
  ctx.translate(WIDTH / 2 + panX, HEIGHT / 2 + panY)
  ctx.scale(scale, scale)

  // Draw image centered, covering the canvas
  const imgAspect = img.naturalWidth / img.naturalHeight
  const canvasAspect = WIDTH / HEIGHT

  let drawW: number, drawH: number
  if (imgAspect > canvasAspect) {
    drawH = HEIGHT / scale
    drawW = drawH * imgAspect
  } else {
    drawW = WIDTH / scale
    drawH = drawW / imgAspect
  }

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()
}

function drawPhotoWithAlpha(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,
  alpha: number,
): void {
  ctx.globalAlpha = alpha
  drawPhotoKenBurns(ctx, img, progress)
  ctx.globalAlpha = 1.0
}

function drawSlogan(
  ctx: CanvasRenderingContext2D,
  text: string,
  localProgress: number, // 0..1 within **这一句自己的**时间窗（来自音频时钟）
  cueDurationSec: number,
  fontFamily: string,
): void {
  // 滑入/滑出都按**秒**算，不按固定百分比：
  // 长句给足停留时间，短句也不会来不及看清就滑走（旧实现整段等分，短句一闪而过）。
  const edge = Math.min(SLOGAN_SLIDE_DURATION, Math.max(0.08, cueDurationSec / 3))
  const tSec = localProgress * cueDurationSec

  let yOffset: number
  let alpha: number

  if (tSec < edge) {
    // Slide in from bottom
    const t = easeOutQuad(clamp(tSec / edge, 0, 1))
    yOffset = lerp(120, 0, t)
    alpha = t
  } else if (tSec > cueDurationSec - edge) {
    // Slide out (upward)
    const t = easeInOutCubic(clamp((tSec - (cueDurationSec - edge)) / edge, 0, 1))
    yOffset = lerp(0, -80, t)
    alpha = 1 - t
  } else {
    // Stay
    yOffset = 0
    alpha = 1
  }

  // Draw text background bar
  const fontSize = 52
  ctx.font = `bold ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const maxWidth = WIDTH * 0.82
  const lines = wrapText(ctx, text, maxWidth)
  const lineHeight = fontSize * 1.35
  const totalHeight = lines.length * lineHeight

  const textX = WIDTH / 2
  const textY = HEIGHT - 320 + yOffset - totalHeight / 2

  // Semi-transparent backdrop
  if (alpha > 0.01) {
    const barWidth = maxWidth + 80
    const barHeight = totalHeight + 60
    const barX = textX - barWidth / 2
    const barY = textY - barHeight / 2

    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.55})`
    roundRect(ctx, barX, barY, barWidth, barHeight, 20)
    ctx.fill()
  }

  // Draw text with brand orange
  ctx.fillStyle = BRAND_ORANGE
  ctx.globalAlpha = alpha
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], textX, textY + i * lineHeight)
  }
  ctx.globalAlpha = 1.0
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  // For CJK text, we can break at any character
  const isCJK = /[一-鿿㐀-䶿぀-ゟ゠-ヿ가-힯]/.test(text)

  if (isCJK) {
    // Character-by-character wrapping for CJK
    const lines: string[] = []
    let currentLine = ''
    for (const char of text) {
      const testLine = currentLine + char
      if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = char
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
    return lines
  }

  // Word-by-word wrapping for Latin scripts
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawWatermark(ctx: CanvasRenderingContext2D, fontFamily: string): void {
  const text = '懒老板 AI'
  ctx.font = `bold 32px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.fillText(text, WIDTH / 2, HEIGHT - 30)
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
): void {
  const logoSize = 80
  const margin = 40
  ctx.globalAlpha = 0.5
  ctx.drawImage(logo, WIDTH - logoSize - margin, margin, logoSize, logoSize)
  ctx.globalAlpha = 1.0
}

function drawDigitalHuman(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
): void {
  const pipW = 320
  const pipH = 568
  const margin = 30
  const x = WIDTH - pipW - margin
  const y = HEIGHT - pipH - 200 // Above slogan area

  ctx.save()
  // Rounded rectangle clip
  ctx.beginPath()
  roundRect(ctx, x, y, pipW, pipH, 24)
  ctx.clip()

  // Draw video frame
  try {
    ctx.drawImage(video, x, y, pipW, pipH)
  } catch {
    // Video might not be ready — draw placeholder
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(x, y, pipW, pipH)
  }

  // Border
  ctx.strokeStyle = `${BRAND_ORANGE}80`
  ctx.lineWidth = 3
  ctx.beginPath()
  roundRect(ctx, x, y, pipW, pipH, 24)
  ctx.stroke()

  ctx.restore()
}

/* ─────────────────── Main Render Function ─────────────────── */

export async function renderPromotionVideo(
  options: RenderPromotionVideoOptions,
  onProgress?: (frame: number, totalFrames: number) => void,
): Promise<RenderResult> {
  const {
    photos,
    audioUrl,
    productName,
    slogans,
    duration,
    digitalHumanVideoUrl,
    logoUrl,
    language,
  } = options

  // ── Validate inputs ──
  if (photos.length === 0) throw new Error('至少需要一张照片')
  if (!audioUrl) throw new Error('需要音频URL')
  if (!slogans.length) throw new Error('至少需要一句文案')

  const fps = FPS
  const fontFamily = getFontFamily(language)
  // 时基的唯一真相源 = **解码后的 TTS 音频时长**（音频 setup 段里赋值）。
  // `options.duration` 只是生成脚本时的目标时长，真实配音必然偏离它 ——
  // 旧实现拿它当总时长 ⇒ 画面/字幕与配音越到后面错得越多（lb-2）。
  let masterDuration = duration

  // ── Canvas setup ──
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // ── Load assets ──
  const images = await Promise.all(photos.map(p => loadImage(p)))
  let logoImg: HTMLImageElement | null = null
  if (logoUrl) {
    try { logoImg = await loadImage(logoUrl) } catch { /* skip logo */ }
  }

  let dhVideo: HTMLVideoElement | null = null
  if (digitalHumanVideoUrl) {
    try {
      dhVideo = await loadVideo(digitalHumanVideoUrl)
      dhVideo.loop = true
      dhVideo.play().catch(() => { /* autoplay blocked, will try per-frame */ })
    } catch { /* skip digital human */ }
  }

  // ── Audio setup via AudioContext ──
  let audioContext: AudioContext | null = null
  let audioSource: AudioBufferSourceNode | null = null
  let audioDestination: MediaStreamAudioDestinationNode | null = null

  try {
    audioContext = new AudioContext()
    const audioResponse = await fetch(audioUrl)
    const audioArrayBuffer = await audioResponse.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer)
    // 0.5s 以下视为解码异常（空音频/损坏），继续用目标时长，不让片子变成 0.1 秒
    if (Number.isFinite(audioBuffer.duration) && audioBuffer.duration > 0.5) {
      masterDuration = audioBuffer.duration
    }

    audioSource = audioContext.createBufferSource()
    audioSource.buffer = audioBuffer
    audioDestination = audioContext.createMediaStreamDestination()
    audioSource.connect(audioDestination)
  } catch (e) {
    console.warn('[video-renderer] Audio setup failed, video will be silent:', e)
  }

  // ── 时基锁定：真实音频时长 + 同一份脚本的分句 ──
  // 照片切点与字幕时间窗都只从这一个时钟派生，不再各算一套（lb-2）。
  const totalFrames = Math.ceil(masterDuration * fps)
  const clockLines = slogans.length > 0 ? slogans : [productName]
  const clockRes = buildTtsMasterClock({ durationSec: masterDuration, lines: clockLines })
  const clock: AudioMasterClock | null = clockRes.ok ? clockRes.value : null
  const cues: CaptionCue[] = clock ? captionCues(clock) : []
  if (masterDuration !== duration) {
    console.info(
      `[video-renderer] 时基改用真实配音时长 ${masterDuration.toFixed(2)}s（目标 ${duration}s）`,
    )
  }

  // ── Stream setup ──
  const canvasStream = canvas.captureStream(fps)

  if (audioDestination) {
    audioDestination.stream.getAudioTracks().forEach(track => {
      canvasStream.addTrack(track)
    })
  }

  // Pick best codec — prefer MP4, fallback to WebM
  let mimeType = 'video/webm'
  if (MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4'
  } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E')) {
    mimeType = 'video/mp4;codecs=avc1.42E01E'
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    mimeType = 'video/webm;codecs=vp9'
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    mimeType = 'video/webm;codecs=vp8'
  }

  const recorder = new MediaRecorder(canvasStream, {
    mimeType,
    videoBitsPerSecond: 5_000_000, // 5 Mbps
  })

  const chunks: Blob[] = []
  recorder.ondataavailable = (e: BlobEvent) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  // ── Start recording and audio ──
  recorder.start(100) // Collect data every 100ms

  if (audioSource && audioContext) {
    audioSource.connect(audioContext.destination) // also play for user
    audioSource.start(0)
  }

  // ── Render frames ──
  // 照片切点来自时钟（语义分节）。时钟建不起来才退回等分 —— 保底，不阻断出片。
  const photoCuts = clock ? photoCutPoints(clock, images.length) : []
  const cutStarts =
    images.length > 0 && photoCuts.length === images.length - 1
      ? [0, ...photoCuts]
      : Array.from({ length: Math.max(1, images.length) }, (_, i) => (masterDuration * i) / Math.max(1, images.length))

  let frameIndex = 0

  await new Promise<void>((resolve) => {
    const frameInterval = 1000 / fps
    const startTime = performance.now()

    function renderFrame() {
      const elapsed = (performance.now() - startTime) / 1000
      const expectedFrame = Math.floor(elapsed * fps)

      // Catch up on frames if needed
      while (frameIndex <= expectedFrame && frameIndex < totalFrames) {
        drawFrameAtIndex(frameIndex)
        frameIndex++
      }

      if (frameIndex >= totalFrames) {
        // Flush remaining frames
        setTimeout(() => {
          recorder.stop()
          if (audioSource) {
            try { audioSource.stop() } catch { /* already stopped */ }
          }
          if (audioContext) {
            audioContext.close().catch(() => {})
          }
          if (dhVideo) {
            dhVideo.pause()
            dhVideo.removeAttribute('src')
            dhVideo.load()
          }
          resolve()
        }, 200)
        return
      }

      if (onProgress && frameIndex % 30 === 0) {
        onProgress(frameIndex, totalFrames)
      }

      requestAnimationFrame(renderFrame)
    }

    function drawFrameAtIndex(idx: number) {
      const t = idx / fps // Current time in seconds

      ctx.clearRect(0, 0, WIDTH, HEIGHT)

      // 1. Background
      drawBackground(ctx)

      // 2. 照片：按**时钟切点**选当前这张（不再「总时长 ÷ 张数」）
      let photoIdx = 0
      while (photoIdx < cutStarts.length - 1 && t >= cutStarts[photoIdx + 1]) photoIdx += 1
      photoIdx = clamp(photoIdx, 0, images.length - 1)
      const photoStart = cutStarts[photoIdx] ?? 0
      const photoEnd = cutStarts[photoIdx + 1] ?? masterDuration
      const photoSpan = Math.max(0.001, photoEnd - photoStart)
      const photoProgress = clamp((t - photoStart) / photoSpan, 0, 1)

      // 交叉淡入淡出：每个切点前 TRANSITION_DURATION 内完成
      const remaining = photoEnd - t
      const isTransitioning =
        remaining > 0 && remaining < TRANSITION_DURATION && photoIdx < images.length - 1

      if (isTransitioning) {
        const p = clamp(1 - remaining / TRANSITION_DURATION, 0, 1)
        drawPhotoWithAlpha(ctx, images[photoIdx], photoProgress, 1 - p)
        drawPhotoWithAlpha(ctx, images[photoIdx + 1], 0, p)
      } else {
        drawPhotoKenBurns(ctx, images[photoIdx], photoProgress)
      }

      // 3. Dark overlay gradient for text readability
      const overlayGrad = ctx.createLinearGradient(0, HEIGHT * 0.5, 0, HEIGHT)
      overlayGrad.addColorStop(0, 'rgba(0,0,0,0)')
      overlayGrad.addColorStop(0.5, 'rgba(0,0,0,0.35)')
      overlayGrad.addColorStop(1, 'rgba(0,0,0,0.7)')
      ctx.fillStyle = overlayGrad
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      // 4. 字幕：时间窗来自音频时钟（每句自己的起止），不再整段等分
      if (cues.length > 0) {
        let cueIdx = cues.findIndex((c) => t < c.endSec)
        if (cueIdx === -1) cueIdx = cues.length - 1
        const cue = cues[cueIdx]
        const cueDur = Math.max(0.001, cue.endSec - cue.startSec)
        const local = clamp((t - cue.startSec) / cueDur, 0, 1)
        drawSlogan(ctx, cue.text, local, cueDur, fontFamily)
      } else if (slogans.length > 0) {
        // 时钟建不起来（理论上不会）：退回整段等分，宁可粗糙也别空着
        const slot = masterDuration / slogans.length
        const idx = Math.min(slogans.length - 1, Math.floor(t / slot))
        const local = clamp((t - idx * slot) / slot, 0, 1)
        drawSlogan(ctx, slogans[idx], local, slot, fontFamily)
      }

      // 5. Title card — product name at top during first 3 seconds
      if (t < 4 && productName) {
        const titleAlpha = t < 0.5 ? t / 0.5 : t > 3 ? (4 - t) / 1 : 1
        ctx.font = `bold 56px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = `rgba(255, 255, 255, ${titleAlpha * 0.9})`
        ctx.shadowColor = 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = 10
        ctx.fillText(productName, WIDTH / 2, 100)
        ctx.shadowBlur = 0
      }

      // 6. Digital human PiP
      if (dhVideo && dhVideo.readyState >= 2) {
        drawDigitalHuman(ctx, dhVideo)
      }

      // 7. Logo watermark
      if (logoImg) {
        drawLogo(ctx, logoImg)
      }

      // 8. Bottom branding watermark
      drawWatermark(ctx, fontFamily)
    }

    // Start the render loop
    requestAnimationFrame(renderFrame)
  })

  // ── Return blobs ──
  const videoBlob = new Blob(chunks, { type: mimeType })

  // Also fetch audio as a separate MP3 blob for dual-format download
  let audioBlob: Blob | undefined
  try {
    const audioResponse = await fetch(audioUrl)
    audioBlob = await audioResponse.blob()
  } catch {
    // Audio fetch failed — video still has audio track embedded
  }

  return { videoBlob, audioBlob }
}
