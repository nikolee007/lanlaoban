import Skeleton from '../../components/Skeleton'

export default function CartLoading() {
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
        <Skeleton className="mb-4 h-3 w-32" />

        {/* Cart header */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-7 w-24 sm:h-8" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Cart items */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
              {/* Checkbox */}
              <Skeleton className="h-5 w-5 shrink-0 rounded" />
              {/* Image */}
              <Skeleton className="h-20 w-20 shrink-0 rounded-lg sm:h-24 sm:w-24" />
              {/* Info */}
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              {/* Quantity */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-10" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              {/* Action */}
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>

        {/* Summary bar */}
        <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </main>
    </div>
  )
}
