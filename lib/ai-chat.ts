export async function aiChat(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch('https://apihub.agnes-ai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer sk-wpsLt5JiISV9fjtN5h3bALz3oj0AtqbyAy0fcgpBhUN6UHCw',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'agnes-1.5-flash',
      messages: [
        { role: 'system', content: '你是一个跨境电商选品助手。回答简洁实用，推荐具体产品。' },
        ...messages,
      ],
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || '抱歉，暂时无法回答'
}
