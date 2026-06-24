import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime'

const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || '713341f1eeae4b67ad99e320566968a7.86r3Xq5jU6I44NJh'

const openai = new OpenAI({
  apiKey: ZHIPU_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
})

const runtime = new CopilotRuntime()
const serviceAdapter = new OpenAIAdapter({ openai, model: 'glm-5.2' })

export async function POST(req: NextRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  })

  return handleRequest(req)
}
