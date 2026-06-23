import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 mb-6" aria-label="分页导航">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">上一页</span>
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm font-medium rounded-xl transition-all ${
              page === currentPage
                ? 'bg-brand-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <span className="hidden sm:inline text-xs text-gray-400 mx-1">
        第{currentPage}页/共{totalPages}页
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <span className="hidden sm:inline">下一页</span>
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
