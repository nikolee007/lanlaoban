import Skeleton from '../../components/Skeleton'

export default function PhotographyGuideLoading() {
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
          <Skeleton className="h-7 w-44 sm:h-8" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Hero image */}
        <Skeleton className="mb-8 aspect-video w-full rounded-xl" />

        {/* Article content */}
        <div className="space-y-4">
          {/* Section heading */}
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />

          {/* Section heading 2 */}
          <Skeleton className="mt-8 h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />

          {/* Image grid */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <Skeleton className="aspect-[4/3] rounded-xl" />
          </div>

          {/* Tips section */}
          <div className="mt-6 rounded-xl bg-amber-50 p-5">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-11/12" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>

          {/* Pagination / Prev-Next */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </main>
    </div>
  )
}
