import Skeleton from '../../components/Skeleton'

export default function AiAssistantLoading() {
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

      <main className="mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-36 sm:h-8" />
          <Skeleton className="h-4 w-56" />
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col rounded-xl border border-gray-100 bg-white">
          {/* Messages */}
          <div className="flex-1 space-y-4 p-4 sm:p-6">
            {/* AI message */}
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="space-y-2 rounded-xl bg-gray-50 p-4">
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            {/* User message */}
            <div className="flex items-start justify-end gap-3">
              <div className="space-y-2 rounded-xl bg-brand-50 p-4">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            </div>
            {/* AI message */}
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="space-y-2 rounded-xl bg-gray-50 p-4">
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-72" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
