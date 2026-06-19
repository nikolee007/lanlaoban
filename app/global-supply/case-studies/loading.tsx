import Skeleton from '../../components/Skeleton'

export default function CaseStudiesLoading() {
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

        {/* Header */}
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-36 sm:h-8" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>

        {/* Case study cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              {/* Card image */}
              <Skeleton className="aspect-[16/9] w-full" />
              {/* Card body */}
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                {/* Tags */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                {/* Meta */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
