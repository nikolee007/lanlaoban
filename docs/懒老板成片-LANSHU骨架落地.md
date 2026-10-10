# 懒老板成片 · LANSHU 流程骨架落地（交付规范 + 接线清单）

- 来源骨架：**LANSHU** — `cclank/lanshu-create-ai-presenter-video`（MIT，1,351★；2026-09-27 取 SKILL.md 原文）
- 落地形态：`lib/presenter-pipeline.ts`（纯函数、零依赖、零费用）+ `__tests__/presenter-pipeline.test.ts`（21 用例全绿）
- 原则：**只搬流程骨架与交付规范，不搬其代码、不引其依赖**（零许可与供应链风险）
- 本班（B班 2026-09-27 19:15）**未接线到页面、未 push**（push=Vercel 上线=对外不可逆，按 L2 待老大）

## 一、四件骨架怎么落到懒老板

| 骨架 | 落在哪 | 解决懒老板哪个已知缺口 |
|---|---|---|
| ① 8 状态生产状态机（无证据不许前进） | `PRODUCTION_STATES` + `advance()` / `advanceTo()` | 现在 `/brand-promotion` 一次点击直出成片，中途失败无状态、无留痕、无法续跑 |
| ② 音频总时钟（锁定的旁白=唯一时基） | `buildAudioMasterClock()` + `captionCues()` / `cutPoints()` / `timeWithin()` | 现在字幕/文案滑入/照片切点各自计时（`video-renderer.ts` 三组常量），改音频长度即错位 |
| ③ 成本护栏 | `canRequestPaidCall()` / `approvePlan()` / `recordPaidOutcome()` | 数字人/音色克隆一旦接 API 即真花钱，现无试片先行、无重试上限、无「同计划复用批准」 |
| ④ 交付规范 | `buildDeliveryPlan()` / `loudnormPass1|2Command()` / `contactSheetTimestamps()` / `buildMachineQaReport()` / `finishDelivery()` | 现在只有浏览器录屏 Blob 直接下载：无母版/分享版之分、无响度归一、无机器质检、无联络表 |

## 二、8 状态与门槛（进状态前必须先有证据）

```
intake → content_locked → audio_locked → visual_plan_locked
       → presenter_generated → composition_checked → rendered → verified
```

| 状态 | 必须已有证据 |
|---|---|
| intake | presenterImage、contentSource |
| content_locked | script、beatSheet、pronunciationList |
| audio_locked | narrationAudio、asrReport、sectionDurations |
| visual_plan_locked | route、timeline、storyboard |
| presenter_generated | providerRecord、pilotAccepted |
| composition_checked | compositionCheck |
| rendered | renderOutput、machineQa |
| verified | deliveryReport、contactSheet、visualQa |

禁跳级（`SKIP_STATE`）、缺证据拒推（`MISSING_EVIDENCE`）、`verified` 为终态、机器质检不过禁止交付（`QA_FAILED`）。

## 三、成本护栏口径（可直接抄进产品文案/后台提示）

1. **试片先行**：首次付费请求量不得超过 `pilotUnits`，且必须已有一次被接受的试片（`PILOT_REQUIRED`）。
2. **计划即批准**：一次性声明「上传素材 / 单位与量 / 已知成本（未知必须写未知）/ 试片尺寸 / 重试上限 / 预期产物」→ 指纹 `fp_xxxxxxxx` 落库；**同计划复用批准，改动即失效**。
3. **3 次失败停**：付费候选连续被否达上限（默认 3）⇒ 停机报老大（`REJECTION_CEILING`）。
4. **实质变更需重新批准**：换供应商 / 影响成本·隐私·声音·形象的动作（`PLAN_MISMATCH`）。
5. **合规硬闸门**：用本人肖像或声音前必须有授权留痕（`RIGHTS_NOT_CONFIRMED`），对应 09-10 审计 P0。

## 四、交付规范（现成命令）

```bash
# 1) 两遍响度归一化：先测量
ffmpeg -hide_banner -i renders/rendered.mp4 \
  -af loudnorm=I=-16:LRA=11:TP=-1.5:print_format=json -f null -

# 2) 按实测值线性应用 → 母版（-16 LUFS / LRA 11 / TP -1.5 dBTP）
ffmpeg -hide_banner -i renders/rendered.mp4 -c:v copy \
  -af loudnorm=I=-16:LRA=11:TP=-1.5:measured_I=..:measured_LRA=..:measured_TP=..:measured_thresh=..:offset=..:linear=true \
  -c:a aac -b:a 192k outputs/<name>-master.mp4

# 3) 联络表 9 帧（等分片长，含首尾内缩）+ 机器质检 + 视觉质检双份
```

机器质检项：完整解码 / 视频流 / 音频流 / 时长与时钟偏差 ≤0.5s / 整体响度 -16±1.0 LUFS / 真峰值 ≤ -1.0 dBTP。
产物目录（`REQUIRED_JOB_ARTIFACTS`）：`job.json`、`docs/`、`assets/{source,audio,video,captions}`、`qa/{requests,asr,contacts,reports}`、`renders/`、`outputs/`。

## 五、下一步接线清单（留给后续班次 / 老大定）

1. `/brand-promotion` 页在「开始生成」前先 `advance` 到 `visual_plan_locked`：把现在的 TTS 音频时长写进 `buildAudioMasterClock()`，用 `captionCues()`/`cutPoints()` 替换 `video-renderer.ts` 里的独立计时常量（**这一步才真正消除字幕与画面错位**）。
2. 生成完成后走 `buildDeliveryPlan()`：录屏 Blob 落盘 → 两遍 loudnorm → 母版/分享版 → `buildMachineQaReport()` 出 `qa/reports/machine.md`。
3. 一旦接入数字人/音色克隆 API：付费调用前必过 `canRequestPaidCall()`，批准留痕进 `job.json`。
4. 本文件与 `lib/presenter-pipeline.ts` 尚未 commit/push（push 即 Vercel 上线）；接线完成、老大看过再一次性上。
