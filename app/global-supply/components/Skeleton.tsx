'use client'

export default function Skeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-3">
        {/* Nav skeleton */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
            <div className="hidden h-4 w-10 animate-pulse rounded bg-gray-200 sm:block" />
          </div>
        </div>

        {/* Hero skeleton */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gray-100 px-8 py-14">
          <div className="mx-auto mb-4 h-9 w-52 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto mb-6 h-4 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto h-12 max-w-xl animate-pulse rounded-xl bg-white" />
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
            ))}
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mx-auto mb-3 h-5 w-5 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto mb-1 h-8 w-16 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto h-4 w-12 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Categories skeleton */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Scene cards skeleton */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-3 h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
                <div className="mb-1 h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Suppliers skeleton */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
                <div className="mb-2 h-3 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Hot products skeleton */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="aspect-square w-full animate-pulse bg-gray-200" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
