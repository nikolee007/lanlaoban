import Skeleton from '../../components/Skeleton'

export default function DetailLoading() {
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
        <Skeleton className="mb-6 h-3 w-64" />

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left column — images and main info (3/5) */}
          <div className="lg:col-span-3 lg:pr-4">
            {/* Main image */}
            <Skeleton className="mb-4 aspect-video w-full rounded-xl" />

            {/* Thumbnails row */}
            <div className="mb-6 flex gap-3">
              <Skeleton className="h-16 w-24 rounded-lg" />
              <Skeleton className="h-16 w-24 rounded-lg" />
              <Skeleton className="h-16 w-24 rounded-lg" />
              <Skeleton className="h-16 w-24 rounded-lg" />
            </div>

            {/* Product title */}
            <Skeleton className="mb-2 h-7 w-3/4" />
            <Skeleton className="mb-1 h-5 w-1/2" />

            {/* Tags */}
            <div className="mb-4 flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Price section */}
            <div className="mb-6 space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Details table */}
            <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5">
              <Skeleton className="mb-4 h-5 w-32" />
              <div className="grid grid-cols-2 gap-4 gap-y-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar — supplier info (2/5) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-5">
              {/* Supplier card */}
              <div className="rounded-xl border border-gray-100 bg-white p-5">
                <Skeleton className="mb-3 h-5 w-28" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        <div className="mt-10">
          <Skeleton className="mb-5 h-6 w-36" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                <Skeleton className="aspect-video w-full" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-28" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
