import { NextRequest, NextResponse } from 'next/server'

// 全局内存缓存（Vercel 无写权限时的降级方案）
const globalForFeedback = globalThis as unknown as {
  feedbackStore: FeedbackEntry[]
}

type FeedbackEntry = {
  id: string
  type: string
  content: string
  contact: string
  timestamp: string
  userAgent: string
}

if (!globalForFeedback.feedbackStore) {
  globalForFeedback.feedbackStore = []
}

function tryWriteToFile(entry: FeedbackEntry): boolean {
  try {
    const fs = require('fs') as typeof import('fs')
    const path = require('path') as typeof import('path')
    const DATA_DIR = path.join(process.cwd(), 'data')
    const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.jsonl')
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.appendFileSync(FEEDBACK_FILE, JSON.stringify(entry) + '\n', 'utf-8')
    return true
  } catch {
    // 文件系统不可写（Vercel 环境），静默降级到内存
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, content, contact } = body

    if (!type || !content) {
      return NextResponse.json(
        { error: '请填写反馈类型和内容' },
        { status: 400 }
      )
    }

    const validTypes = ['建议', 'Bug', '咨询']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '反馈类型无效，仅支持: 建议、Bug、咨询' },
        { status: 400 }
      )
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: '反馈内容不能为空' },
        { status: 400 }
      )
    }

    const entry: FeedbackEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      type,
      content: content.trim(),
      contact: contact?.trim() || '',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || '',
    }

    // 优先写文件，失败则存内存
    if (!tryWriteToFile(entry)) {
      globalForFeedback.feedbackStore.push(entry)
    }

    return NextResponse.json({ success: true, id: entry.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '提交反馈失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    let allFeedbacks: FeedbackEntry[] = []

    // 尝试从文件读取
    try {
      const fs = require('fs') as typeof import('fs')
      const path = require('path') as typeof import('path')
      const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'feedback.jsonl')
      if (fs.existsSync(FEEDBACK_FILE)) {
        const content = fs.readFileSync(FEEDBACK_FILE, 'utf-8')
        const lines = content.trim().split('\n').filter(Boolean)
        allFeedbacks = lines.map((line: string) => JSON.parse(line))
      }
    } catch {
      // 文件不可读，用内存数据
    }

    // 合并内存数据（去重）
    const fileIds = new Set(allFeedbacks.map(f => f.id))
    for (const f of globalForFeedback.feedbackStore) {
      if (!fileIds.has(f.id)) {
        allFeedbacks.push(f)
      }
    }

    if (type) {
      allFeedbacks = allFeedbacks.filter(f => f.type === type)
    }

    allFeedbacks.reverse()
    allFeedbacks = allFeedbacks.slice(0, limit)

    return NextResponse.json({ feedbacks: allFeedbacks })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取反馈失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
