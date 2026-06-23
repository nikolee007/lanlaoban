function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

export { SkeletonBlock }

export default function SupplierListSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <header className="border-b border-gray-100 bg-white/80">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <SkeletonBlock className="h-4 w-48" />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <SkeletonBlock className="mb-6 h-8 w-40" />
        <SkeletonBlock className="mb-4 h-10 w-full max-w-md rounded-lg" />
        <div className="mb-6 flex gap-2">
          <SkeletonBlock className="h-8 w-20 rounded-lg" />
          <SkeletonBlock className="h-8 w-20 rounded-lg" />
          <SkeletonBlock className="h-8 w-20 rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="mb-3 flex items-center gap-3">
                <SkeletonBlock className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              </div>
              <SkeletonBlock className="mb-2 h-3 w-32" />
              <SkeletonBlock className="mb-2 h-3 w-24" />
              <SkeletonBlock className="mb-2 h-3 w-36" />
              <div className="flex gap-1.5">
                <SkeletonBlock className="h-5 w-12 rounded" />
                <SkeletonBlock className="h-5 w-14 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
