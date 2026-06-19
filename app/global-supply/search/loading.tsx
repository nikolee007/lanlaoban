import Skeleton from '../../components/Skeleton'

export default function SearchLoading() {
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

      {/* Header bar skeleton */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-10 flex-1 max-w-xl rounded-lg" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <Skeleton className="mb-3 h-3 w-56" />

        {/* Search info */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-48 sm:h-7" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Filters bar */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <div className="ml-auto">
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <Skeleton className="h-4 w-36" />
        </div>

        {/* Result cards */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white sm:flex-row">
              {/* Image */}
              <Skeleton className="aspect-video w-full sm:h-48 sm:w-56 sm:shrink-0" />

              {/* Content */}
              <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>

                {/* Price */}
                <Skeleton className="h-6 w-36" />

                {/* Tags */}
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                {/* Meta info */}
                <Skeleton className="h-3 w-56" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-28 rounded-lg" />
                  <div className="ml-auto">
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
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
