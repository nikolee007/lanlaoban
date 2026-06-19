import Skeleton from '../../../components/Skeleton'

export default function CategoryDetailLoading() {
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

      {/* Banner */}
      <div className="h-44 w-full animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 sm:h-56" aria-hidden="true">
        <div className="mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6">
          <div className="space-y-3">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-8 w-52 sm:h-9" />
            <Skeleton className="h-4 w-80" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        {/* Breadcrumb */}
        <Skeleton className="mb-4 h-3 w-56" />

        {/* Category info */}
        <div className="mb-6 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Filters bar */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <div className="ml-auto">
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* Result count */}
        <Skeleton className="mb-4 h-4 w-32" />

        {/* Results */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white sm:flex-row">
              {/* Image */}
              <Skeleton className="aspect-video w-full sm:h-44 sm:w-52 sm:shrink-0" />

              {/* Content */}
              <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-56" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-28 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 mb-12 flex items-center justify-center gap-3">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </main>
    </div>
  )
}
