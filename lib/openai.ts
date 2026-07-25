import OpenAI from 'openai'

let _defaultClient: OpenAI | null = null
let _kimiClient: OpenAI | null = null
let _deepseekClient: OpenAI | null = null
let _zhipuClient: OpenAI | null = null
let _agnesClient: OpenAI | null = null

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

/** 安全获取 key，不存在不抛错 */
function tryGetKey(envVar: string): string | null {
  try {
    return getApiKey(envVar)
  } catch {
    return null
  }
}

/** 获取各 AI 客户端（自动降级链：Kimi K3 → DeepSeek → Agnes → Zhipu） */
export function getClient(): OpenAI {
  if (!_defaultClient) {
    // 1. 首选 Kimi K3
    const kk = tryGetKey('KIMI_API_KEY')
    if (kk) {
      _defaultClient = new OpenAI({
        apiKey: kk,
        baseURL: 'https://api.moonshot.cn/v1',
      })
      return _defaultClient
    }

    // 2. 降级到 DeepSeek
    const dk = tryGetKey('OPENAI_API_KEY')
    if (dk) {
      _defaultClient = new OpenAI({
        apiKey: dk,
        baseURL: 'https://api.deepseek.com',
      })
      return _defaultClient
    }

    // 3. 降级到 Agnes API
    const ak = tryGetKey('AGNES_API_KEY')
    if (ak) {
      _defaultClient = new OpenAI({
        apiKey: ak,
        baseURL: 'https://apihub.agnes-ai.com/v1',
      })
      return _defaultClient
    }

    // 4. 最后降级到 Zhipu
    const zk = tryGetKey('ZHIPU_API_KEY')
    if (zk) {
      _defaultClient = new OpenAI({
        apiKey: zk,
        baseURL: 'https://open.bigmodel.cn/api/paas/v4',
      })
      return _defaultClient
    }

    throw new Error('无可用的 AI 服务配置，请先设置 KIMI_API_KEY、OPENAI_API_KEY 或 AGNES_API_KEY')
  }
  return _defaultClient
}

/** Kimi K3 客户端 */
export function getKimiClient(): OpenAI {
  if (!_kimiClient) {
    _kimiClient = new OpenAI({
      apiKey: getApiKey('KIMI_API_KEY'),
      baseURL: 'https://api.moonshot.cn/v1',
    })
  }
  return _kimiClient
}

/** DeepSeek 专用客户端 */
export function getDeepSeekClient(): OpenAI {
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
    const apiKey = process.env.ZHIPU_API_KEY || '713341f1eeae4b67ad99e320566968a7.86r3Xq5jU6I44NJh'
    _zhipuClient = new OpenAI({
      apiKey,
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    })
  }
  return _zhipuClient
}

/** Agnes API 客户端 */
export function getAgnesClient(): OpenAI {
  if (!_agnesClient) {
    _agnesClient = new OpenAI({
      apiKey: getApiKey('AGNES_API_KEY'),
      baseURL: 'https://apihub.agnes-ai.com/v1',
    })
  }
  return _agnesClient
}

export type AiEngine = 'kimi' | 'deepseek' | 'zhipu' | 'agnes'

/** 获取指定引擎的客户端 */
export function getEngineClient(engine: AiEngine = 'deepseek'): OpenAI {
  switch (engine) {
    case 'kimi':
      return getKimiClient()
    case 'zhipu':
      return getZhipuClient()
    case 'agnes':
      return getAgnesClient()
    default:
      return getDeepSeekClient()
  }
}

/** 自动获取最佳可用模型名 */
export function getDefaultModel(): string {
  // Kimi K3 → deepseek-chat → agnes-2.0-flash → glm-5.2
  if (tryGetKey('KIMI_API_KEY')) return 'kimi-k3'
  if (tryGetKey('OPENAI_API_KEY')) return 'deepseek-chat'
  if (tryGetKey('AGNES_API_KEY')) return 'agnes-2.0-flash'
  return 'glm-5.2'
}

/** 使用自动降级链生成内容（Kimi K3 → DeepSeek → Agnes → Zhipu） */
export async function generateContent(
  prompt: string,
  systemPrompt?: string,
  _engine?: AiEngine,
): Promise<string> {
  const client = getClient()
  const model = getDefaultModel()

  const response = await client.chat.completions.create({
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
    max_tokens: _engine === 'zhipu' ? 65536 : undefined,
  } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming)
  return response.choices[0]?.message?.content || ''
}

/** 从 AI 响应中提取 JSON（去掉可能包裹的 markdown 代码块） */
export function extractJsonFromResponse(content: string): string {
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) return jsonMatch[1].trim()
  return content.trim()
}
