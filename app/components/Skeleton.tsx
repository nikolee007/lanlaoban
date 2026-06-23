import React from 'react'

interface SkeletonProps {
  className?: string
  circle?: boolean
}

/**
 * Generic skeleton primitive.
 * - Use `className` to set dimensions (e.g. "w-full h-4")
 * - Use `circle` for circular/avatar shapes
 * - Always renders `animate-pulse bg-gray-200 rounded`
 */
function SkeletonBase({ className = '', circle = false }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${circle ? 'rounded-full' : 'rounded'} ${className}`}
      aria-hidden="true"
    />
  )
}

// ────────────────────────────────
// Named skeleton variants
// ────────────────────────────────

/** Product / supplier card skeleton (image + text + tags + actions) */
function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white shadow-sm" aria-hidden="true">
      {/* Image — 16:9 */}
      <div className="aspect-video w-full rounded-t-xl bg-gray-200" />

      {/* Content */}
      <div className="space-y-3 p-4">
        {/* Title lines */}
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />

        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-gray-200" />
          <div className="h-5 w-20 rounded-full bg-gray-200" />
          <div className="h-5 w-14 rounded-full bg-gray-200" />
        </div>

        {/* Price */}
        <div className="h-5 w-1/3 rounded bg-gray-200" />

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <div className="h-8 w-16 rounded-lg bg-gray-200" />
          <div className="h-8 w-16 rounded-lg bg-gray-200" />
          <div className="h-8 w-24 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

/** Detail page skeleton (back button, gallery, info, sidebar, related) */
function DetailPageSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      {/* Back button */}
      <div className="mb-4 h-4 w-24 rounded bg-gray-200" />

      {/* Main image gallery */}
      <div className="mb-6 aspect-video w-full rounded-xl bg-gray-200" />

      {/* Thumbnails row */}
      <div className="mb-4 flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 w-24 rounded-lg bg-gray-200" />
        ))}
      </div>

      {/* Title */}
      <div className="mb-3 space-y-2">
        <div className="h-7 w-3/4 rounded bg-gray-200" />
        <div className="h-5 w-1/2 rounded bg-gray-200" />
      </div>

      {/* Tags row */}
      <div className="mb-4 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-200" />
        <div className="h-6 w-20 rounded-full bg-gray-200" />
        <div className="h-6 w-14 rounded-full bg-gray-200" />
        <div className="h-6 w-24 rounded-full bg-gray-200" />
      </div>

      {/* Price section */}
      <div className="mb-6 space-y-2">
        <div className="h-8 w-40 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-200" />
      </div>

      {/* Description paragraph */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-11/12 rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
      </div>

      {/* Detail info table */}
      <div className="mt-6 space-y-4 rounded-xl border border-gray-100 bg-white p-5">
        <div className="h-5 w-32 rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-16 rounded bg-gray-200" />
              <div className="h-5 w-24 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Search / category result list skeleton (image left + content right) */
interface SearchResultSkeletonProps {
  count?: number
}

function SearchResultSkeleton({ count = 5 }: SearchResultSkeletonProps) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse gap-4 rounded-xl border border-gray-100 bg-white p-4"
        >
          {/* Thumbnail */}
          <div className="h-24 w-24 shrink-0 rounded-lg bg-gray-200 sm:h-32 sm:w-40" />

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between py-1">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>

            {/* Tags */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-16 rounded-full bg-gray-200" />
              <div className="h-5 w-20 rounded-full bg-gray-200" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 rounded-lg bg-gray-200" />
              <div className="h-8 w-16 rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Category grid skeleton (icons + labels) */
interface CategoryGridSkeletonProps {
  count?: number
  columns?: number
}

function CategoryGridSkeleton({ count = 18, columns = 4 }: CategoryGridSkeletonProps) {
  const colsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }[columns] || 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'

  return (
    <div className={`grid gap-4 ${colsClass}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-6"
        >
          {/* Icon */}
          <div className="h-12 w-12 rounded-xl bg-gray-200" />

          {/* Name */}
          <div className="h-4 w-16 rounded bg-gray-200" />

          {/* Subtitle */}
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────
// Default export (backward compat)
// ────────────────────────────────

export default function Skeleton(props: SkeletonProps) {
  return <SkeletonBase {...props} />
}

Skeleton.Card = ProductCardSkeleton
Skeleton.Detail = DetailPageSkeleton
Skeleton.List = SearchResultSkeleton

// Named exports for direct import
export {
  ProductCardSkeleton,
  DetailPageSkeleton,
  SearchResultSkeleton,
  CategoryGridSkeleton,
}
