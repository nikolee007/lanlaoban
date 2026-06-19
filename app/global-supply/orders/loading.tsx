import Skeleton from '../../components/Skeleton'

export default function OrdersLoading() {
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
        <Skeleton className="mb-4 h-3 w-36" />

        {/* Header */}
        <div className="mb-6 space-y-1">
          <Skeleton className="h-7 w-28 sm:h-8" />
          <Skeleton className="h-4 w-52" />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        </div>

        {/* Order cards */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white">
              {/* Order header */}
              <div className="flex items-center justify-between border-b border-gray-50 px-5 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Order items */}
              <div className="space-y-3 px-5 py-4">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3 w-28" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16 text-right" />
                  </div>
                ))}
              </div>

              {/* Order footer */}
              <div className="flex items-center justify-between border-t border-gray-50 px-5 py-3">
                <Skeleton className="h-3 w-40" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
