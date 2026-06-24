const AGNES_BASE = process.env.AGNES_API_BASE || 'https://apihub.agnes-ai.com/v1'
const AGNES_KEY = process.env.AGNES_API_KEY || ''

export interface AgnesImageResult {
  url: string
}

export interface AgnesVideoResult {
  taskId: string
  videoId: string
  status: string
}

export interface AgnesTaskStatus {
  status: string
  progress: number
  output?: { url: string }
  error?: string
}

interface AgnesRequestBody {
  model?: string
  prompt?: string
  n?: number
  size?: string
  duration?: number
  image_url?: string
  [key: string]: unknown
}

async function agnesFetch(endpoint: string, body?: AgnesRequestBody, method = 'POST') {
  const res = await fetch(`${AGNES_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${AGNES_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
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
  const body: AgnesRequestBody = {
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
  const data = await agnesFetch(`/video/generations/${taskId}`, undefined, 'GET')
  return {
    status: data.status || 'unknown',
    progress: data.progress || 0,
    output: data.output || data.video_url ? { url: (data.output?.url || data.video_url) } : undefined,
    error: data.error || data.message,
  }
}
