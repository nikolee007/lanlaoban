'use client'

import { useState } from 'react'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import OptimizedImage from '../../../components/OptimizedImage'

interface ImageCarouselProps {
  images: string[]
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const { locale } = useLocale()
  const [current, setCurrent] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const hasMultiple = images.length > 1

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white" role="region" aria-label={t('detail.imageAlt', locale)}>
      <div
        className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-gray-100 sm:aspect-[16/9]"
        onClick={() => setZoomed(!zoomed)}
      >
        <OptimizedImage
          src={images[current]}
          alt={t('detail.imageAlt', locale).replace('{index}', String(current + 1))}
          className={`h-full w-full object-cover transition-all duration-300 ${zoomed ? 'scale-150' : 'scale-100'}`}
          width={800} height={600}
        />
        {hasMultiple && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow backdrop-blur-sm transition-colors hover:bg-white"
              aria-label={t('detail.prevImage', locale)}
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow backdrop-blur-sm transition-colors hover:bg-white"
              aria-label={t('detail.nextImage', locale)}
            >
              <FiArrowRight className="h-5 w-5" />
            </button>
          </>
        )}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-brand-400' : 'w-2 bg-white/60 hover:bg-white/90'}`}
                aria-label={t('detail.imageCount', locale).replace('{index}', String(i + 1))}
              />
            ))}
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white backdrop-blur-sm">
          {current + 1} / {images.length}
        </span>
      </div>

      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto px-3 py-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === current ? 'border-brand-400 opacity-100' : 'border-transparent opacity-60 hover:opacity-90'}`}
            >
              <OptimizedImage src={img} alt={t('detail.thumbnailAlt', locale).replace('{index}', String(i + 1))} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
