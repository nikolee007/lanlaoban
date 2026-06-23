'use client'

import Image from 'next/image'
import { FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import type { Style, DigitalHumanMode, DigitalHumanGender } from './types'

/* ─────────────────── Constants ─────────────────── */

export const STYLES: { key: Style; label: string; desc: string; image: string }[] = [
  { key: 'professional', label: '专业商务', desc: '正式、专业、可信赖，适合B2B企业宣传', image: '/images/brand-promotion/style-professional.jpg' },
  { key: 'social', label: '社交热辣', desc: '活泼、吸睛、节奏快，适合TikTok/抖音带货', image: '/images/brand-promotion/style-social.jpg' },
  { key: 'tech', label: '科技感', desc: '未来感、极简、炫酷，适合科技产品与创新品牌', image: '/images/brand-promotion/style-tech.jpg' },
  { key: 'sincere', label: '朴实真诚', desc: '温暖、真实、接地气，适合工厂/手艺人/老字号', image: '/images/brand-promotion/style-sincere.jpg' },
]

export const LANGUAGES: { key: string; flagCode: string; label: string }[] = [
  { key: 'zh', flagCode: 'cn', label: '简体中文' },
  { key: 'zh-tw', flagCode: 'tw', label: '繁体中文' },
  { key: 'en', flagCode: 'gb', label: '英语' },
  { key: 'ja', flagCode: 'jp', label: '日语' },
  { key: 'ko', flagCode: 'kr', label: '韩语' },
  { key: 'fr', flagCode: 'fr', label: '法语' },
  { key: 'de', flagCode: 'de', label: '德语' },
  { key: 'es', flagCode: 'es', label: '西班牙语' },
  { key: 'pt', flagCode: 'pt', label: '葡萄牙语' },
  { key: 'ru', flagCode: 'ru', label: '俄语' },
  { key: 'it', flagCode: 'it', label: '意大利语' },
  { key: 'ar', flagCode: 'sa', label: '阿拉伯语' },
  { key: 'th', flagCode: 'th', label: '泰语' },
  { key: 'vi', flagCode: 'vn', label: '越南语' },
  { key: 'id', flagCode: 'id', label: '印尼语' },
]

export const DIGITAL_HUMAN_MODES: { key: DigitalHumanMode; label: string; desc: string; image: string }[] = [
  { key: 'none', label: '无数字人', desc: '纯产品展示 + AI配音，适合快速出片', image: '/images/brand-promotion/dh-none.jpg' },
  { key: 'pip', label: '画中画口播', desc: '数字人站姿讲解，产品以画中画形式展示', image: '/images/brand-promotion/dh-pip.jpg' },
  { key: 'handhold', label: '手持产品讲解', desc: '数字人手持产品展示讲解（需额外服务）', image: '/images/brand-promotion/dh-handhold.jpg' },
]

export const DURATIONS = [60, 90, 120]

/* ─────────────────── Props ─────────────────── */

interface ConfigStepProps {
  style: Style
  selectedLanguages: string[]
  digitalHumanMode: DigitalHumanMode
  digitalHumanGender: DigitalHumanGender
  duration: number
  onStyleChange: (s: Style) => void
  onToggleLanguage: (key: string) => void
  onDigitalHumanModeChange: (m: DigitalHumanMode) => void
  onDigitalHumanGenderChange: (g: DigitalHumanGender) => void
  onDurationChange: (d: number) => void
  onPrev: () => void
  onNext: () => void
  canGoNext: boolean
}

/* ─────────────────── Component ─────────────────── */

export default function ConfigStep({
  style, selectedLanguages, digitalHumanMode, digitalHumanGender, duration,
  onStyleChange, onToggleLanguage, onDigitalHumanModeChange,
  onDigitalHumanGenderChange, onDurationChange,
  onPrev, onNext, canGoNext,
}: ConfigStepProps) {
  return (
    <div className="space-y-6">
      {/* Style Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">宣传风格</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STYLES.map(s => (
            <button
              key={s.key}
              onClick={() => onStyleChange(s.key)}
              className={`
                relative p-3 rounded-xl border-2 text-left transition-all overflow-hidden
                ${style === s.key
                  ? 'border-[#FF6034] bg-orange-50/50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="relative h-20 rounded-lg overflow-hidden mb-2 bg-gray-100">
                <Image src={s.image} alt={s.label} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-1.5 left-2 text-white text-xs font-bold drop-shadow-sm">{s.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{s.desc}</p>
              {style === s.key && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-[#FF6034] rounded-full flex items-center justify-center shadow-md">
                  <FiCheck size={13} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Language Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          目标语言
          <span className="ml-2 text-xs font-normal text-gray-400">
            已选 {selectedLanguages.length} 种语言
          </span>
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {LANGUAGES.map(l => {
            const selected = selectedLanguages.includes(l.key)
            return (
              <button
                key={l.key}
                onClick={() => onToggleLanguage(l.key)}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                  ${selected
                    ? 'border-[#FF6034] bg-orange-50 text-[#FF6034]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <Image
                  src={`https://flagcdn.com/w40/${l.flagCode}.png`}
                  alt={l.label}
                  width={20}
                  height={15}
                  className="rounded-sm shadow-sm"
                />
                <span className="truncate">{l.label}</span>
                {selected && <FiCheck size={14} className="ml-auto shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Digital Human Mode */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">数字人模式</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIGITAL_HUMAN_MODES.map(m => (
            <button
              key={m.key}
              onClick={() => onDigitalHumanModeChange(m.key)}
              className={`
                relative p-3 rounded-xl border-2 text-left transition-all overflow-hidden
                ${digitalHumanMode === m.key
                  ? 'border-[#FF6034] bg-orange-50/50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="relative h-20 rounded-lg overflow-hidden mb-2 bg-gray-100">
                <Image src={m.image} alt={m.label} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-1.5 left-2 text-white text-xs font-bold drop-shadow-sm">{m.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
              {digitalHumanMode === m.key && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-[#FF6034] rounded-full flex items-center justify-center shadow-md">
                  <FiCheck size={13} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Digital Human Gender */}
        {digitalHumanMode !== 'none' && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">数字人形象</h4>
            <div className="flex gap-3">
              <button
                onClick={() => onDigitalHumanGenderChange('male')}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all
                  ${digitalHumanGender === 'male'
                    ? 'border-[#FF6034] bg-orange-50 text-[#FF6034]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <Image src="/images/brand-promotion/gender-male.jpg" alt="男" width={36} height={36} className="rounded-full object-cover" />
                <span>男</span>
                {digitalHumanGender === 'male' && <FiCheck size={14} />}
              </button>
              <button
                onClick={() => onDigitalHumanGenderChange('female')}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all
                  ${digitalHumanGender === 'female'
                    ? 'border-[#FF6034] bg-orange-50 text-[#FF6034]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <Image src="/images/brand-promotion/gender-female.jpg" alt="女" width={36} height={36} className="rounded-full object-cover" />
                <span>女</span>
                {digitalHumanGender === 'female' && <FiCheck size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Duration */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">视频时长</h3>
        <div className="flex gap-3">
          {DURATIONS.map(d => (
            <button
              key={d}
              onClick={() => onDurationChange(d)}
              className={`
                px-6 py-3 rounded-xl border-2 font-medium text-sm transition-all
                ${duration === d
                  ? 'border-[#FF6034] bg-orange-50 text-[#FF6034]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }
              `}
            >
              {d}秒
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
        >
          <FiChevronLeft size={18} /> 上一步
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-2 px-8 py-3 bg-[#FF6034] text-white rounded-xl font-semibold hover:bg-[#E8552E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          下一步 <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
