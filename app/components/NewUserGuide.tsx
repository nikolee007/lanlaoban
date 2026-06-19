'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FiX, FiArrowRight, FiCheck } from 'react-icons/fi'

const INDUSTRIES = [
  '电子',
  '服装',
  '家居',
  '美妆',
  '食品',
  '玩具',
  '运动户外',
  '汽车配件',
  '医疗健康',
  '宠物用品',
]

const STEPS = [
  {
    title: '欢迎来到懒老板！',
    description: '懒老板是老板的一站式服务平台。在这里，你可以对接全球优质供应商、管理采购订单、获取行业资讯，让生意更简单。',
  },
  {
    title: '先选你感兴趣的行业',
    description: '选择你关注的行业，我们会为你推荐更精准的货源和供应商。',
    hasIndustries: true,
  },
  {
    title: '看看我们为你推荐的商品',
    description: '我们已经为你精选了热门商品和优质供应商。点击下方按钮，开始你的采购之旅吧！',
  },
]

export default function NewUserGuide() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      const isNewUser = localStorage.getItem('lanlaoban_new_user') === 'true'
      if (isNewUser) {
        // 延迟一点显示，让页面先渲染
        const timer = setTimeout(() => setVisible(true), 500)
        return () => clearTimeout(timer)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry],
    )
  }

  const handleDismiss = () => {
    try {
      localStorage.removeItem('lanlaoban_new_user')
    } catch {
      // ignore
    }
    setVisible(false)
    setDismissed(true)
  }

  const handleFinish = () => {
    try {
      localStorage.removeItem('lanlaoban_new_user')
    } catch {
      // ignore
    }
    setVisible(false)
    setDismissed(true)
    router.push('/global-supply/hot')
  }

  if (!visible || dismissed) return null

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const isSecondStep = currentStep === 1

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
          aria-label="关闭"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="px-8 pt-10 pb-6">
          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-6 bg-brand-400'
                    : idx < currentStep
                      ? 'bg-brand-200'
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
          </div>

          {/* Industry selection for step 2 */}
          {isSecondStep && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {INDUSTRIES.map((industry) => {
                  const selected = selectedIndustries.includes(industry)
                  return (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        selected
                          ? 'bg-brand-400 text-white border-brand-400'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand-200 hover:text-brand-400'
                      }`}
                    >
                      {selected && <FiCheck className="w-3.5 h-3.5" />}
                      {industry}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">
                已选 {selectedIndustries.length} 个行业
              </p>
            </div>
          )}

          {/* Action button */}
          <div className="flex justify-end">
            {isLastStep ? (
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-brand-400 hover:bg-brand-500 transition-colors"
              >
                开始探索
                <FiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-brand-400 hover:bg-brand-500 transition-colors"
              >
                下一步
                <FiArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
