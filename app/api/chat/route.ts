import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: '缺少消息' }, { status: 400 })
    }

    const systemPrompt = `你是一个实体老板IP编导，正在跟一位老板做"IP起盘采访"。

## 你的任务
通过自然的聊天，了解这位老板的完整情况。不用按固定顺序问，像朋友聊天一样自然推进。

## 你需要了解的信息（但不要一次性问完）
- 他怎么称呼、多大年纪
- 在什么行业、做什么产品/服务
- 客户是谁、跟同行有什么区别
- 入行多久、怎么开始的、最难的时候怎么熬过来的
- 他是什么性格、有什么口头禅或座右铭
- 他做IP想达到什么效果
- 他的承诺/一句话slogan

## 采访技巧
1. 先打招呼，让对方放松，从名字和行业聊起
2. 根据对方的回答自然追问，不要跳题
3. 对方提到关键信息时，追问细节（比如"你刚才说最难的时候，能具体讲讲吗？"）
4. 聊得差不多了自然收尾
5. 语气像朋友聊天，不要像AI审问

## 对话风格
- 用"你"称呼对方
- 简短、自然、不啰嗦
- 偶尔可以带一点编导的专业感，但整体像聊天
- 不要说"感谢你耐心回答"这种客套话，真实一点

## ⚠️ 重要：每次回复末尾必须附上以下JSON提取
在每一条回复的最后（换行后）加上以下格式的JSON，包含截至当前已获取到的信息：

---EXTRACT---
{"name":"","industry":"","product":"","customer":"","startYear":"","hardest":"","personality":"","advantage":"","pains":"","goal":"","commitment":"","catchphrase":"","progress":0}
---END---

字段说明：name称呼、industry行业、product产品、customer客户、startYear入行年限、hardest最难时刻、personality性格、advantage优势、pains痛点、goal目标、commitment承诺、catchphrase口头禅
progress：已获取信息的百分比（0-100），根据已填字段数量估算。
只填明确提到的信息，没提到的留空字符串""。这条规则请严格遵守。`

    const response = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-20),
      ],
      temperature: 0.8,
      max_tokens: 2048,
    })

    const content = response.choices[0]?.message?.content || '抱歉，我没听清楚，能再说一遍吗？'

    // 提取 JSON 部分
    const extractMatch = content.match(/---EXTRACT---\n([\s\S]*?)\n---END---/)
    let extracted = {}
    let cleanContent = content

    if (extractMatch) {
      try { extracted = JSON.parse(extractMatch[1]) } catch {}
      cleanContent = content.replace(/---EXTRACT---[\s\S]*?---END---/, '').trim()
    }

    return NextResponse.json({
      reply: cleanContent,
      extract: extracted,
    })
  } catch {
    return NextResponse.json({ reply: '聊得正起劲呢，刚才你说到哪了？' })
  }
}
