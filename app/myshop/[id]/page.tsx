import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'

interface ShopData {
  id: string; brand: string; industry: string; slogan: string
  story: string; sellPoints: string
  products: Array<{ id: number; name: string; price: string; image: string; description: string; supplier: string; rating: number }>
  createdAt: string
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const shopId = params?.id as string
  let title = '懒老板AI独立站'
  let description = '懒老板AI自动生成的品牌独立站'

  if (shopId && shopId !== 'test') {
    try {
      const storePath = join(process.cwd(), 'data/shops.json')
      if (existsSync(storePath)) {
        const shops = JSON.parse(readFileSync(storePath, 'utf-8'))
        const shop = shops[shopId]
        if (shop) {
          title = `${shop.brand} - 懒老板AI独立站`
          description = shop.story || description
        }
      }
    } catch {}
  }

  return { title, description }
}

export default async function ShopPage({ params }: { params: { id: string } }) {
  const shopId = params?.id as string
  let shop: ShopData | null = null
  let error = ''

  if (shopId && shopId !== 'test') {
    try {
      const storePath = join(process.cwd(), 'data/shops.json')
      if (existsSync(storePath)) {
        const shops = JSON.parse(readFileSync(storePath, 'utf-8'))
        shop = shops[shopId] || null
      }
    } catch { error = '加载失败' }
  }

  if (!shop) {
    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '15px' }}>没有找到店铺数据，请先在AI聊天中生成</p>
          <a href="/global-supply/ai-assistant" style={{ color: '#FF6034', fontWeight: 600, fontSize: '14px' }}>去AI选品助手生成 →</a>
        </div>
      </div>
    )
  }

  const sellPointsList = shop.sellPoints.split(',').map(s => s.trim())

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f9fafb', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #e5e7eb', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{ background: '#FF6034', color: 'white', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 700, fontSize: '14px' }}>懒</span>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#111827' }}>懒老板</span>
          </a>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="/global-supply/ai-assistant" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none' }}>AI IP素材库</a>
            <a href="/digital-human" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none' }}>数字人口播</a>
            <a href="/cross-border" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none' }}>跨境AI工具</a>
            <a href="/global-supply" style={{ fontSize: '14px', color: '#FF6034', fontWeight: 600, textDecoration: 'none' }}>全球资源</a>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '24px' }}>
          <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>懒老板</a>
          <span style={{ margin: '0 4px' }}>&gt;</span>
          <a href="/global-supply/ai-assistant" style={{ color: '#9ca3af', textDecoration: 'none' }}>AI IP素材库</a>
          <span style={{ margin: '0 4px' }}>&gt;</span>
          <span>{shop.brand}</span>
        </div>

        {/* Hero */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', background: 'linear-gradient(135deg, #FF6034, #FF8A65, #FFB300)' }}>
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'white' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: 500, marginBottom: '20px' }}>
               AI 自动生成 · {shop.industry}
            </div>
            <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, margin: '0 0 8px' }}>{shop.brand}</h1>
            <p style={{ fontSize: 'clamp(14px,2vw,18px)', opacity: 0.9, maxWidth: '400px', margin: '0 auto' }}>{shop.slogan}</p>
          </div>
        </div>

        {/* Story */}
        <div style={{ borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', padding: '20px 24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 2px', color: '#111827' }}>品牌故事</h2>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 14px' }}>由懒老板AI根据聊天记录自动生成</p>
          <p style={{ color: '#374151', lineHeight: 1.7, fontSize: '14px', margin: 0 }}>{shop.story}</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '14px' }}>
            {sellPointsList.map((sp, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFF0ED', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#FF6034' }}> {sp}</span>
            ))}
          </div>
        </div>

        {/* Products */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>精选商品</h2>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: '2px 0 0' }}>懒老板全球供应链推荐</p>
            </div>
            <a href="/global-supply" style={{ fontSize: '13px', fontWeight: 600, color: '#FF6034', textDecoration: 'none' }}>更多货源 →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {shop.products.map(p => (
              <div key={p.id} style={{ borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '4/3', background: '#f3f4f6' }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <p style={{ fontWeight: 600, fontSize: '13px', margin: 0, color: '#111827' }}>{p.name}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>{p.supplier}</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, margin: '6px 0 0', color: '#FF6034' }}>{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ borderRadius: '12px', padding: '32px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #FFF5F0, #FFE4D6)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}> 你的独立站已就绪</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px' }}>分享给客户，或让懒老板AI继续帮你做内容</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/global-supply/ai-assistant" style={{ display: 'inline-block', padding: '10px 20px', background: '#FF6034', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>让AI帮我做内容</a>
            <a href="/global-supply" style={{ display: 'inline-block', padding: '10px 20px', border: '2px solid #d1d5db', borderRadius: '8px', fontSize: '13px', color: '#6b7280', textDecoration: 'none', background: 'white' }}>换一批货源</a>
          </div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>商品信息由懒老板AI根据聊天记录自动匹配，如需调整请联系客服</p>
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '24px', paddingBottom: '24px' }}>
          由 <span style={{ fontWeight: 600, color: '#FF6034' }}>懒老板AI</span> 自动生成
        </div>
      </div>
    </div>
  )
}
