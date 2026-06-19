import Skeleton from '../../components/Skeleton'

export default function CheckoutLoading() {
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
        <Skeleton className="mb-4 h-3 w-40" />

        {/* Steps indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-1 w-16" />
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-1 w-16" />
          <Skeleton className="h-6 w-24 rounded-lg" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column — form (2/3) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Contact info */}
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <Skeleton className="mb-4 h-5 w-28" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
            </div>

            {/* Shipping address */}
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <Skeleton className="mb-4 h-5 w-28" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-10 rounded-lg" />
                  <Skeleton className="h-10 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>

          {/* Right column — summary (1/3) */}
          <div className="space-y-5">
            {/* Order summary */}
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <Skeleton className="mb-4 h-5 w-28" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-36" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-gray-50 pt-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <Skeleton className="mb-4 h-5 w-28" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>

            {/* Submit button */}
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  )
}
