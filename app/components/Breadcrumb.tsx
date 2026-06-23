import Link from 'next/link'
import { FiChevronRight } from 'react-icons/fi'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) return null

  return (
    <nav className={`flex items-center gap-1.5 text-xs text-gray-400 ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && <FiChevronRight className="h-3 w-3 shrink-0 text-gray-300" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-brand-400"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-gray-600' : 'text-gray-400'}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
