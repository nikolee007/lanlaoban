/**
 * 懒老板成片管线 · 流程骨架与交付规范（LANSHU 骨架落地）
 *
 * 骨架来源：LANSHU — https://github.com/cclank/lanshu-create-ai-presenter-video
 *          （MIT；2026-09-27 取 SKILL.md 原文，只搬流程骨架与交付规范，不搬代码/不引依赖）
 *
 * 三件骨架（本文件即"可执行的规范"）：
 *   ① 8 状态生产状态机 —— 无证据不许前进（intake → … → verified）
 *   ② 音频总时钟 —— 锁定的旁白是唯一时基，字幕/图形/切点/时长全部由它派生
 *   ③ 成本护栏 —— 试片先行 / 付费前计划声明（同计划可复用批准）/ 3 次失败停 /
 *      改供应商·声音·形象·隐私须重新批准 / 肖像与声音授权闸门
 *   ④ 交付规范 —— 联络表（9 帧）+ 机器质检报告 + 两遍响度归一化 -16 LUFS
 *
 * 纯函数、零外部依赖，可在浏览器端与 Node 端共用；单测见 __tests__/presenter-pipeline.test.ts
 */

/* ───────────────────────── ① 8 状态生产状态机 ───────────────────────── */

export const PRODUCTION_STATES = [
  'intake',
  'content_locked',
  'audio_locked',
  'visual_plan_locked',
  'presenter_generated',
  'composition_checked',
  'rendered',
  'verified',
] as const

export type ProductionState = (typeof PRODUCTION_STATES)[number]

/** 进入某状态前"必须已存在"的证据键（空串/false/0 一律视为未提供） */
export const EVIDENCE_REQUIRED: Record<ProductionState, readonly string[]> = {
  intake: ['presenterImage', 'contentSource'],
  content_locked: ['script', 'beatSheet', 'pronunciationList'],
  audio_locked: ['narrationAudio', 'asrReport', 'sectionDurations'],
  visual_plan_locked: ['route', 'timeline', 'storyboard'],
  presenter_generated: ['providerRecord', 'pilotAccepted'],
  composition_checked: ['compositionCheck'],
  rendered: ['renderOutput', 'machineQa'],
  verified: ['deliveryReport', 'contactSheet', 'visualQa'],
}

export const REQUIRED_JOB_ARTIFACTS = [
  'job.json',
  'docs/{SCRIPT,BEAT_SHEET,TIMELINE,STORYBOARD}.md',
  'assets/source/',
  'assets/audio/{reference,raw,final}/',
  'assets/video/{candidates,selected,render}/',
  'assets/captions/',
  'qa/{requests,asr,contacts,reports}/',
  'renders/',
  'outputs/',
] as const

export type PipelineErrorCode =
  | 'SKIP_STATE'
  | 'MISSING_EVIDENCE'
  | 'ALREADY_VERIFIED'
  | 'NO_AUDIO_CLOCK'
  | 'OUT_OF_CLOCK'
  | 'CUE_OVERLAP'
  | 'NO_APPROVAL'
  | 'PLAN_MISMATCH'
  | 'REJECTION_CEILING'
  | 'PILOT_REQUIRED'
  | 'RIGHTS_NOT_CONFIRMED'
  | 'QA_FAILED'

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; code: PipelineErrorCode; message: string }

export type EvidenceValue = string | number | boolean | null

export interface Approval {
  planFingerprint: string
  approvedBy: string
  approvedAt: string
  plan: PaidCallPlan
}

export interface PresenterJob {
  state: ProductionState
  evidence: Record<string, EvidenceValue>
  providers: string[]
  rejectedCandidates: number
  acceptedCandidates: number
  approvals: Approval[]
}

export function newJob(presenterImage: string, contentSource: string): PresenterJob {
  return {
    state: 'intake',
    evidence: { presenterImage, contentSource },
    providers: [],
    rejectedCandidates: 0,
    acceptedCandidates: 0,
    approvals: [],
  }
}

