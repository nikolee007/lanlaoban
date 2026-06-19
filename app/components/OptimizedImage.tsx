'use client'
import { useState } from 'react'

interface OptImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fallback?: string
}

export default function OptimizedImage({ src, alt, className = '', width, height, fallback }: OptImageProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const fallbackSrc = fallback || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="%239ca3af" font-size="16">No Image</text></svg>'

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        loading="lazy"
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
