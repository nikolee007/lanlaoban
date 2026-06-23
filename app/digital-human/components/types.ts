import type { ComponentType } from 'react'

export type Step = 'scene' | 'photo' | 'script' | 'voice' | 'generate' | 'result'
export type SceneId = 'standing' | 'sitting' | 'walking' | 'product' | 'kitchen' | 'storefront'

export interface SceneTpl {
  id: SceneId
  title: string
  desc: string
  icon: ComponentType<{ className?: string }>
  industry: string
  refImage: string
  tip: string
}

export interface VoiceClone {
  id: string
  name: string
  createdAt: number
}

import { FiUser, FiMonitor, FiCamera } from 'react-icons/fi'

export const SCENES: SceneTpl[] = [
  { id:'standing', title:'站立口播', desc:'正面站立，门店/车间背景', icon: FiUser, industry:'餐饮 · 工厂 · 门店', refImage:'/shooting-templates/standing_restaurant.png', tip:'穿工装或正装，双脚与肩同宽' },
  { id:'sitting', title:'坐姿访谈', desc:'坐办公桌/吧台前', icon: FiMonitor, industry:'知识博主 · 顾问', refImage:'/shooting-templates/sitting_trust.png', tip:'身体前倾有亲和力，双手放桌面' },
  { id:'walking', title:'走姿讲解', desc:'边走边讲，展示环境', icon: FiCamera, industry:'探店 · 工厂参观', refImage:'/shooting-templates/walking_restaurant.png', tip:'走慢30%，边走边指给镜头看' },
  { id:'product', title:'产品展示', desc:'手持产品，特写讲解', icon: FiCamera, industry:'好物测评', refImage:'/shooting-templates/closeup_review.png', tip:'双手持产品，展示细节' },
  { id:'kitchen', title:'厨房操作台', desc:'站灶台/操作台前', icon: FiUser, industry:'餐饮 · 手工艺', refImage:'/shooting-templates/restaurant-美食特写.png', tip:'背景要干净，光线要足' },
  { id:'storefront', title:'门店招牌前', desc:'站店门口/招牌下', icon: FiCamera, industry:'所有实体店', refImage:'/shooting-templates/envshot_restaurant.png', tip:'门头要清晰，白天光线最好' },
]

export const SCRIPT_TEMPLATES = [
  { id: 'quick', label: '快速口播', text: '大家好，我是[品牌]的[名字]。今天跟大家聊聊[话题]…关注我，了解更多。' },
  { id: 'story', label: '创业故事', text: '我做[行业]已经[年数]年了。从一开始的[困难]到现在的[成就]，靠的就是[理念]…' },
  { id: 'tip', label: '干货分享', text: '很多人问我[问题]，其实核心就三点：第一…第二…第三…觉得有用点个赞。' },
]

export const PROGRESS_STAGES = [
  { min: 0, max: 10, label: '提交任务到 AI 服务器...', time: '约 5 秒' },
  { min: 10, max: 30, label: 'AI 正在生成数字人形象...', time: '约 30 秒' },
  { min: 30, max: 70, label: 'AI 正在合成口播视频...', time: '约 1-2 分钟' },
  { min: 70, max: 90, label: '正在生成配音...', time: '约 30 秒' },
  { min: 90, max: 100, label: '最终处理中...', time: '约 10 秒' },
]

export function getStage(progress: number) {
  return PROGRESS_STAGES.find(s => progress >= s.min && progress < s.max) || PROGRESS_STAGES[PROGRESS_STAGES.length - 1]
}

export const VOICE_CLONE_KEY = 'lanlaoban_voice_clones'

export function getVoiceClones(): VoiceClone[] {
  try { return JSON.parse(localStorage.getItem(VOICE_CLONE_KEY) || '[]') } catch { return [] }
}

export function saveVoiceClone(clone: VoiceClone) {
  const clones = getVoiceClones()
  clones.unshift(clone)
  localStorage.setItem(VOICE_CLONE_KEY, JSON.stringify(clones.slice(0, 10)))
}