function isProvided(v: EvidenceValue | undefined): boolean {
  if (v === undefined || v === null) return false
  if (typeof v === 'string') return v.trim().length > 0
  if (typeof v === 'number') return Number.isFinite(v) && v !== 0
  return v === true
}

export function nextState(state: ProductionState): ProductionState | null {
  const i = PRODUCTION_STATES.indexOf(state)
  return i >= 0 && i < PRODUCTION_STATES.length - 1 ? PRODUCTION_STATES[i + 1] : null
}

export function missingEvidence(job: PresenterJob, target: ProductionState): string[] {
  return EVIDENCE_REQUIRED[target].filter((k) => !isProvided(job.evidence[k]))
}

/** 只记录证据，不推进状态（任何状态都可补记录） */
export function recordEvidence(job: PresenterJob, patch: Record<string, EvidenceValue>): PresenterJob {
  return { ...job, evidence: { ...job.evidence, ...patch } }
}

/**
 * 推进一格。禁止跳级、禁止缺证据；已 verified 不能再推。
 * 返回新 job（不可变），失败时返回带机器可识别 code 的错误。
 */
export function advance(
  job: PresenterJob,
  patch: Record<string, EvidenceValue> = {}
): Result<PresenterJob> {
  const withEvidence = recordEvidence(job, patch)
  const target = nextState(withEvidence.state)
  if (!target) {
    return { ok: false, code: 'ALREADY_VERIFIED', message: 'verified 为终态，不能继续推进' }
  }
  const miss = missingEvidence(withEvidence, target)
  if (miss.length > 0) {
    return {
      ok: false,
      code: 'MISSING_EVIDENCE',
      message: `进入 ${target} 前缺少证据：${miss.join(', ')}`,
    }
  }
  return { ok: true, value: { ...withEvidence, state: target } }
}

/** 显式指定目标状态的推进（非相邻即 SKIP_STATE），用于校验"禁跳级" */
export function advanceTo(
  job: PresenterJob,
  target: ProductionState,
  patch: Record<string, EvidenceValue> = {}
): Result<PresenterJob> {
  const withEvidence = recordEvidence(job, patch)
  if (nextState(withEvidence.state) !== target) {
    return {
      ok: false,
      code: 'SKIP_STATE',
      message: `只允许逐格推进：${withEvidence.state} → ${String(nextState(withEvidence.state))}，不能直接到 ${target}`,
    }
  }
  return advance(withEvidence)
}

/* ───────────────────────── ② 音频总时钟 ───────────────────────── */

export interface ClockSection {
  id: string
  script: string
  /** 相对成片起点，秒 */
  startSec: number
  durationSec: number
}

export interface AudioMasterClock {
  durationSec: number
  sections: ClockSection[]
  lockedAt: string
}

const CLOCK_EPS = 0.05

/**
 * 锁定旁白后建立唯一时基。要求 ASR 已校验（asrOk=true）、区间不重叠、不越界。
 */
export function buildAudioMasterClock(input: {
  durationSec: number
  sections: ClockSection[]
  asrOk: boolean
  lockedAt?: string
}): Result<AudioMasterClock> {
  const { durationSec, sections, asrOk } = input
  if (!asrOk) {
    return { ok: false, code: 'NO_AUDIO_CLOCK', message: '未通过 ASR 校验的音频不得锁定时钟' }
  }
  if (!(durationSec > 0)) {
    return { ok: false, code: 'NO_AUDIO_CLOCK', message: '音频时长必须为正数' }
  }
  if (sections.length === 0) {
    return { ok: false, code: 'NO_AUDIO_CLOCK', message: '分节为空，无法建时钟' }
  }
  const ordered = [...sections].sort((a, b) => a.startSec - b.startSec)
  let prevEnd = 0
  for (const s of ordered) {
    if (!(s.durationSec > 0)) {
      return { ok: false, code: 'OUT_OF_CLOCK', message: `分节 ${s.id} 时长非正` }
    }
    if (s.startSec < -CLOCK_EPS) {
      return { ok: false, code: 'OUT_OF_CLOCK', message: `分节 ${s.id} 起点为负` }
    }
    if (s.startSec + CLOCK_EPS < prevEnd) {
      return { ok: false, code: 'CUE_OVERLAP', message: `分节 ${s.id} 与前一节重叠` }
    }
    if (s.startSec + s.durationSec > durationSec + CLOCK_EPS) {
      return {
        ok: false,
        code: 'OUT_OF_CLOCK',
        message: `分节 ${s.id} 结束 ${(s.startSec + s.durationSec).toFixed(3)}s 超出音频时长 ${durationSec}s`,
      }
    }
    prevEnd = s.startSec + s.durationSec
  }
  return {
    ok: true,
    value: { durationSec, sections: ordered, lockedAt: input.lockedAt ?? new Date().toISOString() },
  }
}

