import OpenAI from 'openai'

let _deepseekClient: OpenAI | null = null
let _zhipuClient: OpenAI | null = null

const PLACEHOLDER_KEYS = [
  'sk-your-key-here',
  'sk-dev-placeholder-12345',
  'sk-placeholder-change-me',
]

function getApiKey(envVar: string): string {
  const apiKey = process.env[envVar]
  if (!apiKey || PLACEHOLDER_KEYS.includes(apiKey)) {
    throw new Error(`${envVar} 未配置`)
  }
  return apiKey
}

/** DeepSeek 客户端（默认） */
export function getClient(): OpenAI {
  if (!_deepseekClient) {
    _deepseekClient = new OpenAI({
      apiKey: getApiKey('OPENAI_API_KEY'),
      baseURL: 'https://api.deepseek.com',
    })
  }
  return _deepseekClient
}

/** 智谱 GLM-5.2 客户端 */
export function getZhipuClient(): OpenAI {
  if (!_zhipuClient) {
    _zhipuClient = new OpenAI({
      apiKey: getApiKey('ZHIPU_API_KEY'),
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    })
  }
  return _zhipuClient
}

export type AiEngine = 'deepseek' | 'zhipu'

/** 获取指定引擎的客户端 */
export function getEngineClient(engine: AiEngine = 'deepseek'): OpenAI {
  return engine === 'zhipu' ? getZhipuClient() : getClient()
}

/** 使用指定引擎生成内容 */
export async function generateContent(
  prompt: string,
  systemPrompt?: string,
  engine: AiEngine = 'deepseek',
): Promise<string> {
  const client = getEngineClient(engine)
  const model = engine === 'zhipu' ? 'glm-5.2' : 'deepseek-chat'

  const body: any = {
    model,
    messages: [
      {
        role: 'system',
        content:
          systemPrompt ||
          '你是一个专业的实体老板IP策划师，擅长为实体老板打造个人IP内容。',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  }

  // 智谱支持深度思考
  if (engine === 'zhipu') {
    body.thinking = { type: 'enabled' }
    body.max_tokens = 65536
  }

  const response = await client.chat.completions.create(body)
  return response.choices[0]?.message?.content || ''
}
