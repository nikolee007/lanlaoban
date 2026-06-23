'use client'
import { useEffect, useRef } from 'react'
import { useToast } from '@/app/contexts/ToastContext'

export interface RenderTask {
  taskId: string
  scene: string
  script: string
  voice: string
  status: 'queued' | 'rendering' | 'completed' | 'failed'
  progress: number
  videoUrl?: string
  audioUrl?: string
  error?: string
  createdAt: number
  notified?: boolean
}

const STORAGE_KEY = 'lanlaoban_render_tasks'
const MAX_TASKS = 10

export function getRenderTasks(): RenderTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function addRenderTask(task: Omit<RenderTask, 'status' | 'progress' | 'createdAt' | 'notified'>) {
  const tasks = getRenderTasks()
  tasks.unshift({ ...task, status: 'queued', progress: 0, createdAt: Date.now(), notified: false })
  // Keep max 10
  if (tasks.length > MAX_TASKS) tasks.length = MAX_TASKS
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function updateRenderTask(taskId: string, updates: Partial<RenderTask>) {
  const tasks = getRenderTasks()
  const idx = tasks.findIndex(t => t.taskId === taskId)
  if (idx >= 0) {
    tasks[idx] = { ...tasks[idx], ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }
}

export function getRenderTask(taskId: string): RenderTask | undefined {
  return getRenderTasks().find(t => t.taskId === taskId)
}

export function clearRenderTasks() {
  localStorage.removeItem(STORAGE_KEY)
}

export default function BackgroundTaskMonitor() {
  const { showToast } = useToast()
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    const poll = setInterval(async () => {
      const tasks = getRenderTasks()
      const pending = tasks.filter(t => t.status === 'queued' || t.status === 'rendering')

      if (pending.length === 0) return

      for (const task of pending) {
        try {
          const res = await fetch(`/api/digital-human/status?taskId=${task.taskId}`)
          const data = await res.json()

          if (data.success) {
            const s = data.data
            const pct = s.progress || 0

            if (s.status === 'completed' || s.status === 'done' || s.status === 'succeeded') {
              // Try to get TTS audio too
              let audioUrl = task.audioUrl || ''
              try {
                const script = task.script
                if (script) {
                  const ttsRes = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: script, voice: task.voice || 'zh-CN-XiaoxiaoNeural', speed: 1.0 }),
                  })
                  const ttsData = await ttsRes.json()
                  if (ttsData.success && ttsData.data?.audio) {
                    const binary = atob(ttsData.data.audio)
                    const bytes = new Uint8Array(binary.length)
                    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
                    audioUrl = URL.createObjectURL(new Blob([bytes], { type: 'audio/mp3' }))
                  }
                }
              } catch {}

              updateRenderTask(task.taskId, {
                status: 'completed',
                progress: 100,
                videoUrl: s.output?.url || '',
                audioUrl,
                notified: true,
              })

              if (!task.notified) {
                showToast(`数字人视频生成完成！点击查看`, 'success')
              }
            } else if (s.status === 'failed' || s.error) {
              updateRenderTask(task.taskId, {
                status: 'failed',
                error: s.error || '生成失败',
                notified: true,
              })
              if (!task.notified) {
                showToast(`数字人生成失败：${s.error || '请重试'}`, 'error')
              }
            } else {
              updateRenderTask(task.taskId, {
                status: 'rendering',
                progress: Math.min(90, pct),
              })
            }
          }
        } catch {}
      }
    }, 5000)

    pollRef.current = poll
    return () => clearInterval(poll)
  }, [showToast])

  return null // 不渲染任何 UI
}
