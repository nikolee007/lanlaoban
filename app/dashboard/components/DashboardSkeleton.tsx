import NavHeader from '@/app/components/NavHeader'

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-5">
              <div className="mb-3 h-8 w-8 rounded-lg bg-gray-200" />
              <div className="mb-1 h-7 w-16 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
