interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
}

export default function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="card !p-4 text-center">
      <Icon className="mx-auto mb-1.5 h-5 w-5 text-brand-400" />
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </div>
  )
}
