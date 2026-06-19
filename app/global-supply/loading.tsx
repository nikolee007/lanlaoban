import Skeleton from '../components/Skeleton'

export default function GlobalSupplyLoading() {
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
      <div className="border-b border-gray-100 bg-white/80 px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-10 lg:space-y-10">
        {/* SearchSection skeleton — hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400/60 to-brand-600/60 px-8 py-12 sm:px-12 sm:py-16">
          <div className="mx-auto max-w-2xl space-y-5 text-center">
            <Skeleton className="mx-auto h-3 w-40" />
            <Skeleton className="mx-auto h-8 w-72 sm:h-9" />
            <Skeleton className="mx-auto h-4 w-80 sm:h-5" />
            <Skeleton className="mx-auto h-12 w-full max-w-xl rounded-xl" />
            <div className="flex items-center justify-center gap-2.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>

        {/* ScenariosSection — 5 scenario cards */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
                <Skeleton className="mb-3 h-11 w-11 rounded-xl" />
                <Skeleton className="mb-2 h-4 w-36" />
                <Skeleton className="h-3 w-44" />
                <Skeleton className="mt-3 h-3 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* HeroCards — 2 large cards */}
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-6 sm:p-7">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-44" />
              </div>
              <Skeleton className="my-4 h-3 w-56" />
              <div className="space-y-2.5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3.5">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CategoryGrid skeleton */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-6">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* WaterfallProducts skeleton — 8 product cards */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white">
                <Skeleton className="aspect-video w-full rounded-t-xl" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NewSuppliers skeleton — 4 cards */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
                <Skeleton className="mb-4 h-12 w-12 rounded-xl" />
                <Skeleton className="mb-2 h-4 w-36" />
                <Skeleton className="h-3 w-48" />
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ConfidenceBar skeleton */}
        <div className="rounded-xl border border-gray-100 bg-white px-6 py-6 sm:px-8 sm:py-7">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="mx-auto h-8 w-16" />
                <Skeleton className="mx-auto mt-2 h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
