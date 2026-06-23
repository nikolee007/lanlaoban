export default function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 shrink-0" />
            <div className="flex-1 pt-0.5 space-y-2">
              <div className="h-5 w-48 rounded bg-gray-100" />
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-4 w-40 rounded bg-gray-100" />
              <div className="h-3 w-24 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
