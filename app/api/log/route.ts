import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const LOG_FILE = path.join(DATA_DIR, 'logs.jsonl')

interface LogEntry {
  level: 'error' | 'warn' | 'info'
  message: string
  stack?: string
  url?: string
  timestamp: string
}

const VALID_LEVELS = ['error', 'warn', 'info']

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: LogEntry = await request.json()
    const { level, message, stack, url, timestamp } = body

    if (!level || !VALID_LEVELS.includes(level)) {
      // silent fail on invalid input
      return NextResponse.json({ success: true })
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: true })
    }

    const entry = {
      level,
      message: message.slice(0, 2000),
      stack: stack ? stack.slice(0, 5000) : '',
      url: url || '',
      timestamp: timestamp || new Date().toISOString(),
      serverTimestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || '',
    }

    ensureDataDir()
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8')

    // Silent success — never reveal failure to the client
    return NextResponse.json({ success: true })
  } catch {
    // Silent fail: never expose errors from logging
    return NextResponse.json({ success: true })
  }
}
