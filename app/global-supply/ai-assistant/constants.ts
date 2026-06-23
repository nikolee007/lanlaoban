import { FiStar, FiTarget, FiCamera, FiDollarSign, FiGlobe, FiTrendingUp } from 'react-icons/fi'
import type { IpProfileData } from './types'

export const CONVERSATIONS_KEY = 'lanlaoban_ip_conversations'
export const ACTIVE_CONV_KEY = 'lanlaoban_ip_active_id'
export const IP_PROFILE_KEY = 'lanlaoban_ip_profile'

export const FOLLOW_UP_QUESTIONS = [
  '最近生意怎么样？有没有什么新鲜事想分享？',
  '上次聊的那个产品方向，你试了没有？',
  '有没有遇到什么瓶颈？说出来我帮你分析',
  '你最近的客户都是什么类型的？他们的反馈怎么样？',
  '有没有想过拓展新渠道？我帮你看看有什么机会',
]

export const QUICK_ACTIONS = [
  { icon: FiStar, label: '讲你的创业故事', prompt: '给我讲讲你的创业/开店经历吧，我想了解你的故事' },
  { icon: FiTarget, label: '分析你的目标客户', prompt: '帮我分析一下我的目标客户应该是什么样的人' },
  { icon: FiCamera, label: '生成短视频脚本', prompt: '请为我生成一条专业的2分钟短视频脚本。要求：1. 开场前3秒必须有强钩子抓住注意力 2. 分6-8段，每段标注时间戳、画面描述、台词、拍摄机位 3. 台词要口语化，像是真人说话 4. 结尾要有明确的号召行动 5. 总共大约250-350字台词 6. 每段都要标注拍摄角度和景别' },
  { icon: FiDollarSign, label: '评估商业模式', prompt: '帮我看一下我的商业模式有什么可以优化的' },
  { icon: FiGlobe, label: '市场机会分析', prompt: '帮我分析一下我所在的行业有什么新机会' },
  { icon: FiTrendingUp, label: '内容策略建议', prompt: '帮我规划一下接下来一个月的内容发布策略' },
]

export const SHOP_INDUSTRIES = ['餐饮美食','服装时尚','数码科技','家居生活','教育培训','美妆个护','宠物','运动户外','母婴亲子','其他']
export const INDUSTRIES = ['餐饮美食','服装时尚','数码科技','家居生活','教育培训','美妆个护','宠物','运动户外','母婴亲子','其他']

export const DEFAULT_PROFILE: IpProfileData = {
  name: '', industry: '', experience: '', targetAudience: '',
  originStory: '', achievements: [], keyEvents: [], contentIdeas: [],
  videoCount: 0, followUpCount: 0, lastChatAt: '', nextFollowUpAt: '',
}
