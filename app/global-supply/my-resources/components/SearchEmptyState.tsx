import { FiSearch } from 'react-icons/fi'

interface SearchEmptyStateProps {
  searchQuery: string
  onClearSearch: () => void
  emptyTitle: string
  emptyDesc: string
  clearLabel: string
}

export default function SearchEmptyState({
  searchQuery,
  onClearSearch,
  emptyTitle,
  emptyDesc,
  clearLabel,
}: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FiSearch className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{emptyTitle}</h3>
      <p className="text-sm text-gray-500 mb-4">{emptyDesc}</p>
      <button onClick={onClearSearch} className="text-sm text-brand-500 hover:text-brand-600 font-medium">
        {clearLabel}
      </button>
    </div>
  )
}
