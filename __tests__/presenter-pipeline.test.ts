import { describe, it, expect } from 'vitest'
import {
  PRODUCTION_STATES,
  EVIDENCE_REQUIRED,
  advance,
  advanceTo,
  newJob,
  buildAudioMasterClock,
  buildTtsMasterClock,
  photoCutPoints,
  timeWithin,
  captionCues,
  cutPoints,
  canRequestPaidCall,
  approvePlan,
  planFingerprint,
  recordPaidOutcome,
  materiallyChangesProvider,
  loudnormPass1Command,
  loudnormPass2Command,
  buildDeliveryPlan,
  contactSheetTimestamps,
  buildMachineQaReport,
  finishDelivery,
  LOUDNESS_TARGET_LUFS,
  type PaidCallPlan,
  type PresenterJob,
} from '@/lib/presenter-pipeline'

const plan = (over: Partial<PaidCallPlan> = {}): PaidCallPlan => ({
  provider: 'agnes-api',
  assets: ['presenter.png'],
  unit: 'seconds',
  requestedUnits: 10,
  pilotUnits: 10,
  knownCostYuan: null,
  expectedOutput: 'presenter pilot 10s',
  ...over,
})

function jobWithRights(): PresenterJob {
  const j = newJob('presenter.png', 'topic:上下文工程')
  return { ...j, evidence: { ...j.evidence, rightsConfirmed: true } }
}

describe('① 8 状态状态机', () => {
  it('状态表就是 LANSHU 那 8 格、顺序一致', () => {
    expect(PRODUCTION_STATES).toEqual([
      'intake',
      'content_locked',
      'audio_locked',
      'visual_plan_locked',
      'presenter_generated',
      'composition_checked',
      'rendered',
      'verified',
    ])
    expect(PRODUCTION_STATES).toHaveLength(8)
    expect(Object.keys(EVIDENCE_REQUIRED)).toHaveLength(8)
  })

  it('全新 job 落在 intake，缺证据不许前进', () => {
    const j = newJob('presenter.png', 'topic:x')
    expect(j.state).toBe('intake')
    const r = advance(j)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.code).toBe('MISSING_EVIDENCE')
      expect(r.message).toContain('script')
    }
  })

  it('证据齐了才逐格推进，且不能跳级', () => {
    let j = newJob('presenter.png', 'topic:x')
    const skip = advanceTo(j, 'audio_locked')
    expect(skip.ok).toBe(false)
    if (!skip.ok) expect(skip.code).toBe('SKIP_STATE')

    const r1 = advance(j, { script: 's', beatSheet: 'b', pronunciationList: 'p' })
    expect(r1.ok).toBe(true)
    if (r1.ok) j = r1.value
    expect(j.state).toBe('content_locked')

    const r2 = advance(j, { narrationAudio: 'final.wav', asrReport: 'qa/asr/asr.txt', sectionDurations: 42 })
    expect(r2.ok).toBe(true)
    if (r2.ok) j = r2.value
    expect(j.state).toBe('audio_locked')
  })

  it('verified 是终态', () => {
    const j: PresenterJob = { ...newJob('p', 't'), state: 'verified' }
    const r = advance(j)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('ALREADY_VERIFIED')
  })

  it('空串/false/0 不算证据', () => {
    const j = newJob('presenter.png', 'topic:x')
    const r = advance(j, { script: '   ', beatSheet: 'b', pronunciationList: 'p' })
    expect(r.ok).toBe(false)
  })
})

describe('② 音频总时钟', () => {
  const ok = () =>
    buildAudioMasterClock({
      durationSec: 30,
      asrOk: true,
      sections: [
        { id: 'hook', script: '开场', startSec: 0, durationSec: 5 },
        { id: 'beat1', script: '卖点一', startSec: 5, durationSec: 12 },
        { id: 'close', script: '收尾', startSec: 17, durationSec: 13 },
      ],
    })

  it('ASR 未过的音频不得锁时钟', () => {
    const r = buildAudioMasterClock({ durationSec: 30, asrOk: false, sections: [] })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('NO_AUDIO_CLOCK')
  })

  it('区间越界/重叠都拒收', () => {
    const over = buildAudioMasterClock({
      durationSec: 10,
      asrOk: true,
      sections: [{ id: 'a', script: 'x', startSec: 8, durationSec: 5 }],
    })
    expect(over.ok).toBe(false)
    if (!over.ok) expect(over.code).toBe('OUT_OF_CLOCK')

    const overlap = buildAudioMasterClock({
      durationSec: 20,
      asrOk: true,
      sections: [
        { id: 'a', script: 'x', startSec: 0, durationSec: 8 },
        { id: 'b', script: 'y', startSec: 6, durationSec: 3 },
      ],
    })
    expect(overlap.ok).toBe(false)
    if (!overlap.ok) expect(overlap.code).toBe('CUE_OVERLAP')
  })

  it('字幕与切点全部由时钟派生（不是手写时间）', () => {
    const r = ok()
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const cues = captionCues(r.value)
    expect(cues).toHaveLength(3)
    expect(cues[1]).toEqual({ id: 'beat1', startSec: 5, endSec: 17, text: '卖点一' })
    expect(cutPoints(r.value)).toEqual([0, 5, 17])
    // 时钟带 ±0.05s 浮点容差：界内视为合法，明显越界才拒
    expect(timeWithin(r.value, 30.01).ok).toBe(true)
    expect(timeWithin(r.value, 30.5).ok).toBe(false)
    expect(timeWithin(r.value, -0.5).ok).toBe(false)
    const inRange = timeWithin(r.value, 12)
    expect(inRange.ok && inRange.value).toBe(12)
  })
})