/** 时钟内任一时刻必须落在 [0, durationSec]，字幕/图形/切点全部走这一道 */
export function timeWithin(clock: AudioMasterClock, t: number): Result<number> {
  if (!(t >= -CLOCK_EPS && t <= clock.durationSec + CLOCK_EPS)) {
    return {
      ok: false,
      code: 'OUT_OF_CLOCK',
      message: `时刻 ${t}s 越界（时钟 ${clock.durationSec}s）`,
    }
  }
  return { ok: true, value: Math.max(0, Math.min(clock.durationSec, t)) }
}

export interface CaptionCue {
  id: string
  startSec: number
  endSec: number
  text: string
}

/** 字幕由时钟派生：切点=分节起点，时长=分节时长，不允许手写独立时间 */
export function captionCues(clock: AudioMasterClock): CaptionCue[] {
  return clock.sections.map((s) => ({
    id: s.id,
    startSec: s.startSec,
    endSec: Number((s.startSec + s.durationSec).toFixed(3)),
    text: s.script,
  }))
}

/** 画面切点 = 各节起点（编辑规范：作者手写 start/duration 与源偏移相互独立） */
export function cutPoints(clock: AudioMasterClock): number[] {
  return clock.sections.map((s) => s.startSec)
}

/**
 * 由 **TTS 音频时长 + 同一份脚本的分句** 建时钟（brand-promotion 渲染用）。
 *
 * ⚠️ 与 `buildAudioMasterClock` 的区别必须说清：那条要求 `asrOk=true`（逐句时间戳经 ASR 校验）；
 *    这里**没有 ASR**，分句边界是按文本长度比例**估算**的 —— 总时长是真值（解码后的音频），
 *    句间边界是估计。名字里带 Tts 就是提醒调用方别把它当逐字时间戳用。
 *    之所以敢用：TTS 读的就是这些分句的拼接，同一份文本按字符数分配，误差远小于
 *    原先「整段时长 ÷ 句数」的等分（中文长句短句长度差可达 3 倍）。
 */
export function buildTtsMasterClock(input: {
  durationSec: number
  lines: string[]
  lockedAt?: string
}): Result<AudioMasterClock> {
  const { durationSec, lines } = input
  if (!(durationSec > 0)) {
    return { ok: false, code: 'NO_AUDIO_CLOCK', message: '音频时长必须为正数' }
  }
  const cleaned = lines.map((l) => String(l ?? '').trim()).filter(Boolean)
  if (cleaned.length === 0) {
    return { ok: false, code: 'NO_AUDIO_CLOCK', message: '分句为空，无法建时钟' }
  }
  // 权重 = 非空白字符数（中文一字一拍；英文按字符近似）。至少 1，避免纯标点行把除数打成 0。
  const weights = cleaned.map((l) => Math.max(1, Array.from(l.replace(/\s/g, '')).length))
  const totalWeight = weights.reduce((a, b) => a + b, 0)

  const sections: ClockSection[] = []
  let cursor = 0
  for (let i = 0; i < cleaned.length; i += 1) {
    const isLast = i === cleaned.length - 1
    // 最后一节吃掉全部余量：浮点舍入误差不许在片尾留下一小截空白
    const dur = isLast
      ? Math.max(0.01, Number((durationSec - cursor).toFixed(3)))
      : Math.max(0.01, Number(((durationSec * weights[i]) / totalWeight).toFixed(3)))
    sections.push({
      id: `tts-${i + 1}`,
      script: cleaned[i],
      startSec: Number(cursor.toFixed(3)),
      durationSec: dur,
    })
    cursor += dur
  }
  // 末尾超差（累加舍入）就收回最后一节，保证永远不越界
  const last = sections[sections.length - 1]
  if (last.startSec + last.durationSec > durationSec) {
    last.durationSec = Number(Math.max(0.01, durationSec - last.startSec).toFixed(3))
  }
  return { ok: true, value: { durationSec, sections, lockedAt: input.lockedAt ?? new Date().toISOString() } }
}

