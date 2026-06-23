'use client'
import { useState, useRef, useEffect } from 'react'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '@/app/contexts/ToastContext'
import { addRenderTask, getRenderTasks, getRenderTask, clearRenderTasks } from '@/app/components/BackgroundTaskMonitor'
import type { Step, SceneId, VoiceClone } from './components/types'
import { SCENES, getVoiceClones, saveVoiceClone, getStage } from './components/types'
import SceneSelector from './components/SceneSelector'
import PhotoUpload from './components/PhotoUpload'
import ScriptPanel from './components/ScriptPanel'
import VoicePanel from './components/VoicePanel'
import ProgressPanel from './components/ProgressPanel'
import ResultPanel from './components/ResultPanel'
import TaskHistory from './components/TaskHistory'
import StepNavigation from './components/StepNavigation'
import BottomBanner from './components/BottomBanner'

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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '网络错误'
      showToast('克隆失败：' + msg, 'error')
    }
    setCloning(false)
    setCloneProgress('')
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '网络错误'
      setError(msg)
      setLoading(false)
    }
  }

  const resetAll = () => {
    setStep('scene'); setPhoto(null); setPhotoPreview(''); setVideoFile(null); setVideoPreview('')
    setScript(''); setVoice('zh-CN-XiaoxiaoNeural'); setAudioUrl(''); setVideoUrl('')
    setImageUrl(''); setProgress(0); setError(''); setStatusMessage(''); setSubmittedAt(0)
  }

  const navigateToResult = (tid: string) => { window.location.href = `/digital-human?task=${tid}` }

  const renderTasks = getRenderTasks()
  const recentTasks = renderTasks.slice(0, 5)

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
        <Breadcrumb items={[{ label: '懒老板', href: '/' }, { label: 'AI 数字人口播' }]} />
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-12">

        {/* 步骤导航 */}
        {step !== 'result' && (
          <StepNavigation
            step={step}
            loading={loading}
            onSetStep={setStep}
            recentTasks={recentTasks}
            history={history}
            onToggleHistory={() => setHistory(!history)}
          />
        )}

        {/* 任务历史 */}
        {history && (
          <TaskHistory
            tasks={recentTasks}
            onViewTask={navigateToResult}
            onClear={clearRenderTasks}
            onClose={() => setHistory(false)}
          />
        )}

        {/* 第一步：选场景 */}
        {step === 'scene' && (
          <SceneSelector
            scenes={SCENES}
            selectedScene={scene}
            recentCompletedCount={recentTasks.filter(t => t.status === 'completed').length}
            onSelectScene={(id) => { setScene(id); setStep('photo') }}
            onViewHistory={() => setHistory(true)}
          />
        )}

        {/* 第二步：上传照片/视频 */}
        {step === 'photo' && (
          <PhotoUpload
            videoMode={videoMode}
            photoPreview={photoPreview}
            videoPreview={videoPreview}
            photo={photo}
            videoFile={videoFile}
            fileRef={fileRef}
            videoRef={videoRef}
            onSetVideoMode={setVideoMode}
            onPhotoChange={handlePhoto}
            onVideoChange={handleVideo}
            onCaptureFrame={captureVideoFrame}
            onBack={() => setStep('scene')}
            onNext={() => setStep('script')}
            canNext={!!(photo || videoFile)}
          />
        )}

        {/* 第三步：写脚本 */}
        {step === 'script' && (
          <ScriptPanel
            script={script}
            aiGenerating={aiGenerating}
            onScriptChange={setScript}
            onAiGenerate={aiGenerateScript}
            onBack={() => setStep('photo')}
            onNext={() => setStep('voice')}
            canNext={!!script.trim()}
          />
        )}

        {/* 第四步：选声音 / 声音克隆 */}
        {step === 'voice' && (
          <VoicePanel
            voices={voices}
            voice={voice}
            clonedVoices={clonedVoices}
            cloneName={cloneName}
            cloneAudio={cloneAudio}
            cloneAudioPreview={cloneAudioPreview}
            cloning={cloning}
            cloneProgress={cloneProgress}
            cloneAudioRef={cloneAudioRef}
            onVoiceChange={setVoice}
            onCloneNameChange={setCloneName}
            onCloneAudioChange={handleCloneAudio}
            onSubmitClone={submitVoiceClone}
            onUseClonedVoice={(id) => setVoice(id)}
            onBack={() => setStep('script')}
            onGenerate={generate}
            canGenerate={!!script.trim()}
            loading={loading}
          />
        )}

        {/* 第五步：生成中 */}
        {step === 'generate' && loading && (
          <ProgressPanel
            progress={progress}
            statusMessage={statusMessage}
            error={error}
            submittedAt={submittedAt}
            onRetry={generate}
            onReset={resetAll}
          />
        )}

        {/* 结果 */}
        {step === 'result' && (
          <ResultPanel
            videoUrl={videoUrl}
            audioUrl={audioUrl}
            script={script}
            voice={voice}
            voices={voices}
            scene={currentScene}
            onReset={resetAll}
          />
        )}

        {/* 底部 */}
        {step !== 'generate' && step !== 'result' && <BottomBanner />}
      </div>
    </div>
  )
}
