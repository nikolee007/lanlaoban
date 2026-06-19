import OpenAI from 'openai'

let _client: OpenAI | null = null

const PLACEHOLDER_KEYS = [
  'sk-your-key-here',
  'sk-dev-placeholder-12345',
  'sk-placeholder-change-me',
]

function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || PLACEHOLDER_KEYS.includes(apiKey)) {
    throw new Error(
      '请在 .env.local 中配置有效的 OPENAI_API_KEY'
    )
  }
  return apiKey
}

export function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: getApiKey(),
      baseURL: 'https://api.deepseek.com',
    })
  }
  return _client
}

export async function generateContent(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: 'deepseek-chat',
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
  })
  return response.choices[0]?.message?.content || ''
}
