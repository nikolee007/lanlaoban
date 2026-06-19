import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scripts, industry, startDate } = body

    if (!scripts || !Array.isArray(scripts) || scripts.length === 0) {
      return NextResponse.json(
        { error: '缺少必填字段：scripts（脚本列表，非空数组）' },
        { status: 400 }
      )
    }

    const isFactory =
      industry?.includes('工厂') ||
      industry?.includes('制造') ||
      industry?.includes('生产') ||
      industry?.includes('加工')
    const isStore =
      industry?.includes('门店') ||
      industry?.includes('餐饮') ||
      industry?.includes('零售') ||
      industry?.includes('服务') ||
      industry?.includes('店') ||
      industry?.includes('美容') ||
      industry?.includes('健身')

    // Distribute best times: alternate between time slots for variety
    const scriptCount = scripts.length
    const schedule = []
    const start = startDate ? new Date(startDate) : new Date()

    for (let i = 0; i < 30; i++) {
      const scriptIndex = i % scriptCount
      const script = scripts[scriptIndex]
      const date = new Date(start)
      date.setDate(date.getDate() + i)

      let bestTime: string
      if (isFactory) {
        bestTime = i % 2 === 0 ? '7:00-9:00' : '20:00-22:00'
      } else if (isStore) {
        bestTime = i % 2 === 0 ? '12:00-13:00' : '18:00-21:00'
      } else {
        bestTime = '19:00-21:00'
      }

      schedule.push({
        day: i + 1,
        date: date.toISOString().split('T')[0],
        scriptId: script.id || `script-${scriptIndex + 1}`,
        scriptTitle: script.title || '',
        bestTime,
      })
    }

    return NextResponse.json({ schedule })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : '生成排期表失败'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
