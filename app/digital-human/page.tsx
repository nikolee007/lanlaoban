'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '@/app/contexts/ToastContext'
import { addRenderTask, getRenderTasks, getRenderTask, clearRenderTasks } from '@/app/components/BackgroundTaskMonitor'
import {
  FiCamera, FiUpload, FiUser, FiMonitor, FiEdit3, FiZap,
  FiChevronLeft, FiDownload, FiArrowRight, FiCheck, FiRefreshCw,
  FiMic, FiVolume2, FiClock, FiExternalLink, FiTrash2, FiList,
  FiVideo, FiMusic, FiGlobe, FiPlay,
} from 'react-icons/fi'

type Step = 'scene' | 'photo' | 'script' | 'voice' | 'generate' | 'result'
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
  { id:'standing', title:'站立口播', desc:'正面站立，门店/车间背景', icon: FiUser, industry:'餐饮 · 工厂 · 门店', refImage:'/shooting-templates/standing_restaurant.png', tip:'穿工装或正装，双脚与肩同宽' },
  { id:'sitting', title:'坐姿访谈', desc:'坐办公桌/吧台前', icon: FiMonitor, industry:'知识博主 · 顾问', refImage:'/shooting-templates/sitting_trust.png', tip:'身体前倾有亲和力，双手放桌面' },
  { id:'walking', title:'走姿讲解', desc:'边走边讲，展示环境', icon: FiCamera, industry:'探店 · 工厂参观', refImage:'/shooting-templates/walking_restaurant.png', tip:'走慢30%，边走边指给镜头看' },
  { id:'product', title:'产品展示', desc:'手持产品，特写讲解', icon: FiCamera, industry:'好物测评', refImage:'/shooting-templates/closeup_review.png', tip:'双手持产品，展示细节' },
  { id:'kitchen', title:'厨房操作台', desc:'站灶台/操作台前', icon: FiUser, industry:'餐饮 · 手工艺', refImage:'/shooting-templates/restaurant-美食特写.png', tip:'背景要干净，光线要足' },
  { id:'storefront', title:'门店招牌前', desc:'站店门口/招牌下', icon: FiCamera, industry:'所有实体店', refImage:'/shooting-templates/envshot_restaurant.png', tip:'门头要清晰，白天光线最好' },
]

const SCRIPT_TEMPLATES = [
  { id: 'quick', label: '快速口播', text: '大家好，我是[品牌]的[名字]。今天跟大家聊聊[话题]…关注我，了解更多。' },
  { id: 'story', label: '创业故事', text: '我做[行业]已经[年数]年了。从一开始的[困难]到现在的[成就]，靠的就是[理念]…' },
  { id: 'tip', label: '干货分享', text: '很多人问我[问题]，其实核心就三点：第一…第二…第三…觉得有用点个赞。' },
]

const PROGRESS_STAGES = [
  { min: 0, max: 10, label: '提交任务到 AI 服务器...', time: '约 5 秒' },
  { min: 10, max: 30, label: 'AI 正在生成数字人形象...', time: '约 30 秒' },
  { min: 30, max: 70, label: 'AI 正在合成口播视频...', time: '约 1-2 分钟' },
  { min: 70, max: 90, label: '正在生成配音...', time: '约 30 秒' },
  { min: 90, max: 100, label: '最终处理中...', time: '约 10 秒' },
]

function getStage(progress: number) {
  return PROGRESS_STAGES.find(s => progress >= s.min && progress < s.max) || PROGRESS_STAGES[PROGRESS_STAGES.length - 1]
}

const VOICE_CLONE_KEY = 'lanlaoban_voice_clones'

interface VoiceClone {
  id: string
  name: string
  createdAt: number
}

function getVoiceClones(): VoiceClone[] {
  try { return JSON.parse(localStorage.getItem(VOICE_CLONE_KEY) || '[]') } catch { return [] }
}

function saveVoiceClone(clone: VoiceClone) {
  const clones = getVoiceClones()
  clones.unshift(clone)
  localStorage.setItem(VOICE_CLONE_KEY, JSON.stringify(clones.slice(0, 10)))
}

