import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime'
import { getAuthUserId } from '@/lib/auth'

// 优先用 DeepSeek，降级到 Agnes
const DEEPSEEK_KEY = process.env.OPENAI_API_KEY
const AGNES_KEY = process.env.AGNES_API_KEY

const openai = new OpenAI(
  DEEPSEEK_KEY
    ? { apiKey: DEEPSEEK_KEY, baseURL: 'https://api.deepseek.com' }
    : AGNES_KEY
      ? { apiKey: AGNES_KEY, baseURL: 'https://apihub.agnes-ai.com/v1' }
      : { apiKey: '', baseURL: 'https://open.bigmodel.cn/api/paas/v4' },
)

const model = DEEPSEEK_KEY ? 'deepseek-chat' : AGNES_KEY ? 'agnes-2.0-flash' : 'glm-5.2'

const runtime = new CopilotRuntime()
const serviceAdapter = new OpenAIAdapter({ openai, model })

export async function POST(req: NextRequest) {
  const userId = getAuthUserId(req.headers)
  if (!userId) {
    return new Response(JSON.stringify({ error: '请先登录后再使用AI助手', needsAuth: true }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  })

  return handleRequest(req)
}
