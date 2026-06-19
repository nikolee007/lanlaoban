# 数字人口播视频 P0 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在懒老板新增数字人口播视频生成功能，用户选场景→传照片→写脚本→一键生成数字人视频

**借势原则:** 有免费 API 直接调（Agnes），有开源部署用（TTS后续），用户能做的引导做（拍照P图）

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, react-icons/fi, Agnes API

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `app/digital-human/page.tsx` | 创建 | 数字人口播主页面，5步骤导航 |
| `app/api/digital-human/route.ts` | 重写 | 接收上传 → 调Agnes Image → 调Agnes Video → 返回task_id |
| `app/api/digital-human/status/route.ts` | 创建 | 轮询Agnes Video任务状态 |
| `app/components/NavHeader.tsx` | 修改 | 添加"数字人"导航入口 |
| `lib/agnes-api.ts` | 创建 | Agnes API 统一封装（image + video + status） |

---

### Task 1: 封装 Agnes API 工具函数

**Files:**
- Create: `lib/agnes-api.ts`

- [ ] **Step 1: 创建 Agnes API 封装**

```ts
const AGNES_BASE = process.env.AGNES_API_BASE || 'https://apihub.agnes-ai.com/v1'
const AGNES_KEY = process.env.AGNES_API_KEY || ''

interface AgnesImageResult {
  url: string
}

interface AgnesVideoResult {
  taskId: string
  videoId: string
  status: string
}

interface AgnesTaskStatus {
  status: string
  progress: number
  output?: { url: string }
  error?: string
}

async function agnesFetch(endpoint: string, body: any) {
  const res = await fetch(`${AGNES_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AGNES_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Agnes API error (${res.status}): ${errText}`)
  }
  return res.json()
}

export async function generateImage(prompt: string, size = '1024x1024'): Promise<AgnesImageResult> {
  const data = await agnesFetch('/images/generations', {
    model: 'agnes-image-2.1-flash',
    prompt,
    n: 1,
    size,
  })
  return { url: data.data?.[0]?.url || '' }
}

export async function generateVideo(prompt: string, imageUrl?: string, duration = 10): Promise<AgnesVideoResult> {
  const body: any = {
    model: 'agnes-video-v2.0',
    prompt,
    duration,
    size: '1080x1920',
  }
  if (imageUrl) body.image_url = imageUrl

  const data = await agnesFetch('/video/generations', body)
  return {
    taskId: data.task_id || data.id,
    videoId: data.video_id || '',
    status: data.status || 'queued',
  }
}

export async function queryVideoTask(taskId: string): Promise<AgnesTaskStatus> {
  const data = await agnesFetch(`/video/generations/${taskId}`, {})
  return {
    status: data.status || 'unknown',
    progress: data.progress || 0,
    output: data.output || data.video_url ? { url: data.output || data.video_url } : undefined,
    error: data.error || data.message,
  }
}
```

- [ ] **Step 2: 验证编译通过**

Run: `npx tsc --noEmit lib/agnes-api.ts`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add lib/agnes-api.ts
git commit -m "feat: add Agnes API wrapper for image and video generation"
```

---

### Task 2: 重写数字人 API 路由

**Files:**
- Modify: `app/api/digital-human/route.ts`

- [ ] **Step 1: 重写 POST handler**

替换全部文件内容：

```ts
import { NextRequest, NextResponse } from 'next/server'
import { generateImage, generateVideo } from '@/lib/agnes-api'

// 场景模板 → 生成提示词
const SCENE_PROMPTS: Record<string, string> = {
  standing: 'A Chinese business owner standing in front of their store/shop, wearing professional attire, looking at camera, photorealistic portrait, well-lit, 4K quality',
  sitting: 'A Chinese business owner sitting at a desk/table, professional setting, looking at camera and speaking, photorealistic, well-lit office interior, 4K',
  walking: 'A Chinese business owner walking confidently through their workplace/workshop, candid professional shot, photorealistic, natural lighting, 4K',
  product: 'A Chinese business owner holding a product, showing it to camera, half body shot, photorealistic, well-lit studio, 4K',
  kitchen: 'A Chinese restaurant owner in white chef uniform standing in professional kitchen, looking at camera, photorealistic, steam and cooking ambiance, 4K',
  storefront: 'A Chinese business owner standing at their store entrance with store sign visible, smiling at camera, photorealistic, daytime natural light, 4K',
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const scene = (formData.get('scene') as string) || 'standing'
    const script = (formData.get('script') as string) || ''
    const photoFile = formData.get('photo') as File | null

    // 1. 如果有用户照片，先生成数字人形象
    let imageUrl = ''
    const scenePrompt = SCENE_PROMPTS[scene] || SCENE_PROMPTS.standing

    if (photoFile) {
      // 用户上传了照片 → 用 Image API 生成优化形象
      const imagePrompt = `Based on this person's photo, create a professional portrait: ${scenePrompt}`
      const imgResult = await generateImage(imagePrompt)
      imageUrl = imgResult.url
    } else {
      // 无照片 → 纯 AI 生成数字人
      const imgResult = await generateImage(scenePrompt)
      imageUrl = imgResult.url
    }

    // 2. 生成视频描述（结合脚本内容）
    const videoPrompt = script
      ? `A Chinese business owner talking to camera, saying: "${script.slice(0, 200)}". Professional setting, photorealistic, 4K quality.`
      : scenePrompt.replace('photorealistic portrait', 'a person talking naturally to camera')

    // 3. 提交视频生成任务
    const videoResult = await generateVideo(videoPrompt, imageUrl, 10)

    return NextResponse.json({
      success: true,
      data: {
        taskId: videoResult.taskId,
        imageUrl,
        status: videoResult.status,
        message: '视频生成任务已提交',
      },
    })
  } catch (error: any) {
    console.error('数字人生成失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '生成失败' },
      { status: 500 },
    )
  }
}
```

- [ ] **Step 2: 验证编译通过**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add app/api/digital-human/route.ts
git commit -m "feat: rewrite digital-human API with Agnes image+video integration"
```

