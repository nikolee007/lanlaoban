import { getClient, getDefaultModel } from '@/lib/openai'
import type OpenAI from 'openai'

export async function aiChat(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<string> {
  try {
    const client = getClient()
    const completion = await client.chat.completions.create({
      model: getDefaultModel(),
      messages: [
        { role: 'system', content: '你是一个跨境电商选品助手。回答简洁实用，推荐具体产品。' },
        ...messages,
      ],
    })
    return completion.choices?.[0]?.message?.content || '抱歉，暂时无法回答'
  } catch {
    return '抱歉，暂时无法回答'
  }
}
