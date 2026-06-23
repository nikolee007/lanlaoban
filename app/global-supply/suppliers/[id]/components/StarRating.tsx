import { FiStar } from 'react-icons/fi'

interface StarRatingProps { value: number; size?: 'sm' | 'md' }

export default function StarRating({ value, size = 'sm' }: StarRatingProps) {
  const stars = Math.round(value)
  return (
    <span className={`inline-flex items-center gap-0.5 ${size === 'md' ? 'text-lg' : 'text-sm'}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <FiStar key={i} className={i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
      ))}
    </span>
  )
}