---

### Task 3: 创建任务状态轮询 API

**Files:**
- Create: `app/api/digital-human/status/route.ts`

- [ ] **Step 1: 创建状态查询路由**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { queryVideoTask } from '@/lib/agnes-api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId')

  if (!taskId) {
    return NextResponse.json({ success: false, error: '缺少 taskId' }, { status: 400 })
  }

  try {
    const status = await queryVideoTask(taskId)
    return NextResponse.json({ success: true, data: status })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '查询失败' },
      { status: 500 },
    )
  }
}
```

- [ ] **Step 2: 编译验证**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/api/digital-human/status/route.ts
git commit -m "feat: add task status polling API for video generation"
```

---

### Task 4: 创建数字人页面（步骤导航）

**Files:**
- Create: `app/digital-human/page.tsx`

页面结构（与 ai-video 视觉统一）：

```tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { FiCamera, FiUpload, FiUser, FiMonitor, FiEdit3, FiZap, FiChevronLeft, FiDownload, FiClock, FiArrowRight, FiCheck, FiRefreshCw } from 'react-icons/fi'

type Step = 'scene' | 'photo' | 'script' | 'generate' | 'result'
type SceneId = 'standing' | 'sitting' | 'walking' | 'product' | 'kitchen' | 'storefront'

interface SceneTpl {
  id: SceneId
  title: string
  desc: string
  icon: any
  industry: string
  refImage: string
  tip: string
}

const SCENES: SceneTpl[] = [
  { id:'standing', title:'站立口播', desc:'正面站立，门店/车间背景', icon: FiUser, industry:'餐饮·工厂·门店', refImage:'/shooting-templates/standing_restaurant.png', tip:'穿工装或正装，双脚与肩同宽' },
  { id:'sitting', title:'坐姿访谈', desc:'坐办公桌/吧台前', icon: FiMonitor, industry:'知识博主·顾问', refImage:'/shooting-templates/sitting_trust.png', tip:'身体前倾有亲和力，双手放桌面' },
  { id:'walking', title:'走姿讲解', desc:'边走边讲，展示环境', icon: FiCamera, industry:'探店·工厂参观', refImage:'/shooting-templates/walking_restaurant.png', tip:'走慢30%，边走边指给镜头看' },
  { id:'product', title:'产品展示', desc:'手持产品，特写讲解', icon: FiCamera, industry:'好物测评', refImage:'/shooting-templates/closeup_review.png', tip:'双手持产品，展示细节' },
  { id:'kitchen', title:'厨房操作台', desc:'站灶台/操作台前', icon: FiUser, industry:'餐饮·手工艺', refImage:'/shooting-templates/restaurant-美食特写.png', tip:'背景要干净，光线要足' },
  { id:'storefront', title:'门店招牌前', desc:'站店门口/招牌下', icon: FiCamera, industry:'所有实体店', refImage:'/shooting-templates/envshot_restaurant.png', tip:'门头要清晰，白天光线最好' },
]

const SCRIPT_TEMPLATES = [
  { id: 'quick', label: '快速口播', text: '大家好，我是[品牌]的[名字]。今天跟大家聊聊[话题]…关注我，了解更多。' },
  { id: 'story', label: '创业故事', text: '我做[行业]已经[年数]年了。从一开始的[困难]到现在的[成就]，靠的就是[理念]…' },
  { id: 'tip', label: '干货分享', text: '很多人问我[问题]，其实核心就三点：第一…第二…第三…觉得有用点个赞。' },
]

export default function DigitalHumanPage() {
  const [step, setStep] = useState<Step>('scene')
  const [scene, setScene] = useState<SceneId>('standing')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [script, setScript] = useState('')
  const [taskId, setTaskId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<NodeJS.Timeout>()

  const currentScene = SCENES.find(s => s.id === scene)!

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setPhoto(f)
      const reader = new FileReader()
      reader.onload = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(f)
    }
  }

  const generate = async () => {
    setLoading(true)
    setError('')
    setProgress(5)

    try {
      const fd = new FormData()
      fd.append('scene', scene)
      fd.append('script', script)
      if (photo) fd.append('photo', photo)

      const res = await fetch('/api/digital-human', { method: 'POST', body: fd })
      const data = await res.json()

      if (!data.success) { setError(data.error); setLoading(false); return }

      setTaskId(data.data.taskId)
      setImageUrl(data.data.imageUrl)
      setProgress(15)

      // 开始轮询
      const poll = setInterval(async () => {
        const statusRes = await fetch(`/api/digital-human/status?taskId=${data.data.taskId}`)
        const statusData = await statusRes.json()
        if (statusData.success) {
          const s = statusData.data
          setProgress(Math.min(95, 15 + s.progress * 0.8))
          if (s.status === 'completed' || s.status === 'done') {
            setVideoUrl(s.output?.url || '')
            setProgress(100)
            clearInterval(poll)
            setLoading(false)
            setStep('result')
          } else if (s.status === 'failed' || s.error) {
            setError(s.error || '生成失败')
            clearInterval(poll)
            setLoading(false)
          }
        }
      }, 3000)
      pollRef.current = poll
    } catch (e: any) {
      setError(e.message || '网络错误')
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
        <Breadcrumb items={[{ label: '懒老板', href: '/' }, { label: 'AI 数字人口播' }]} />
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-12">

        {/* 步骤导航 */}
        {step !== 'result' && (
          <div className="mb-8">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { k:'scene' as Step, stepNo:'第一步', l:'选场景', desc:'选择拍摄类型', icon:FiCamera },
                { k:'photo' as Step, stepNo:'第二步', l:'传照片', desc:'自拍/P图上传', icon:FiUpload },
                { k:'script' as Step, stepNo:'第三步', l:'写脚本', desc:'AI生成或手写', icon:FiEdit3 },
                { k:'generate' as Step, stepNo:'第四步', l:'生成', desc:'等待AI合成', icon:FiZap },
              ].map(item => (
                <button key={item.k} onClick={() => { if (!loading) setStep(item.k) }}
                  className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 border-2 ${
                    step === item.k ? 'border-transparent shadow-lg scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                  }`}
                  style={step === item.k ? { background: 'linear-gradient(135deg, #FF603415, #8B5CF608)', borderColor: '#FF6034' } : {}}>
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                      step === item.k ? 'text-white shadow-md' : 'bg-gray-100 text-gray-400'
                    }`} style={step === item.k ? { backgroundColor: '#FF6034' } : {}}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">{item.stepNo}</span>
                      <p className={`text-base font-bold ${step === item.k ? 'text-gray-900' : 'text-gray-700'}`}>{item.l}</p>
                      <p className="text-[11px] text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 第一步：选场景 ═══ */}
        {step === 'scene' && (
          <div>
            <div className="mb-6 text-center">
              <h1 className="section-title">AI 数字人口播</h1>
              <p className="section-subtitle mt-2">选一个场景 → 上传照片 → 写脚本 → AI 自动生成数字人视频</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SCENES.map(s => (
                <div key={s.id}
                  onClick={() => { setScene(s.id); setStep('photo') }}
                  className={`card cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-apple-md ${
                    scene === s.id ? 'ring-2 ring-brand-400' : ''
                  }`}>
                  <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-3">
                    <img src={s.refImage} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="h-4 w-4 text-brand-400" />
                    <h3 className="font-semibold text-sm text-gray-900">{s.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{s.desc}</p>
                  <p className="text-[10px] text-gray-400">{s.industry}</p>
                  <p className="text-[10px] text-gray-300 mt-1"> {s.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 第二步：传照片 ═══ */}
        {step === 'photo' && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStep('scene')} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
              <FiChevronLeft className="h-4 w-4" /> 重选场景
            </button>

            <div className="card p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">上传你的照片</h2>
              <p className="text-sm text-gray-400 mb-4">一张正面照，AI 会帮你合成数字人形象。</p>

              {/* 上传区 */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all">
                {photoPreview ? (
                  <div className="relative mx-auto w-40 h-40">
                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-md">
                      <FiCheck className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-center mb-3">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <FiUpload className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">点击上传照片</p>
                    <p className="text-xs text-gray-400">支持 JPG/PNG，建议用美图秀秀/豆包处理后再上传</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </div>
            </div>

            {/* 拍摄建议 */}
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">拍摄建议</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">拍摄 tips</p>
                  <ul className="space-y-1">
                    <li className="text-[11px] text-gray-500">• 找光线好的位置（脸朝向窗）</li>
                    <li className="text-[11px] text-gray-500">• 背景干净，不要乱七八糟</li>
                    <li className="text-[11px] text-gray-500">• 穿纯色衣服，不要条纹/格子</li>
                    <li className="text-[11px] text-gray-500">• 表情自然，微笑看镜头</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-brand-50 p-3">
                  <p className="text-xs font-semibold text-brand-700 mb-1">P图推荐</p>
                  <ul className="space-y-1">
                    <li className="text-[11px] text-gray-500">• 美图秀秀：一键美颜 + 瘦脸</li>
                    <li className="text-[11px] text-gray-500">• 豆包：AI 优化人像</li>
                    <li className="text-[11px] text-gray-500">• 剪裁为 1:1 或 3:4 比例</li>
                    <li className="text-[11px] text-gray-500">• 不要过度修图，自然最好</li>
                  </ul>
                </div>
              </div>
            </div>

            <button onClick={() => setStep('script')} disabled={!photo}
              className="btn-ai w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
              下一步：写脚本 <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ═══ 第三步：写脚本 ═══ */}
        {step === 'script' && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStep('photo')} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
              <FiChevronLeft className="h-4 w-4" /> 返回上传照片
            </button>

            <div className="card p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">输入口播文案</h2>
              <p className="text-sm text-gray-400 mb-4">数字人会对着镜头说出这段话（20-30秒效果最佳）</p>

              <textarea value={script} onChange={e => setScript(e.target.value)}
                placeholder="输入你想让数字人说的话..."
                rows={5}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 resize-none" />
              <p className="text-xs text-gray-400 mt-1">{script.length} 字 · 建议 80-150 字</p>
            </div>

            {/* 快速模板 */}
            <div className="card p-5 mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">快速模板</h3>
              <div className="space-y-2">
                {SCRIPT_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setScript(t.text)}
                    className="w-full text-left rounded-lg border border-gray-100 p-3 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
                    <p className="text-xs font-semibold text-gray-700">{t.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{t.text}</p>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={!script.trim() || loading}
              className="btn-ai w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
              <FiZap className="h-4 w-4" /> {loading ? '生成中...' : '一键生成数字人视频'}
            </button>
          </div>
        )}

        {/* ═══ 第四步：生成中 ═══ */}
        {step === 'generate' && loading && (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <FiZap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">AI 正在生成你的数字人...</h2>
            <p className="text-sm text-gray-400 mb-8">约 1-3 分钟，请耐心等待</p>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400">{Math.round(progress)}%</p>
            {imageUrl && (
              <div className="mt-6 rounded-xl overflow-hidden border border-gray-100">
                <img src={imageUrl} alt="生成的数字人形象" className="w-full h-48 object-cover" />
                <p className="text-[10px] text-gray-400 p-2">数字人形象预览</p>
              </div>
            )}
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          </div>
        )}

        {/* ═══ 第五步：结果 ═══ */}
        {step === 'result' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-black mb-6 aspect-[9/16] max-h-[500px]">
              {videoUrl ? (
                <video src={videoUrl} controls className="w-full h-full object-contain" autoPlay />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <FiCamera className="h-12 w-12 text-gray-600" />
                </div>
              )}
            </div>

            <div className="card p-6 text-left">
              <h3 className="text-base font-bold text-gray-900 mb-3">视频信息</h3>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between"><span>场景</span><span className="text-gray-700">{currentScene.title}</span></div>
                <div className="flex justify-between"><span>文案</span><span className="text-gray-700 line-clamp-1">{script || '-'}</span></div>
                <div className="flex justify-between"><span>时长</span><span className="text-gray-700">约 10 秒</span></div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 flex-wrap justify-center">
              {videoUrl && (
                <a href={videoUrl} download="数字人视频.mp4"
                  className="btn-primary inline-flex items-center gap-2">
                  <FiDownload className="h-4 w-4" /> 下载视频
                </a>
              )}
              <button onClick={() => { setStep('scene'); setPhoto(null); setPhotoPreview(''); setScript(''); setVideoUrl(''); setImageUrl(''); setProgress(0) }}
                className="btn-outline inline-flex items-center gap-2">
                <FiRefreshCw className="h-4 w-4" /> 重新生成
              </button>
            </div>
          </div>
        )}

        {/* 底部说明 */}
        {step !== 'generate' && step !== 'result' && (
          <div className="mt-8 rounded-2xl bg-gradient-to-b from-brand-50 to-white border border-brand-100/50 p-6 text-center">
            <p className="text-sm font-semibold text-gray-900">借势，不是造轮子</p>
            <p className="text-xs text-gray-400 mt-1">照片用美图秀秀/豆包处理 | 视频由 Agnes AI 生成 | 声音合成即将上线</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 1: 创建页面文件**

Write the above content to `app/digital-human/page.tsx`

- [ ] **Step 2: 编译验证**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: 功能验证**

```bash
# 启动服务器
npx next start --hostname 0.0.0.0 -p 3000 &
# 访问页面
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/digital-human"
```

Expected: HTTP 200

- [ ] **Step 4: Commit**

```bash
git add app/digital-human/page.tsx
git commit -m "feat: add digital human video generation page with step-by-step wizard"
```

---

### Task 5: 导航添加入口

**Files:**
- Modify: `app/components/NavHeader.tsx`

- [ ] **Step 1: 在一键短视频下拉菜单中添加"数字人口播"入口**

找到 `NavHeader.tsx` 中"一键短视频"相关的 dropdown 区域，在现有菜单项后添加：

```tsx
// 在 一键短视频 下拉菜单中找到列表区域，添加:
{
  label: '数字人口播',
  href: '/digital-human',
  desc: '上传照片→AI生成数字人视频',
  badge: 'NEW',
},
```

具体位置：在 `ai-video` 项之后。

- [ ] **Step 2: 编译验证**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: 确认导航显示**

```bash
curl -s "http://localhost:3000/" | grep -o '数字人口播'
```

Expected: 显示入口文字

- [ ] **Step 4: Commit**

```bash
git add app/components/NavHeader.tsx
git commit -m "feat: add digital human entry in nav"
```

---

### Task 6: 构建并全量验证

- [ ] **Step 1: 完整构建**

```bash
rm -rf .next && npx next build
```

Expected: `✓ Compiled successfully` + `✓ Generating static pages (75/75)`

- [ ] **Step 2: 启动验证**

```bash
npx next start --hostname 0.0.0.0 -p 3000 &
```

- [ ] **Step 3: 验证所有关键页面**

```bash
curl -s -o /dev/null -w "首页: %{http_code}\n" "http://localhost:3000/"
curl -s -o /dev/null -w "数字人: %{http_code}\n" "http://localhost:3000/digital-human"
curl -s -o /dev/null -w "AI视频: %{http_code}\n" "http://localhost:3000/ai-video"
curl -s -o /dev/null -w "建站: %{http_code}\n" "http://localhost:3000/myshop/shop_1780905483215_w08x"
```

Expected: All 200

- [ ] **Step 4: 最终提交**

```bash
git commit -m "chore: complete digital human P0 with full build verification"
```
