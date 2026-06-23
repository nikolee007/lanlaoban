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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '查询失败'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