// lb-2（2026-10-18）：brand-promotion 的真实 TTS 时基 —— 没有 ASR，只有「总时长真值 + 按句长估算」。
describe('②-b TTS 时基（brand-promotion）', () => {
  it('按分句字长分配；总时长严格等于真实音频时长', () => {
    const r = buildTtsMasterClock({ durationSec: 30, lines: ['短句', '这是一句明显更长的卖点文案'] })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const [a, b] = r.value.sections
    expect(a.startSec).toBe(0)
    expect(b.startSec).toBeCloseTo(a.durationSec, 3)
    expect(a.startSec + a.durationSec + b.durationSec).toBeCloseTo(30, 2)
    // 长句拿到更多时间（等分会各 15s）
    expect(b.durationSec).toBeGreaterThan(a.durationSec)
    // 字幕窗与时钟一致
    expect(captionCues(r.value)[1].endSec).toBeCloseTo(30, 2)
  })

  it('非法输入拒绝建时钟（不许静默回 0 时长）', () => {
    expect(buildTtsMasterClock({ durationSec: 0, lines: ['x'] }).ok).toBe(false)
    expect(buildTtsMasterClock({ durationSec: 10, lines: [] }).ok).toBe(false)
    expect(buildTtsMasterClock({ durationSec: 10, lines: ['   '] }).ok).toBe(false)
  })

  it('画面切点：照片多于分节时在节内等分；少于分节时落在分节起点', () => {
    // 故意让第二句远长于其他句：4 节等分时 2 张图的切点会是机械的 15s，
    // 按字长分配后应落在「第三句起点」（约 25s） —— 两者必须分得开，否则测试是空转。
    const r = buildTtsMasterClock({
      durationSec: 30,
      lines: ['一', '这是一句明显更长的第二句文案', '三', '四'],
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const two = photoCutPoints(r.value, 2)
    expect(two).toHaveLength(1)
    expect(two[0]).toBeGreaterThan(20)
    expect(two[0]).toBeLessThan(30)

    const many = photoCutPoints(r.value, 8)
    expect(many).toHaveLength(7)
    expect([...many].sort((a, b) => a - b)).toEqual(many)
    expect(many[many.length - 1]).toBeLessThan(30)
  })
})

describe('③ 成本护栏', () => {
  it('无批准即请求付费 ⇒ NO_APPROVAL', () => {
    const r = canRequestPaidCall(jobWithRights(), plan())
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('NO_APPROVAL')
  })

  it('同计划复用批准 ⇒ 放行；指纹随计划变动', () => {
    const p = plan()
    const j: PresenterJob = { ...jobWithRights(), approvals: [approvePlan(p, 'NIKO', '2026-09-27T19:20:00+08:00')] }
    expect(canRequestPaidCall(j, plan()).ok).toBe(true)
    expect(planFingerprint(plan())).toBe(planFingerprint(p))
    expect(planFingerprint(plan({ requestedUnits: 11 }))).not.toBe(planFingerprint(p))
    const r = canRequestPaidCall(j, plan({ requestedUnits: 11 }))
    expect(r.ok).toBe(false)
  })

  it('试片先行：没出过被接受的候选，不许超试片尺寸', () => {
    const pilot = plan({ requestedUnits: 10, pilotUnits: 10 })
    const j: PresenterJob = { ...jobWithRights(), approvals: [approvePlan(pilot, 'NIKO', 'now')] }
    const big = plan({ requestedUnits: 120, pilotUnits: 10 })
    const r = canRequestPaidCall(j, big)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('PILOT_REQUIRED')
  })

  it('换供应商 = 实质变更 ⇒ 重新批准', () => {
    const p = plan()
    const j: PresenterJob = { ...jobWithRights(), approvals: [approvePlan(p, 'NIKO', 'now')] }
    const other = plan({ provider: 'heygen' })
    expect(materiallyChangesProvider(j, other)).toBe(true)
    const r = canRequestPaidCall(j, other)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('PLAN_MISMATCH')
  })

  it('3 次付费候选被否 ⇒ 停机（上限 3）', () => {
    const p = plan()
    let j: PresenterJob = { ...jobWithRights(), approvals: [approvePlan(p, 'NIKO', 'now')] }
    for (let i = 0; i < 3; i++) {
      j = recordPaidOutcome(j, p, false)
      if (i < 2) expect(canRequestPaidCall(j, p).ok).toBe(true)
    }
    expect(j.rejectedCandidates).toBe(3)
    const r = canRequestPaidCall(j, p)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('REJECTION_CEILING')
  })

  it('被接受的候选把连败计数清零', () => {
    const p = plan()
    let j: PresenterJob = { ...jobWithRights(), approvals: [approvePlan(p, 'NIKO', 'now')] }
    j = recordPaidOutcome(j, p, false)
    j = recordPaidOutcome(j, p, true)
    expect(j.rejectedCandidates).toBe(0)
    expect(j.acceptedCandidates).toBe(1)
    expect(j.providers).toEqual(['agnes-api'])
  })

  it('碰声音/形象但没有授权留痕 ⇒ 拦下', () => {
    const j = newJob('presenter.png', 'topic:x')
    const r = canRequestPaidCall(j, plan({ touchesVoiceOrLikeness: true }))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('RIGHTS_NOT_CONFIRMED')
  })
})

describe('④ 交付规范：联络表 + 机器质检 + -16 LUFS', () => {
  it('两遍响度归一化命令带目标与实测回填', () => {
    expect(loudnormPass1Command('r.mp4')).toContain(`I=${LOUDNESS_TARGET_LUFS}`)
    const cmd = loudnormPass2Command('r.mp4', 'out/m.mp4', {
      input_i: -20.4,
      input_lra: 6.1,
      input_tp: -3.2,
      input_thresh: -30.5,
    })
    expect(cmd).toContain('measured_I=-20.4')
    expect(cmd).toContain('linear=true')
    expect(cmd).toContain('TP=-1.5')
  })

  it('交付计划含 master + share', () => {
    const d = buildDeliveryPlan({
      renderedFile: 'renders/rendered.mp4',
      outputsDir: 'outputs',
      name: 'my-video',
      measuredLoudness: { input_i: -20.4, input_lra: 6.1, input_tp: -3.2, input_thresh: -30.5 },
    })
    expect(d.outputs.master).toBe('outputs/my-video-master.mp4')
    expect(d.outputs.share).toBe('outputs/my-video-share.mp4')
    expect(d.commands).toHaveLength(2)
    expect(d.qa).toEqual(['machine', 'visual'])
  })

  it('联络表恰 9 帧且都落在片长内', () => {
    const r = contactSheetTimestamps(42)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value).toHaveLength(9)
    expect(r.value[0]).toBeCloseTo(2.333, 2)
    expect(r.value[8]).toBeLessThan(42)
  })

  it('机器质检：响度/时长/解码任一不合格即不过', () => {
    const clock = buildAudioMasterClock({
      durationSec: 30,
      asrOk: true,
      sections: [{ id: 'hook', script: 'x', startSec: 0, durationSec: 30 }],
    })
    if (!clock.ok) throw new Error('clock fixture failed')
    const good = buildMachineQaReport(
      { decodeOk: true, hasVideoStream: true, hasAudioStream: true, durationSec: 30.2, integratedLufs: -16.2, truePeakDbtp: -1.6 },
      clock.value
    )
    expect(good.passed).toBe(true)
    const bad = buildMachineQaReport(
      { decodeOk: true, hasVideoStream: true, hasAudioStream: false, durationSec: 33, integratedLufs: -12, truePeakDbtp: -0.2 },
      clock.value
    )
    expect(bad.passed).toBe(false)
    expect(bad.failures).toHaveLength(4)
  })

  it('机器质检没过 ⇒ 交付门禁拦住 verified', () => {
    const j: PresenterJob = { ...newJob('p', 't'), state: 'rendered' }
    const blocked = finishDelivery(j, { deliveryReport: 'r.txt', contactSheet: 'c.jpg', visualQa: 'v.txt', machineQa: 'qa/reports/machine.md' })
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) expect(blocked.code).toBe('QA_FAILED')
  })

  it('全流程 happy path 一次走通 8 格', () => {
    let j = newJob('presenter.png', 'topic:x')
    const steps: Array<Record<string, unknown>> = [
      { script: 's', beatSheet: 'b', pronunciationList: 'p' },
      { narrationAudio: 'final.wav', asrReport: 'qa/asr/asr.txt', sectionDurations: 30 },
      { route: 'presenter-led', timeline: 'docs/TIMELINE.md', storyboard: 'docs/STORYBOARD.md' },
      { providerRecord: 'qa/requests/agnes.json', pilotAccepted: true },
      { compositionCheck: 'qa/reports/composition.md' },
      { renderOutput: 'renders/rendered.mp4', machineQa: 'qa/reports/machine.md passed=true' },
    ]
    for (const patch of steps) {
      const r = advance(j, patch as never)
      expect(r.ok).toBe(true)
      if (!r.ok) return
      j = r.value
    }
    expect(j.state).toBe('rendered')
    const done = finishDelivery(j, {
      deliveryReport: 'outputs/report.md',
      contactSheet: 'qa/contacts/sheet.jpg',
      visualQa: 'qa/reports/visual.md passed=true',
      machineQa: 'qa/reports/machine.md passed=true',
    })
    expect(done.ok).toBe(true)
    if (done.ok) expect(done.value.state).toBe('verified')
  })
})
