import { FiStar } from 'react-icons/fi'

export default function StarDisplay({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <FiStar
          key={i}
          className={`h-3 w-3 ${i < full ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </span>
  )
}
