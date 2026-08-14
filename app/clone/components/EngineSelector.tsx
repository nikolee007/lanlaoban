'use client'
import { FiCpu } from 'react-icons/fi'
import type { EngineInfo } from '../lib'

interface Props {
  engines: EngineInfo[]
  engineId: string
  onChange: (id: string) => void
}

export default function EngineSelector({ engines, engineId, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <FiCpu className="text-gray-400" />
      <select value={engineId} onChange={e => onChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6034]/30">
        {engines.filter(e => e.status === 'active').map(e => (
          <option key={e.id} value={e.id}>{e.name}（¥{e.pricePerImage}/张）</option>
        ))}
        {engines.filter(e => e.status === 'coming').map(e => (
          <option key={e.id} value={e.id} disabled>{e.name}（即将上线）</option>
        ))}
      </select>
    </div>
  )
}
