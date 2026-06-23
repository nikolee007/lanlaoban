'use client'

import Link from 'next/link'

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  color: string
  href?: string
}

function StatCard({ icon: Icon, label, value, color, href }: StatCardProps) {
  const CardContent = () => (
    <div
      className={`card transition-all hover:shadow-apple-md ${href ? 'cursor-pointer' : ''}`}
    >
      <div className={`mb-3 inline-flex rounded-lg p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-extrabold bg-gradient-to-r from-brand-400 to-purple-500 bg-clip-text text-transparent">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="mt-0.5 text-sm text-gray-500">{label}</div>
    </div>
  )

  if (href) {
    return (
      <Link href={href}>
        <CardContent />
      </Link>
    )
  }
  return <CardContent />
}

interface StatsGridProps {
  cards: StatCardProps[]
}

export default function StatsGrid({ cards }: StatsGridProps) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}
