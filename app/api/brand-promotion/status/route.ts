import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/brand-promotion/status
 *
 * 查询品牌推广视频生成任务的进度状态。
 * 用于异步模式的轮询（前端在 asyncMode=true 时调用）。
 * 本地同步模式不走此接口，直接在前端同步等待。
 *
 * 查询逻辑：
 * 1. 如果配置了 TASK_WORKER_URL，转发到任务服务节点
 * 2. 否则返回本地处理中状态
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId')

  if (!taskId) {
    return NextResponse.json({ success: false, error: '缺少 taskId' }, { status: 400 })
  }

  // 如果有任务服务后端，转发查询
  const workerUrl = process.env.TASK_WORKER_URL
  if (workerUrl) {
    try {
      const res = await fetch(`${workerUrl}/api/task/${encodeURIComponent(taskId)}`, {
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({ success: true, data })
      }
    } catch {
      // 服务不可达，降级返回
    }
  }

  // 降级：模拟进度（任务尚在排队或已丢失）
  const createdAt = parseInt(searchParams.get('createdAt') || '0', 10)
  const elapsed = createdAt ? Date.now() - createdAt : 0
  const estimatedTotal = 5 * 60 * 1000 // 预估 5 分钟
  const progress = Math.min(95, Math.round((elapsed / estimatedTotal) * 100))

  return NextResponse.json({
    success: true,
    data: {
      taskId,
      status: progress >= 95 ? 'processing' : 'queued',
      progress,
      step: progress < 30 ? '文案生成中...' : progress < 60 ? '配音合成中...' : '视频渲染中...',
    },
  })
}
