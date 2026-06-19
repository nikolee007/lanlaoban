import Skeleton from '../../components/Skeleton'

export default function MyResourcesLoading() {
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Breadcrumb */}
        <Skeleton className="mb-4 h-3 w-48" />

        {/* Header */}
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-36 sm:h-8" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-9 w-44 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
        </div>

        {/* Resources list */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4"
            >
              {/* Type icon */}
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />

              {/* Info */}
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-56" />
              </div>

              {/* Time + actions */}
              <div className="hidden items-center gap-3 sm:flex">
                <div className="text-right">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-1 h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