export default function DigitalHumanPage() {
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('scene')
  const [scene, setScene] = useState<SceneId>('standing')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [videoMode, setVideoMode] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>('')
  const [script, setScript] = useState('')
  const [voice, setVoice] = useState('zh-CN-XiaoxiaoNeural')
  const [voices, setVoices] = useState<Record<string, string>>({})
  const [clonedVoices, setClonedVoices] = useState<VoiceClone[]>([])
  const [audioUrl, setAudioUrl] = useState('')
  const [taskId, setTaskId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [submittedAt, setSubmittedAt] = useState(0)
  const [error, setError] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [history, setHistory] = useState(false)

  // Voice cloning states
  const [cloneName, setCloneName] = useState('')
  const [cloneAudio, setCloneAudio] = useState<File | null>(null)
  const [cloneAudioPreview, setCloneAudioPreview] = useState('')
  const [cloning, setCloning] = useState(false)
  const [cloneProgress, setCloneProgress] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const cloneAudioRef = useRef<HTMLInputElement>(null)
  const cloneFileRef = useRef<HTMLInputElement>(null)

  const currentScene = SCENES.find(s => s.id === scene)!

  useEffect(() => {
    fetch('/api/tts')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.voices) setVoices(data.data.voices)
      })
      .catch(() => {})
    setClonedVoices(getVoiceClones())

    const tid = new URLSearchParams(window.location.search).get('task')
    if (tid) {
      const task = getRenderTask(tid)
      if (task) {
        if (task.status === 'completed') {
          setTaskId(task.taskId); setVideoUrl(task.videoUrl || ''); setAudioUrl(task.audioUrl || '')
          setScript(task.script); setProgress(100); setStep('result')
        } else if (task.status === 'failed') { setError(task.error || '生成失败') }
      }
    }
  }, [])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setPhoto(f)
      const reader = new FileReader()
      reader.onload = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(f)
    }
  }

  // 视频上传 → 提取首帧当照片
  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setVideoFile(f)
      const url = URL.createObjectURL(f)
      setVideoPreview(url)
      // No photo yet - will capture on play
      setPhoto(null)
      setPhotoPreview('')
    }
  }

  const captureVideoFrame = () => {
    const vid = videoRef.current
    if (!vid || !vid.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = vid.videoWidth
    canvas.height = vid.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(vid, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    // Convert data URL to File
    fetch(dataUrl).then(r => r.blob()).then(blob => {
      const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' })
      setPhoto(file)
      setPhotoPreview(dataUrl)
      showToast('已提取视频首帧作为形象照片', 'success')
    })
  }

  const aiGenerateScript = async () => {
    setAiGenerating(true)
    try {
      const sceneInfo = SCENES.find(s => s.id === scene)
      const res = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `请帮我写一段 20-30 秒的短视频口播文案，场景是"${sceneInfo?.title}"，${sceneInfo?.desc}。要求：口语化、自然、像老板对镜头说话。只输出文案内容，不要解释。`,
          history: [],
          context: '你是一个专业的短视频文案写手，为实体店老板写口播文案。语气要接地气，不要书面化。',
        }),
      })
      const data = await res.json()
      if (data.success && data.data?.reply) {
        setScript(data.data.reply.replace(/^["']|["']$/g, '').trim())
        showToast('文案已生成', 'success')
      }
    } catch {}
    setAiGenerating(false)
  }

  // 声音克隆 — 上传音频/视频
  const handleCloneAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setCloneAudio(f)
    const url = URL.createObjectURL(f)
    setCloneAudioPreview(url)
    // Auto-extract name
    if (!cloneName) setCloneName(f.name.replace(/\.[^.]+$/, ''))
  }

  const submitVoiceClone = async () => {
    if (!cloneAudio || !cloneName.trim()) return
    setCloning(true)
    setCloneProgress('上传音频中...')
    try {
      const fd = new FormData()
      fd.append('audio', cloneAudio)
      fd.append('name', cloneName.trim())

      const res = await fetch('/api/voice-clone', { method: 'POST', body: fd })
      const data = await res.json()

      if (data.success && data.data?.voiceId) {
        const clone: VoiceClone = { id: data.data.voiceId, name: cloneName.trim(), createdAt: Date.now() }
        saveVoiceClone(clone)
        setClonedVoices(getVoiceClones())
        setCloneAudio(null)
        setCloneAudioPreview('')
        setCloneName('')
        showToast(`声音「${cloneName}」克隆完成，随时可用`, 'success')
      } else {
        showToast(data.error || '克隆失败', 'error')
      }
    } catch (e: any) {
      showToast('克隆失败：' + (e.message || '网络错误'), 'error')
    }
    setCloning(false)
    setCloneProgress('')
  }

  const useClonedVoice = (id: string) => {
    setVoice(id)
    showToast('已切换到克隆声音', 'success')
  }

  const generate = async () => {
    setLoading(true); setError(''); setProgress(0); setSubmittedAt(Date.now())
    setStatusMessage('提交任务到 AI 服务器...'); setStep('generate')
    try {
      const fd = new FormData()
      fd.append('scene', scene); fd.append('script', script)
      if (photo) fd.append('photo', photo)
      if (voice) fd.append('voice', voice)

      const res = await fetch('/api/digital-human', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) { setError(data.data?.error || data.error || '提交失败'); setLoading(false); return }

      const tid = data.data.taskId
      setTaskId(tid)
      addRenderTask({ taskId: tid, scene, script, voice })
      setProgress(8)

      const startTime = Date.now()
      const MAX_WAIT = 8 * 60 * 1000
      let ttsDone = false

      const poll = setInterval(async () => {
        try {
          if (Date.now() - startTime > MAX_WAIT) {
            setError('生成超时（超过 8 分钟）'); clearInterval(poll); setLoading(false); return
          }
          const statusRes = await fetch(`/api/digital-human/status?taskId=${tid}`)
          const statusData = await statusRes.json()
          if (statusData.success) {
            const s = statusData.data
            const pct = s.progress || 0
            const displayPct = Math.min(90, 15 + pct * 0.75)
            setProgress(displayPct)
            const stage = getStage(displayPct)
            setStatusMessage(`${stage.label}（${stage.time}）`)

            if (s.status === 'completed' || s.status === 'done' || s.status === 'succeeded') {
              const video = s.output?.url || ''
              setVideoUrl(video); clearInterval(poll)

              if (!ttsDone) {
                ttsDone = true; setProgress(92); setStatusMessage('正在生成配音...')
                try {
                  const ttsRes = await fetch('/api/tts', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: script, voice, speed: 1.0 }),
                  })
                  const ttsData = await ttsRes.json()
                  if (ttsData.success && ttsData.data?.audio) {
                    const binary = atob(ttsData.data.audio)
                    const bytes = new Uint8Array(binary.length)
                    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
                    setAudioUrl(URL.createObjectURL(new Blob([bytes], { type: 'audio/mp3' })))
                  }
                } catch {}
              }
              setProgress(100); setStatusMessage('完成！'); setLoading(false); setStep('result')
              showToast('数字人视频已生成！', 'success')
            } else if (s.status === 'failed' || s.error) {
              setError(s.error || '生成失败'); clearInterval(poll); setLoading(false)
            }
          }
        } catch {}
      }, 3000)
      return () => clearInterval(poll)
    } catch (e: any) { setError(e.message || '网络错误'); setLoading(false) }
  }

  const resetAll = () => {
    setStep('scene'); setPhoto(null); setPhotoPreview(''); setVideoFile(null); setVideoPreview('')
    setScript(''); setVoice('zh-CN-XiaoxiaoNeural'); setAudioUrl(''); setVideoUrl('')
    setImageUrl(''); setProgress(0); setError(''); setStatusMessage(''); setSubmittedAt(0)
  }

  const navigateToResult = (tid: string) => { window.location.href = `/digital-human?task=${tid}` }

  const renderTasks = getRenderTasks()
  const recentTasks = renderTasks.slice(0, 5)

  const stepNav = [
    { k:'scene' as Step, stepNo:'第一步', l:'选场景', desc:'选择拍摄类型', icon:FiCamera },
    { k:'photo' as Step, stepNo:'第二步', l:'传照片/视频', desc:'自拍或上传', icon:FiVideo },
    { k:'script' as Step, stepNo:'第三步', l:'写脚本', desc:'AI生成或手写', icon:FiEdit3 },
    { k:'voice' as Step, stepNo:'第四步', l:'选声音/克隆', desc:'选配音或克隆', icon:FiVolume2 },
    { k:'generate' as Step, stepNo:'第五步', l:'生成', desc:'等待AI合成', icon:FiZap },
  ]

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
            <div className="grid gap-2 sm:grid-cols-5">
              {stepNav.filter(s => s.k !== 'generate' || step === 'generate').map(item => (
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
            <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400">
              {[1,2,3,4,5].map(n => (
                <span key={n} className="flex items-center gap-2">
                  {n > 1 && <span className="text-gray-300">—</span>}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-[10px]">{n}</span>
                </span>
              ))}
            </div>
            {recentTasks.filter(t => t.status === 'rendering' || t.status === 'queued').length > 0 && step !== 'generate' && (
              <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <FiClock className="h-4 w-4 animate-pulse" />
                  <span>{recentTasks.filter(t => t.status === 'rendering' || t.status === 'queued').length} 个任务后台渲染中</span>
                </div>
                <button onClick={() => setHistory(!history)} className="text-xs text-blue-600 underline">查看</button>
              </div>
            )}
          </div>
        )}

        {/* 任务历史 */}
        {history && (
          <div className="mb-6 card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">渲染任务</h3>
              <div className="flex gap-2">
                <button onClick={() => { clearRenderTasks(); setHistory(false) }}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"><FiTrash2 className="h-3 w-3" /> 清空</button>
                <button onClick={() => setHistory(false)} className="text-xs text-gray-400 hover:text-gray-600">关闭</button>
              </div>
            </div>
            {recentTasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">暂无渲染任务</p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map(t => (
                  <div key={t.taskId} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-green-500' : t.status === 'failed' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`} />
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          {t.status === 'completed' ? '已完成' : t.status === 'failed' ? '失败' : t.status === 'rendering' ? '渲染中' : '排队中'}
                        </p>
                        <p className="text-[10px] text-gray-400">{new Date(t.createdAt).toLocaleTimeString('zh-CN')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {t.status === 'completed' && (
                        <button onClick={() => navigateToResult(t.taskId)} className="text-xs text-brand-400 hover:text-brand-500 flex items-center gap-1">
                          <FiExternalLink className="h-3 w-3" /> 查看
                        </button>
                      )}
                      {t.status === 'failed' && <span className="text-xs text-red-400">{t.error?.slice(0, 20)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ 第一步：选场景 ═══ */}
        {step === 'scene' && (
          <div>
            {recentTasks.filter(t => t.status === 'completed').length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiList className="h-4 w-4" />
                  <span>最近 {recentTasks.filter(t => t.status === 'completed').length} 个已完成</span>
                </div>
                <button onClick={() => setHistory(true)} className="text-xs text-brand-400 hover:text-brand-500">查看全部</button>
              </div>
            )}
            <div className="mb-6 text-center">
              <h1 className="section-title">AI 数字人口播</h1>
              <p className="section-subtitle mt-2">上传照片或视频 → AI 生成数字人形象 + 配音</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SCENES.map(s => (
                <div key={s.id} onClick={() => { setScene(s.id); setStep('photo') }}
                  className={`card cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-apple-md ${scene === s.id ? 'ring-2 ring-brand-400' : ''}`}>
                  <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-3">
                    <img src={s.refImage} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="h-4 w-4 text-brand-400" />
                    <h3 className="font-semibold text-sm text-gray-900">{s.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{s.desc}</p>
                  <p className="text-[10px] text-gray-400">{s.industry}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 第二步：上传照片/视频 ═══ */}
        {step === 'photo' && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStep('scene')} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
              <FiChevronLeft className="h-4 w-4" /> 重选场景
            </button>

            {/* 切换 tabs */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setVideoMode(false)}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                  !videoMode ? 'bg-brand-400 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                <FiCamera className="inline h-4 w-4 mr-1" /> 上传照片
              </button>
              <button onClick={() => setVideoMode(true)}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                  videoMode ? 'bg-brand-400 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                <FiVideo className="inline h-4 w-4 mr-1" /> 上传视频
              </button>
            </div>

            {/* 照片上传 */}
            {!videoMode && (
              <div className="card p-6 mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-1">上传你的照片</h2>
                <p className="text-sm text-gray-400 mb-4">一张正面照，AI 会帮你合成数字人形象。</p>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all">
                  {photoPreview ? (
                    <div className="relative mx-auto w-40 h-40">
                      <img src={photoPreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-md"><FiCheck className="h-4 w-4" /></div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-center mb-3">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center"><FiUpload className="h-6 w-6 text-gray-400" /></div>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">点击上传照片</p>
                      <p className="text-xs text-gray-400">建议用美图秀秀 / 豆包处理好再上传</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </div>
              </div>
            )}

            {/* 视频上传 */}
            {videoMode && (
              <div className="card p-6 mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-1">上传你的视频</h2>
                <p className="text-sm text-gray-400 mb-2">拍一段 10 秒左右的视频，AI 提取首帧作为数字人形象。</p>
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mb-4">
                  提示：对着镜头自然说话，背景干净、光线好。视频长度 5-15 秒最佳。
                </p>

                <div onClick={() => { const inp = document.createElement('input'); inp.type='file'; inp.accept='video/*'; inp.onchange=(e)=>{ const t=e.target as HTMLInputElement|null; if(t?.files?.[0]) handleVideo({target: {files: [t.files[0]]}} as any) }; inp.click() }}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all">
                  {videoPreview ? (
                    <div>
                      <video ref={videoRef} src={videoPreview} className="max-h-48 mx-auto rounded-xl mb-3" controls
                        onLoadedData={captureVideoFrame} onPlay={() => setTimeout(captureVideoFrame, 100)} />
                      <div className="flex items-center justify-center gap-2">
                        {photoPreview && (
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <FiCheck className="h-3 w-3" /> 已提取首帧
                            <img src={photoPreview} className="w-10 h-10 rounded object-cover" alt="" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-center mb-3">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center"><FiVideo className="h-6 w-6 text-gray-400" /></div>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">点击上传视频</p>
                      <p className="text-xs text-gray-400">支持 MP4/MOV，5-15 秒</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-brand-50 text-xs text-brand-700">
                  <strong>小技巧：</strong>这段视频同时可以用来克隆你的声音！到第四步选声音时上传即可。
                </div>
              </div>
            )}

            <button onClick={() => setStep('script')} disabled={!photo && !videoFile}
              className="btn-ai w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
              <FiArrowRight className="h-4 w-4" /> 下一步：写脚本
            </button>
          </div>
        )}

        {/* ═══ 第三步：写脚本 ═══ */}
        {step === 'script' && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStep('photo')} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
              <FiChevronLeft className="h-4 w-4" /> 返回上传
            </button>
            <div className="card p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">口播文案</h2>
                <button onClick={aiGenerateScript} disabled={aiGenerating}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all"
                  style={{ backgroundColor: '#8B5CF6' }}>
                  <FiZap className="h-3 w-3" /> {aiGenerating ? '生成中...' : 'AI 帮我写'}
                </button>
              </div>
              <textarea value={script} onChange={e => setScript(e.target.value)}
                placeholder="点击「AI 帮我写」自动生成，或直接粘贴..."
                rows={5}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 resize-none" />
              <p className="text-xs text-gray-400 mt-1">{script.length} 字，建议 80-150 字</p>
            </div>
            <button onClick={() => setStep('voice')} disabled={!script.trim()}
              className="btn-ai w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
              <FiArrowRight className="h-4 w-4" /> 下一步：选声音 / 克隆
            </button>
          </div>
        )}

        {/* ═══ 第四步：选声音 / 声音克隆 ═══ */}
        {step === 'voice' && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStep('script')} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
              <FiChevronLeft className="h-4 w-4" /> 返回写脚本
            </button>

            {/* 内置音色 */}
            <div className="card p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">内置配音音色</h2>
              <p className="text-sm text-gray-400 mb-4">直接选用，无需上传</p>
              {Object.keys(voices).length === 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700 mb-4">TTS 服务加载中...</div>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(voices).map(([id, label]) => (
                  <div key={id} className={`rounded-xl border-2 p-3 transition-all ${voice === id ? 'border-brand-400 bg-brand-50/30' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${voice === id ? 'bg-brand-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <FiUser className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                      </div>
                      <button onClick={() => setVoice(id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${voice === id ? 'bg-brand-400 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {voice === id ? '已选' : '选用'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 声音克隆 — 上传 10 秒语音 */}
            <div className="card p-6 mb-4 border-2 border-purple-300 bg-purple-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <FiMic className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">克隆你的声音</h3>
                  <p className="text-[11px] text-gray-500">上传 10 秒语音，AI 学习你的声线。支持音频或视频文件。</p>
                </div>
              </div>

              {/* 克隆列表 */}
              {clonedVoices.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">已克隆的声音：</p>
                  <div className="space-y-2">
                    {clonedVoices.map(c => (
                      <div key={c.id} className="flex items-center justify-between rounded-lg bg-white border border-purple-100 p-3">
                        <div className="flex items-center gap-2">
                          <FiMusic className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-700">{c.name}</span>
                        </div>
                        <button onClick={() => setVoice(c.id)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold ${voice === c.id ? 'bg-purple-600 text-white' : 'border border-purple-200 text-purple-600 hover:bg-purple-50'}`}>
                          {voice === c.id ? '已选' : '使用'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 上传新语音 */}
              <div className="rounded-xl border-2 border-dashed border-purple-200 p-4">
                <div onClick={() => cloneAudioRef.current?.click()}
                  className="text-center cursor-pointer">
                  {cloneAudioPreview ? (
                    <div>
                      <audio src={cloneAudioPreview} controls className="w-full h-10 mb-2" />
                      <p className="text-xs font-medium text-gray-600">{cloneAudio?.name}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-center mb-2">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                          <FiUpload className="h-5 w-5 text-purple-500" />
                        </div>
                      </div>
                      <p className="text-xs font-medium text-gray-700 mb-1">上传语音 / 视频文件</p>
                      <p className="text-[10px] text-gray-400">支持 MP3/WAV/MP4，10 秒以上效果最佳</p>
                    </div>
                  )}
                  <input ref={cloneAudioRef} type="file" accept="audio/*,video/*" onChange={handleCloneAudio} className="hidden" />
                </div>

                {cloneAudio && (
                  <div className="mt-3 space-y-2">
                    <input value={cloneName} onChange={e => setCloneName(e.target.value)}
                      placeholder="给这个声音取个名字..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                    <button onClick={submitVoiceClone} disabled={cloning || !cloneName.trim()}
                      className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                      style={{ backgroundColor: '#8B5CF6' }}>
                      {cloning ? cloneProgress || '克隆中...' : `克隆声音（仅需 10 秒语音）`}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button onClick={generate} disabled={!script.trim() || loading}
              className="btn-ai w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
              <FiZap className="h-4 w-4" /> {loading ? '提交中...' : '一键生成数字人 + 配音'}
            </button>
          </div>
        )}

        {/* ═══ 生成中 ═══ */}
        {step === 'generate' && loading && (
          <div className="max-w-2xl mx-auto py-8">
            <div className="card p-8 mb-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                {error ? <FiRefreshCw className="h-8 w-8 text-white" /> : <FiZap className="h-8 w-8 text-white animate-pulse" />}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{error ? '生成失败' : '后台渲染中'}</h2>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${error ? 'bg-red-400' : 'bg-gradient-to-r from-brand-400 to-purple-500'}`}
                  style={{ width: `${error ? 100 : progress}%` }} />
              </div>
              {!error && <p className="text-sm text-gray-500 mb-1">{statusMessage}</p>}
              <p className="text-xs text-gray-400">{Math.round(progress)}%{submittedAt > 0 && ` · 已 ${Math.floor((Date.now() - submittedAt) / 1000)} 秒`}</p>
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 text-sm text-red-700">
                  {error}
                  <div className="mt-3 flex gap-2 justify-center">
                    <button onClick={resetAll} className="text-xs text-red-600 underline">重新开始</button>
                    <button onClick={generate} className="text-xs text-brand-400 underline">重试</button>
                  </div>
                </div>
              )}
            </div>

            {!error && (
              <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FiExternalLink className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">后台持续渲染中</h3>
                    <p className="text-xs text-gray-500 mb-3">完成后系统会通知你，任何页面都能收到。</p>
                    <div className="flex gap-2 flex-wrap">
                      <Link href="/" className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">回首页</Link>
                      <Link href="/ai-video" className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">去一键短视频</Link>
                      <Link href="/global-supply" className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">去全球资源</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ 结果 ═══ */}
        {step === 'result' && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-black mb-6 aspect-[9/16] max-h-[500px]">
              {videoUrl ? (
                <video src={videoUrl} controls className="w-full h-full object-contain" autoPlay />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900"><FiCamera className="h-12 w-12 text-gray-600" /></div>
              )}
            </div>
            <div className="card p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900">视频信息</h3>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">生成完成</span>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between"><span>场景</span><span className="text-gray-700">{currentScene.title}</span></div>
                <div className="flex justify-between"><span>文案</span><span className="text-gray-700 line-clamp-1">{script?.slice(0, 60)}{script?.length > 60 ? '...' : ''}</span></div>
                <div className="flex justify-between"><span>配音</span><span className="text-gray-700">{voices[voice] || voice || '克隆声音'}</span></div>
              </div>
            </div>
            {audioUrl && (
              <div className="card p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50"><FiUser className="h-4 w-4 text-brand-400" /></div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-700">AI 配音</p>
                      <p className="text-[10px] text-gray-400">{voices[voice] || voice || '克隆声音'}</p>
                    </div>
                  </div>
                  <audio src={audioUrl} controls className="h-10 w-48" />
                </div>
              </div>
            )}
            <div className="mt-6 flex gap-3 flex-wrap justify-center">
              {videoUrl && (
                <a href={videoUrl} download="数字人视频.mp4"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500">
                  <FiDownload className="h-4 w-4" /> 下载视频
                </a>
              )}
              <button onClick={resetAll}
                className="inline-flex items-center gap-2 rounded-xl border-2 px-6 py-3 text-sm font-semibold transition-all"
                style={{ borderColor: '#FF6034', color: '#FF6034' }}>
                <FiRefreshCw className="h-4 w-4" /> 重新生成
              </button>
            </div>
          </div>
        )}

        {/* 底部 */}
        {step !== 'generate' && step !== 'result' && (
          <div className="mt-8 rounded-2xl bg-gradient-to-b from-brand-50 to-white border border-brand-100/50 p-6 text-center">
            <p className="text-sm font-semibold text-gray-900">借势，不是造轮子</p>
            <p className="text-xs text-gray-400 mt-1">
              照片用美图秀秀 / 豆包 | 视频由 Agnes AI 生成 | 配音由 NAS edge-tts 提供 | 声音克隆即将接入
            </p>
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/ai-video" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                <FiCamera className="h-3 w-3" /> 一键短视频
              </Link>
              <Link href="/cross-border" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                <FiGlobe className="h-3 w-3" /> 跨境AI工具
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
