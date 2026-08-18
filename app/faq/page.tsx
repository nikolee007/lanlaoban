'use client'
import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'
import { FiHelpCircle, FiArrowRight } from 'react-icons/fi'

const faqs = [
  {
    q: '懒老板是什么？',
    a: '懒老板是一个AI IP操盘和产品可视化平台。两条产品线：AI IP操盘手帮老板做个人IP（AI采访→人设策略→内容生产），AI 产品导演帮商家做产品宣传视频（上传产品图→选风格→生成短片+广告图）。',
  },
  {
    q: '我不会做短视频，能用人设IP功能吗？',
    a: '完全不需要。AI会像记者一样采访你，自动挖出你的故事和价值观，然后出人设策略、写脚本、生成口播视频。你只需要回答问题，剩下的交给AI。',
  },
  {
    q: 'IP操盘手每月真的能出30-60条？',
    a: '是的。尝鲜版月10条，标准版月30条脚本+成片，专业版月60条。由专属编导Agent基于你的品类与风格定制，AI自动批量生成。素材通过邮箱交付，在线预览和下载。',
  },
  {
    q: '产品导演支持什么格式的视频？',
    a: '母片40-60s精品短片，支持9:16竖屏、1:1方屏、16:9横屏。基于母片可用算力衍生多语种（中/英/日/韩等）和多画幅版本。',
  },
  {
    q: '我不懂片子，怎么选风格？',
    a: '三种方式：1）有参考视频→上传，AI分析后生成同类风格；2）见过类似效果→看图选模板；3）不知道选什么→上传产品图，AI推荐最佳风格并出3个样片预览。',
  },
  {
    q: '一条产品母片包含什么？',
    a: '40-60s精品短片（1种画幅+1门基础语种）+ 配套AI广告图片 + 1轮免费基础微调 + 商用版权。',
  },
  {
    q: '成片后还想修改怎么办？',
    a: '小幅优化（画面微调、文案替换）消耗算力点。如果需要重构叙事、全新脚本或整体换风格，需新建母片。',
  },
  {
    q: '项目包里的多条母片必须一次性做完吗？',
    a: '不需要。项目包有效期12个月，你可以根据产品上新节奏分批提交制作需求。',
  },
  {
    q: '怎么收费的？',
    a: 'IP操盘手按月订阅：尝鲜版¥199/月、标准版¥1,999/月、专业版¥2,999/月，1年续费8折、2年续费7折。产品导演按项目包（¥4,299起）+可选会员+算力充值。具体见定价页面。',
  },
  {
    q: '可以低成本先试试吗？',
    a: '可以。¥199/月尝鲜版（脚本10条+成片10条，可一键数字人口播），¥1,299体验产品小样（精简样片+效果图）。尝鲜版产出支持商用。',
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0B]">
      <NavHeader />

      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#FF6034]/5 to-transparent blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3">FAQ</p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">常见问题</h1>
          <p className="text-lg text-[#6B7280]">关于懒老板，这里都有答案</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-2xl border border-[#E5E7EB] transition-all duration-200 open:border-[#FF6034]/20 open:bg-[#FFF8F5]/50 hover:border-[#FF6034]/10">
              <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-sm font-medium text-[#0A0A0B] list-none">
                <span>{faq.q}</span>
                <FiHelpCircle className="w-5 h-5 text-[#6B7280] group-open:text-[#FF6034] shrink-0 ml-4 transition-colors" />
              </summary>
              <div className="px-6 pb-5 pt-0 text-sm text-[#6B7280] leading-relaxed border-t border-[#FF6034]/10">
                <div className="pt-4">{faq.a}</div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-[#FAFAFA]">
        <div className="mx-auto max-w-xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-2">还有问题？</h2>
          <p className="text-sm text-[#6B7280] mb-6">没找到想要的答案？联系我们</p>
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full bg-[#FF6034] text-white px-6 py-3 text-sm font-semibold hover:shadow-lg transition-all">
            查看定价 <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-[#0A0A0B] text-white/50 py-12 px-6 text-sm text-center">
        <div className="flex items-center justify-center gap-6 mb-4 flex-wrap">
          <Link href="/about" className="hover:text-white transition-colors">关于我们</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">定价</Link>
          <Link href="/terms" className="hover:text-white transition-colors">服务条款</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">隐私政策</Link>
        </div>
        <p>© 2026 懒老板 — AI IP操盘手 & AI 产品导演</p>
      </footer>
    </div>
  )
}
