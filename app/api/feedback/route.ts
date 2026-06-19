import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.jsonl')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
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

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      type,
      content: content.trim(),
      contact: contact?.trim() || '',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || '',
    }

    ensureDataDir()
    fs.appendFileSync(FEEDBACK_FILE, JSON.stringify(entry) + '\n', 'utf-8')

    return NextResponse.json({ success: true, id: entry.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '提交反馈失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    ensureDataDir()

    if (!fs.existsSync(FEEDBACK_FILE)) {
      return NextResponse.json({ feedbacks: [] })
    }

    const content = fs.readFileSync(FEEDBACK_FILE, 'utf-8')
    const lines = content.trim().split('\n').filter(Boolean)
    const feedbacks = lines.map(line => JSON.parse(line))

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    let result = feedbacks
    if (type) {
      result = result.filter(f => f.type === type)
    }

    result.reverse()
    result = result.slice(0, limit)

    return NextResponse.json({ feedbacks: result })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取反馈失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