/**
 * 画面切点：把 `photoCount - 1` 个切点分配到各分节边界上。
 *   · 照片 ≤ 分节：切点落在分节起点（一次讲话换一张图，不抢话）；
 *   · 照片 > 分节：多出来的照片在该节内部等分（不让某张图跨两个语义段而不切）。
 * 返回值不含 0 与结尾（调用方自己补），长度恒为 `photoCount - 1`。
 */
export function photoCutPoints(clock: AudioMasterClock, photoCount: number): number[] {
  const n = Math.floor(photoCount)
  if (n <= 1) return []
  const secs = clock.sections
  const cuts: number[] = []
  for (let i = 1; i < n; i += 1) {
    if (secs.length === 0) {
      cuts.push(Number(((clock.durationSec * i) / n).toFixed(3)))
      continue
    }
    const pos = (i / n) * secs.length
    const idx = Math.min(secs.length - 1, Math.max(0, Math.floor(pos)))
    const within = pos - idx
    const t = secs[idx].startSec + secs[idx].durationSec * within
    cuts.push(Number(t.toFixed(3)))
  }
  return cuts
}

/* ───────────────────────── ③ 成本护栏 ───────────────────────── */

export const DEFAULT_RETRY_CEILING = 3

export interface PaidCallPlan {
  provider: string
  model?: string
  /** 将上传到远端的素材清单（声明给批准人） */
  assets: string[]
  unit: 'seconds' | 'images' | 'calls'
  requestedUnits: number
  /** 试片先行：首次付费必须 ≤ 此值 */
  pilotUnits: number
  /** 已知成本（人民币元）；未知写 null，也必须在声明里体现"未知" */
  knownCostYuan: number | null
  retryCeiling?: number
  expectedOutput: string
  /** 声音克隆 / 本人形象驱动 = 生物特征，必须已有授权留痕 */
  touchesVoiceOrLikeness?: boolean
}

