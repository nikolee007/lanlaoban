import Skeleton from '../../../components/Skeleton'

export default function SupplierDetailLoading() {
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

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Breadcrumb */}
        <Skeleton className="mb-6 h-3 w-72" />

        {/* Supplier header card */}
        <Skeleton className="mb-6 h-48 w-full rounded-xl" />

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-100 bg-white p-4">
              <Skeleton className="mx-auto mb-2 h-5 w-5" />
              <Skeleton className="mx-auto mb-1 h-6 w-16" />
              <Skeleton className="mx-auto h-3 w-12" />
            </div>
          ))}
        </div>

        {/* Enterprise details */}
        <Skeleton className="mb-6 h-72 w-full rounded-xl" />

        {/* Products section */}
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
