import type { HotProductData } from '../components/ProductCard'
import { FiBarChart2, FiTarget, FiGlobe, FiHeart } from 'react-icons/fi'
import type { IconType } from 'react-icons'

export interface InsightCardData {
  id: string
  title: string
  description: string
  region: string
  icon: IconType
}

export const INSIGHT_CARDS: InsightCardData[] = [
  {
    id: 'insight-1',
    title: '蓝牙耳机在东南亚搜索量月增40%',
    description: '受 TikTok 短视频带货影响，真无线耳机在越南、泰国搜索量激增，建议关注白牌高性价比产品线。',
    region: '东南亚',
    icon: FiBarChart2,
  },
  {
    id: 'insight-2',
    title: '中东美妆个护品类爆发式增长',
    description: '斋月后中东美妆电商搜索量环比增长65%，天然成分护肤品和香氛产品成热销新趋势。',
    region: '中东',
    icon: FiTarget,
  },
  {
    id: 'insight-3',
    title: '欧洲家居小件需求持续走高',
    description: '欧洲通胀下消费者转向平价替代，收纳、厨房小工具客单价$5-15最受欢迎，复购率高。',
    region: '欧洲',
    icon: FiGlobe,
  },
  {
    id: 'insight-4',
    title: '拉美市场运动户外品类升温',
    description: '巴西、墨西哥夏季到来，泳装、运动水壶、户外露营装备搜索量大幅攀升，利润空间可观。',
    region: '拉美',
    icon: FiHeart,
  },
]

export const GROWTH_RATES = ['+230%', '+187%', '+156%', '+98%', '+76%', '+145%', '+112%', '+89%', '+134%', '+67%', '+203%', '+156%']
export const REGIONS_POOL = ['美国', '欧洲', '东南亚', '中东', '拉美', '日本', '北美']

export const FALLBACK: HotProductData[] = [
  { id: 1, name: '磁吸无线充电宝 20000mAh', region: '美国', growthRate: '+230%', hotTag: '搜+40%', sales: '月销3000+' },
  { id: 2, name: '智能宠物喂食器 带摄像头', region: '欧洲', growthRate: '+187%', hotTag: '月销3k+', sales: '月销3000+' },
  { id: 3, name: '便携式榨汁机 USB-C 充电', region: '美国', growthRate: '+156%', hotTag: '加购65%', sales: '月销5000+' },
  { id: 4, name: '可折叠硅胶旅行水壶', region: '东南亚', growthRate: '+98%', hotTag: '日单800+', sales: '月销2400+' },
  { id: 5, name: 'LED 化妆镜 三色温调节', region: '中东', growthRate: '+76%', hotTag: ' 月销1800+', sales: '月销1800+' },
  { id: 6, name: '蓝牙5.3 TWS降噪耳机', region: '东南亚', growthRate: '+145%', hotTag: '搜+55%', sales: '月销8000+' },
  { id: 7, name: '北欧简约陶瓷餐具套装', region: '欧洲', growthRate: '+112%', hotTag: '好评97%', sales: '月销2000+' },
  { id: 8, name: '纯棉婴儿连体爬服', region: '美国', growthRate: '+89%', hotTag: '日单500+', sales: '月销3500+' },
  { id: 9, name: '高弹力瑜伽运动套装', region: '拉美', growthRate: '+134%', hotTag: '搜+48%', sales: '月销4500+' },
  { id: 10, name: '真丝睡衣套装', region: '欧洲', growthRate: '+67%', hotTag: '复购72%', sales: '月销1200+' },
  { id: 11, name: '智能一体马桶 带烘干', region: '中东', growthRate: '+203%', hotTag: '搜+80%', sales: '月销600+' },
  { id: 12, name: '宠物玩具磨牙棒', region: '东南亚', growthRate: '+156%', hotTag: '月销5k+', sales: '月销5000+' },
  { id: 13, name: '不锈钢保温饭盒 便当盒', region: '日本', growthRate: '+92%', hotTag: '月销2k+', sales: '月销2000+' },
  { id: 14, name: '鸭舌帽 纯色基础款', region: '美国', growthRate: '+78%', hotTag: '日单600+', sales: '月销4200+' },
  { id: 15, name: '智能跳绳 计数 APP', region: '欧洲', growthRate: '+145%', hotTag: '搜+52%', sales: '月销3200+' },
  { id: 16, name: '汽车遮阳挡 折叠防晒', region: '中东', growthRate: '+88%', hotTag: '好评94%', sales: '月销1500+' },
  { id: 17, name: '儿童益智拼图 木制', region: '东南亚', growthRate: '+110%', hotTag: '月销2.8k+', sales: '月销2800+' },
  { id: 18, name: '保温杯 大容量 1.5L', region: '拉美', growthRate: '+67%', hotTag: '加购58%', sales: '月销3600+' },
  { id: 19, name: '无线蓝牙音箱 户外防水', region: '美国', growthRate: '+132%', hotTag: '搜+60%', sales: '月销5500+' },
  { id: 20, name: '家用空气炸锅 6L', region: '欧洲', growthRate: '+95%', hotTag: '日单400+', sales: '月销1800+' },
  { id: 21, name: '精油香薰机 超声波', region: '中东', growthRate: '+74%', hotTag: '复购68%', sales: '月销900+' },
  { id: 22, name: '速干运动T恤 男款', region: '东南亚', growthRate: '+118%', hotTag: '月销4k+', sales: '月销4000+' },
  { id: 23, name: '无线充电鼠标 静音', region: '日本', growthRate: '+83%', hotTag: '搜+35%', sales: '月销1600+' },
  { id: 24, name: '尼龙编织数据线 三合一', region: '拉美', growthRate: '+101%', hotTag: '日单700+', sales: '月销5800+' },
  { id: 25, name: '智能体脂秤 蓝牙 APP', region: '美国', growthRate: '+155%', hotTag: '搜+45%', sales: '月销2800+' },
  { id: 26, name: '亚克力化妆品收纳盒', region: '欧洲', growthRate: '+79%', hotTag: '好评96%', sales: '月销2200+' },
  { id: 27, name: '户外露营灯 可充电', region: '北美', growthRate: '+127%', hotTag: '月销3.1k+', sales: '月销3100+' },
  { id: 28, name: '男士电动剃须刀 防水', region: '东南亚', growthRate: '+93%', hotTag: '加购62%', sales: '月销4700+' },
]

export const ITEMS_PER_PAGE = 12