/** 稳定指纹：同计划可复用既有批准，改动即失效 */
export function planFingerprint(plan: PaidCallPlan): string {
  const canonical = JSON.stringify([
    plan.provider,
    plan.model ?? '',
    [...plan.assets].sort().join('|'),
    plan.unit,
    plan.requestedUnits,
    plan.pilotUnits,
    plan.knownCostYuan,
    plan.retryCeiling ?? DEFAULT_RETRY_CEILING,
    plan.expectedOutput,
    plan.touchesVoiceOrLikeness === true,
  ])
  let h = 0x811c9dc5
  for (let i = 0; i < canonical.length; i++) {
    h ^= canonical.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return `fp_${h.toString(16).padStart(8, '0')}`
}

export function approvePlan(plan: PaidCallPlan, approvedBy: string, approvedAt: string): Approval {
  return { planFingerprint: planFingerprint(plan), approvedBy, approvedAt, plan }
}

/** 供应商变化 = 实质变更（成本/隐私/声音/形象都可能变）⇒ 必须重新批准 */
export function materiallyChangesProvider(job: PresenterJob, plan: PaidCallPlan): boolean {
  const approved = job.approvals.map((a) => a.plan.provider)
  return approved.length > 0 && !approved.includes(plan.provider)
}

export function canRequestPaidCall(job: PresenterJob, plan: PaidCallPlan): Result<PaidCallPlan> {
  if (plan.touchesVoiceOrLikeness && !isProvided(job.evidence.rightsConfirmed)) {
    return {
      ok: false,
      code: 'RIGHTS_NOT_CONFIRMED',
      message: '用本人肖像/声音做商业内容前，须先有书面授权留痕（rightsConfirmed）',
    }
  }
  const ceiling = plan.retryCeiling ?? DEFAULT_RETRY_CEILING
  if (job.rejectedCandidates >= ceiling) {
    return {
      ok: false,
      code: 'REJECTION_CEILING',
      message: `已连续 ${job.rejectedCandidates} 次付费候选被否（上限 ${ceiling}）⇒ 停机报老大`,
    }
  }
  const fp = planFingerprint(plan)
  const exact = job.approvals.find((a) => a.planFingerprint === fp)
  if (exact) {
    return { ok: true, value: plan }
  }
  if (materiallyChangesProvider(job, plan)) {
    return {
      ok: false,
      code: 'PLAN_MISMATCH',
      message: `供应商变化（${job.approvals[0].plan.provider} → ${plan.provider}）属实质变更 ⇒ 须重新批准`,
    }
  }
  if (plan.requestedUnits > plan.pilotUnits && job.acceptedCandidates === 0) {
    return {
      ok: false,
      code: 'PILOT_REQUIRED',
      message: `试片先行：首次付费上限 ${plan.pilotUnits}${plan.unit}，本次请求 ${plan.requestedUnits}${plan.unit}`,
    }
  }
  return {
    ok: false,
    code: 'NO_APPROVAL',
    message: '该计划无对应批准 ⇒ 先向批准人声明（素材/单位与量/已知成本/试片尺寸/重试上限/预期产物）',
  }
}

export function recordPaidOutcome(
  job: PresenterJob,
  plan: PaidCallPlan,
  accepted: boolean
): PresenterJob {
  return {
    ...job,
    providers: job.providers.includes(plan.provider)
      ? job.providers
      : [...job.providers, plan.provider],
    rejectedCandidates: accepted ? 0 : job.rejectedCandidates + 1,
    acceptedCandidates: accepted ? job.acceptedCandidates + 1 : job.acceptedCandidates,
  }
}

/* ───────────────────────── ④ 交付规范 ───────────────────────── */

export const LOUDNESS_TARGET_LUFS = -16
export const LOUDNESS_LRA = 11
export const LOUDNESS_TRUE_PEAK_DBTP = -1.5
export const CONTACT_SHEET_FRAMES = 9

/** 两遍响度归一化 · 第一遍（测量，只读输出 json） */
export function loudnormPass1Command(inputFile: string): string {
  return `ffmpeg -hide_banner -i ${inputFile} -af loudnorm=I=${LOUDNESS_TARGET_LUFS}:LRA=${LOUDNESS_LRA}:TP=${LOUDNESS_TRUE_PEAK_DBTP}:print_format=json -f null -`
}

/** 两遍响度归一化 · 第二遍（按实测值线性应用，保持原比例） */
export function loudnormPass2Command(
  inputFile: string,
  outputFile: string,
  measured: { input_i: number | string; input_lra: number | string; input_tp: number | string; input_thresh: number | string; target_offset?: number | string }
): string {
  const parts = [
    `I=${LOUDNESS_TARGET_LUFS}`,
    `LRA=${LOUDNESS_LRA}`,
    `TP=${LOUDNESS_TRUE_PEAK_DBTP}`,
    `measured_I=${measured.input_i}`,
    `measured_LRA=${measured.input_lra}`,
    `measured_TP=${measured.input_tp}`,
    `measured_thresh=${measured.input_thresh}`,
    `offset=${measured.target_offset ?? 0}`,
    'linear=true',
    'print_format=summary',
  ]
  return `ffmpeg -hide_banner -i ${inputFile} -c:v copy -af loudnorm=${parts.join(':')} -c:a aac -b:a 192k ${outputFile}`
}

export interface DeliveryPlan {
  outputs: { master: string; share: string }
  commands: string[]
  qa: readonly ['machine', 'visual']
}

export function buildDeliveryPlan(input: {
  renderedFile: string
  outputsDir: string
  name: string
  measuredLoudness: { input_i: number | string; input_lra: number | string; input_tp: number | string; input_thresh: number | string; target_offset?: number | string }
}): DeliveryPlan {
  const master = `${input.outputsDir}/${input.name}-master.mp4`
  const share = `${input.outputsDir}/${input.name}-share.mp4`
  return {
    outputs: { master, share },
    commands: [
      loudnormPass2Command(input.renderedFile, master, input.measuredLoudness),
      `ffmpeg -hide_banner -i ${master} -vf scale=trunc(iw/2)*2:trunc(ih/2)*2 -c:v libx264 -crf 24 -preset medium -c:a aac -b:a 128k ${share}`,
    ],
    qa: ['machine', 'visual'],
  }
}

/** 联络表 9 帧（等分，含首尾内缩） */
export function contactSheetTimestamps(durationSec: number, frames = CONTACT_SHEET_FRAMES): Result<number[]> {
  if (!(durationSec > 0) || frames < 2) {
    return { ok: false, code: 'OUT_OF_CLOCK', message: '时长须为正、帧数 ≥2' }
  }
  const out: number[] = []
  for (let i = 0; i < frames; i++) {
    out.push(Number((((i + 0.5) * durationSec) / frames).toFixed(3)))
  }
  return { ok: true, value: out }
}

export interface MachineQaProbe {
  decodeOk: boolean
  hasVideoStream: boolean
  hasAudioStream: boolean
  durationSec: number
  integratedLufs: number | null
  truePeakDbtp: number | null
}

export interface MachineQaReport {
  passed: boolean
  failures: string[]
  fields: MachineQaProbe
}

/** 机器质检：全解码 + 流齐全 + 与时钟对齐（±0.5s）+ 响度 ±1.0 LU + 峰值 ≤ -1.0 dBTP */
export function buildMachineQaReport(probe: MachineQaProbe, clock: AudioMasterClock): MachineQaReport {
  const failures: string[] = []
  if (!probe.decodeOk) failures.push('未能完整解码')
  if (!probe.hasVideoStream) failures.push('缺视频流')
  if (!probe.hasAudioStream) failures.push('缺音频流')
  if (Math.abs(probe.durationSec - clock.durationSec) > 0.5) {
    failures.push(`时长 ${probe.durationSec}s 与时钟 ${clock.durationSec}s 偏差 >0.5s`)
  }
  if (probe.integratedLufs === null) {
    failures.push('未测到整体响度')
  } else if (Math.abs(probe.integratedLufs - LOUDNESS_TARGET_LUFS) > 1.0) {
    failures.push(`整体响度 ${probe.integratedLufs} LUFS 偏离目标 ${LOUDNESS_TARGET_LUFS}±1.0`)
  }
  if (probe.truePeakDbtp === null) {
    failures.push('未测到真峰值')
  } else if (probe.truePeakDbtp > -1.0) {
    failures.push(`真峰值 ${probe.truePeakDbtp} dBTP 超过 -1.0`)
  }
  return { passed: failures.length === 0, failures, fields: probe }
}

/** 交付门禁：机器质检不过 ⇒ 不得进入 verified */
export function finishDelivery(
  job: PresenterJob,
  artifacts: Record<string, EvidenceValue>
): Result<PresenterJob> {
  const qa = artifacts.machineQa
  if (typeof qa !== 'string' || !qa.includes('passed=true')) {
    return { ok: false, code: 'QA_FAILED', message: '机器质检未通过，禁止交付' }
  }
  return advanceTo(job, 'verified', artifacts)
}
