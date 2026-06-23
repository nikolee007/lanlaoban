function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

export { SkeletonBlock }

export default function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <header className="border-b border-gray-100 bg-white/80">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <SkeletonBlock className="h-5 w-20" /><SkeletonBlock className="h-5 w-48" />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <SkeletonBlock className="mb-4 h-4 w-64" />
        <SkeletonBlock className="mb-6 h-48 w-full rounded-xl" />
        <div className="mb-6 grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (<SkeletonBlock key={i} className="h-24 rounded-lg" />))}
        </div>
        <SkeletonBlock className="mb-4 h-6 w-40" />
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <SkeletonBlock className="aspect-[4/3] w-full" />
              <div className="space-y-2 p-3"><SkeletonBlock className="h-4 w-36" /><SkeletonBlock className="h-4 w-20" /></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
