import Skeleton from '../../components/Skeleton'

export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
            <div className="border-b bg-white/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gray-200" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>

      {/* Sub-nav skeleton */}
      <div className="border-b border-gray-100 bg-white/80 px-4 py-2 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Breadcrumb */}
        <Skeleton className="mb-4 h-3 w-48" />

        {/* Header */}
        <div className="mb-8 space-y-3">
          <Skeleton className="h-8 w-48 sm:h-9" />
          <Skeleton className="h-4 w-96" />
          <div className="flex items-center gap-6">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5"
            >
              {/* Icon */}
              <Skeleton className="h-14 w-14 rounded-xl" />

              {/* Name + desc */}
              <div className="mt-4 space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-44" />
              </div>

              {/* Tags */}
              <div className="mt-3 flex gap-1.5">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center gap-4 border-t border-gray-50 pt-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
