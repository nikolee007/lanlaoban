/**
 * 懒老板视频生成管线
 *
 * 三种生成模式：
 * A - 数字人口播（需要外接 API Key，如 HeyGen / D-ID）
 * B - 幻灯片 + TTS 配音（本地 FFmpeg + OpenAI TTS）
 * C - 剪辑脚本素材包（JSON 导出，剪辑师可直接使用）
 */

export type VideoGenMode = 'A' | 'B' | 'C'

export interface VideoSegment {
  index: number
  title: string
  content: string
  emotion: string
  shotType: string
  shotDesc: string
  duration: number // 秒
}

export interface VideoPackage {
  bossName: string
  industry: string
  segments: VideoSegment[]
  totalDuration: number
  modes: {
    A: DigitalHumanPackage | null
    B: SlideshowPackage | null
    C: EditingPackage | null
  }
}

// ─── C: 剪辑脚本素材包 ─────────────────────────

export interface EditingPackage {
  title: string
  description: string
  /** 每条脚本作为一个独立素材包 */
  clips: EditingClip[]
  /** 封面文件建议 */
  coverSuggestion: string
  /** BGM 建议 */
  bgmSuggestion: string
}

export interface EditingClip {
  index: number
  title: string
  timeRange: string
  content: string
  /** 情绪钩子（剪辑师参考） */
  emotionHook: string
  /** 机位类型 */
  shotType: string
  /** 拍摄描述 */
  shotDesc: string
  /** 建议镜头时长(秒) */
  duration: number
  /** 是否建议用素材库片段 */
  useStockFootage: boolean
  /** 字幕建议 */
  subtitleSuggestion: string
}

export function buildEditingPackage(
  bossName: string,
  industry: string,
  segments: VideoSegment[]
): EditingPackage {
  return {
    title: `${bossName} · ${industry} · 短视频素材包`,
    description: `本素材包包含 ${segments.length} 条短视频的完整剪辑脚本，每条包含台词、机位、情绪指导和字幕建议。剪辑师可直接按此包制作。`,
    clips: segments.map((seg) => ({
      index: seg.index,
      title: seg.title,
      timeRange: `0:${String(Math.floor(seg.duration * seg.index / 60)).padStart(2, '0')}→0:${String(Math.floor(seg.duration * (seg.index + 1) / 60)).padStart(2, '0')}`,
      content: seg.content,
      emotionHook: seg.emotion,
      shotType: seg.shotType,
      shotDesc: seg.shotDesc,
      duration: seg.duration,
      useStockFootage: seg.shotType === '空镜' || seg.shotType === '环境',
      subtitleSuggestion: seg.content.length > 80 ? '分段字幕，每行不超过15字' : '整段字幕',
    })),
    coverSuggestion: `建议使用 ${bossName} 正面半身照 + "${industry}" 行业关键词做封面标题`,
    bgmSuggestion: industry === '餐饮' ? '轻快温馨的吉他曲'
      : industry === '教育' ? '知识类沉稳钢琴曲'
      : '积极向上的轻音乐',
  }
}

// ─── B: 幻灯片 + TTS ─────────────────────────

export interface SlideshowPackage {
  /** 每段对应的 TTS 音频文本 */
  ttsSegments: TTSegment[]
  /** 每段建议的配图描述（可用于 AI 生图或 stock photo 搜索） */
  imagePrompts: string[]
  /** 输出建议参数 */
  outputSpec: {
    resolution: string
    fps: number
    format: string
  }
}

export interface TTSegment {
  text: string
  voice: string // 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  duration: number
}

export function buildSlideshowPackage(segments: VideoSegment[]): SlideshowPackage {
  // 为每段匹配不同音色，增加变化
  const voices = ['onyx', 'nova', 'echo', 'fable', 'shimmer', 'alloy'] as const
  return {
    ttsSegments: segments.map((seg, i) => ({
      text: seg.content,
      voice: voices[i % voices.length],
      duration: seg.duration,
    })),
    imagePrompts: segments.map(seg => {
      if (seg.shotType === '自拍') return '一位中国老板对着镜头自信说话，真实的工作环境背景，暖色调'
      if (seg.shotType === '特写') return '产品细节特写，高清微距，商业摄影风格'
      if (seg.shotType === '行走') return '中国老板在自己的工作场所行走，自然纪实风格'
      if (seg.shotType === '环境') return '中国本地小店的真实环境，有烟火气的街边小店'
      return '中国真实的商业场景，自然光线'
    }),
    outputSpec: {
      resolution: '1080x1920',
      fps: 30,
      format: 'mp4',
    },
  }
}

// ─── A: 数字人框架 ─────────────────────────

export interface DigitalHumanPackage {
  /** 每段对应的数字人脚本 */
  scripts: DigitalHumanScript[]
  /** 数字人形象建议 */
  avatarSuggestion: string
  /** 背景建议 */
  backgroundSuggestion: string
  /** 需要接入的数字人 API */
  apiProvider: 'heygen' | 'did' | 'custom'
}

export interface DigitalHumanScript {
  script: string
  /** 镜头运动：固定 / 轻微前推 */
  cameraMovement: 'static' | 'push_in'
  /** 情绪标签，传递给数字人引擎控制表情 */
  emotionTag: string
}

export function buildDigitalHumanPackage(
  bossName: string,
  segments: VideoSegment[]
): DigitalHumanPackage {
  return {
    scripts: segments.map(seg => ({
      script: seg.content,
      cameraMovement: seg.index === 0 ? 'push_in' : 'static',
      emotionTag: seg.emotion.split('→')[0] || 'neutral',
    })),
    avatarSuggestion: `${bossName} 的真人数字人形象，建议使用 HeyGen 1:1 克隆`,
    backgroundSuggestion: '简约办公室背景或与行业相关的实景背景',
    apiProvider: 'heygen',
  }
}

// ─── 统一组装 ─────────────────────────

export function buildVideoPackage(
  bossName: string,
  industry: string,
  segments: VideoSegment[],
  modes: VideoGenMode[]
): VideoPackage {
  const pkg: VideoPackage = {
    bossName,
    industry,
    segments,
    totalDuration: segments.reduce((sum, s) => sum + s.duration, 0),
    modes: { A: null, B: null, C: null },
  }

  if (modes.includes('C')) {
    pkg.modes.C = buildEditingPackage(bossName, industry, segments)
  }
  if (modes.includes('B')) {
    pkg.modes.B = buildSlideshowPackage(segments)
  }
  if (modes.includes('A')) {
    pkg.modes.A = buildDigitalHumanPackage(bossName, segments)
  }

  return pkg
}

/** 生成 ABC 三种交付模式的描述文本 */
export function describeDeliveryModes(): string {
  return `📦 懒老板视频交付支持三种模式：

模式 A · 数字人口播
生成你的 AI 数字人形象，输入脚本即可自动产出真人质感的短视频。
（需接入 HeyGen / D-ID API）

模式 B · 幻灯片 + AI 配音
自动将脚本 + 配图 + AI 语音合成为一条可直接发布的视频。
（需 FFmpeg + TTS API）

模式 C · 剪辑脚本包
将所有脚本、拍摄指导、情绪标注、字幕建议打包为 JSON 素材包，
你的剪辑师可直接导入使用。

模式 C 无需任何额外配置，立即可用。`
}
