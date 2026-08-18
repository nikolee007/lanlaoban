// Demo 示例数据：3 个老板示例 + 产品广告，每个 3 条
// 文案 textUrl 为 ASR 转写的真实口播文字（public/demo/<group>/<key>.txt）

export interface DemoVideo {
  key: string
  title: string
  video: string
  poster: string
  frames: string[]
  textUrl: string
}

export interface DemoGroup {
  id: string
  label: string
  desc: string
  background: string  // ① AI 了解的老板背景（画像）
  videos: DemoVideo[]
}

const frames = (group: string, key: string) => [
  `/demo/${group}/${key}-f0.jpg`,
  `/demo/${group}/${key}-f1.jpg`,
  `/demo/${group}/${key}-f2.jpg`,
  `/demo/${group}/${key}-f3.jpg`,
]

export const DEMO_GROUPS: DemoGroup[] = [
  {
    id: 'clothing',
    label: '服装老板',
    desc: '老板口播 · 穿搭讲解',
    background: '服装主理人，开店专注女装穿搭，主打版型与舒适，目标顾客是通勤女性，强调亲自选款、品质说话。',
    videos: [
      { key: '服装主理人', title: '珍珠衫讲解', video: '/videos/digital-服装主理人.mp4', poster: '/videos/posters/digital-服装主理人.jpg', frames: frames('clothing', '服装主理人'), textUrl: '/demo/clothing/服装主理人.txt' },
      { key: '服装主理人-2', title: '穿搭推荐', video: '/videos/digital-服装主理人-2.mp4', poster: '/videos/posters/digital-服装主理人-2.jpg', frames: frames('clothing', '服装主理人-2'), textUrl: '/demo/clothing/服装主理人-2.txt' },
      { key: '服装主理人-3', title: '创始人故事', video: '/videos/digital-服装主理人-3.mp4', poster: '/videos/posters/digital-服装主理人-3.jpg', frames: frames('clothing', '服装主理人-3'), textUrl: '/demo/clothing/服装主理人-3.txt' },
    ],
  },
  {
    id: 'music',
    label: '音乐老师',
    desc: '教学 IP · 人设口播',
    background: '声乐老师，教成人/儿童/钢琴，注重发声方法与舒适状态，用专业教学建立信任人设。',
    videos: [
      { key: '成人声乐老师', title: '声乐教学口播', video: '/videos/digital-成人声乐老师.mp4', poster: '/videos/posters/digital-成人声乐老师.jpg', frames: frames('music', '成人声乐老师'), textUrl: '/demo/music/成人声乐老师.txt' },
      { key: '儿童声乐老师', title: '少儿声乐人设', video: '/videos/digital-儿童声乐老师.mp4', poster: '/videos/posters/digital-儿童声乐老师.jpg', frames: frames('music', '儿童声乐老师'), textUrl: '/demo/music/儿童声乐老师.txt' },
      { key: '钢琴-IP', title: '钢琴教学 IP', video: '/videos/digital-钢琴-IP.mp4', poster: '/videos/posters/digital-钢琴-IP.jpg', frames: frames('music', '钢琴-IP'), textUrl: '/demo/music/钢琴-IP.txt' },
    ],
  },
  {
    id: 'business',
    label: '商业 IP',
    desc: '知识型 IP · 专业口播',
    background: '商业/法律/语言知识型导师，输出认知干货与专业内容，面向想提升认知、避坑的人群。',
    videos: [
      { key: '商业导师', title: '商业模式口播', video: '/videos/digital-商业导师.mp4', poster: '/videos/posters/digital-商业导师.jpg', frames: frames('business', '商业导师'), textUrl: '/demo/business/商业导师.txt' },
      { key: '律师导师', title: '法律人设 IP', video: '/videos/digital-律师导师.mp4', poster: '/videos/posters/digital-律师导师.jpg', frames: frames('business', '律师导师'), textUrl: '/demo/business/律师导师.txt' },
      { key: '韩语-IP', title: '语言教学 IP', video: '/videos/digital-韩语-IP.mp4', poster: '/videos/posters/digital-韩语-IP.jpg', frames: frames('business', '韩语-IP'), textUrl: '/demo/business/韩语-IP.txt' },
    ],
  },
  {
    id: 'product',
    label: '产品广告',
    desc: '产品可视化 · 宣传片',
    background: '产品可视化宣传：上传产品图，AI 生成宣传片，突出产品卖点与画面质感，适配电商/广告投放。',
    videos: [
      { key: '香水', title: '香水宣传片', video: '/videos/product-香水.mp4', poster: '/videos/posters/product-香水.jpg', frames: frames('product', '香水'), textUrl: '/demo/product/香水.txt' },
      { key: '电吹风', title: '电吹风广告', video: '/videos/product-电吹风.mp4', poster: '/videos/posters/product-电吹风.jpg', frames: frames('product', '电吹风'), textUrl: '/demo/product/电吹风.txt' },
      { key: '饮料', title: '饮料宣传', video: '/videos/product-饮料.mp4', poster: '/videos/posters/product-饮料.jpg', frames: frames('product', '饮料'), textUrl: '/demo/product/饮料.txt' },
    ],
  },
]
