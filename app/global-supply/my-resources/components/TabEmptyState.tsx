import Link from 'next/link'
import { FiShoppingBag, FiChevronRight } from 'react-icons/fi'

interface TabEmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel: string
}

export default function TabEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
}: TabEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-9 h-9 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-xs">{description}</p>
      <Link
        href="/global-supply"
        className="inline-flex items-center gap-2 bg-brand-400 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-500 transition-all hover:shadow-lg hover:shadow-brand-400/20 active:scale-[0.98]"
      >
        <FiShoppingBag className="w-4 h-4" />
        {actionLabel}
        <FiChevronRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
