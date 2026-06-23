import Link from 'next/link'
import { FiEye } from 'react-icons/fi'
import OptimizedImage from '../../../components/OptimizedImage'
import type { RecentViewItem } from '../types'

interface RecentViewsGridProps {
  items: RecentViewItem[]
}

export default function RecentViewsGrid({ items }: RecentViewsGridProps) {
  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
        <FiEye className="h-5 w-5 text-brand-400" />看了又看
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((rv) => (
          <Link key={rv.id} href={`/global-supply/${rv.id}`}
            className="group rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
              <OptimizedImage src={rv.image} alt={rv.name} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-3.5">
              <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-brand-500">{rv.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brand-600">{rv.price}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
