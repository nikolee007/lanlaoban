function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

export default function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      <header className="border-b border-gray-100 bg-white/80">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <SkeletonBlock className="h-5 w-20" />
          <SkeletonBlock className="h-5 w-48" />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <SkeletonBlock className="mb-4 h-4 w-64" />
        <SkeletonBlock className="mb-6 aspect-[4/3] w-full sm:aspect-[16/9]" />
        <SkeletonBlock className="mb-2 h-8 w-3/4" />
        <SkeletonBlock className="mb-6 h-5 w-1/2" />
        <SkeletonBlock className="mb-4 h-64 w-full" />
        <SkeletonBlock className="mb-4 h-48 w-full" />
        <SkeletonBlock className="mb-4 h-40 w-full" />
        <SkeletonBlock className="mb-4 h-80 w-full" />
        <SkeletonBlock className="mb-6 h-40 w-full" />
      </div>
      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex gap-2">
            <SkeletonBlock className="h-10 w-20" />
            <SkeletonBlock className="h-10 w-20" />
          </div>
          <SkeletonBlock className="h-10 w-32" />
        </div>
      </footer>
    </main>
  )
}
