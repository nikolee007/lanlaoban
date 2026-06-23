'use client'

import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

interface FilterDropdownProps {
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}

export default function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm whitespace-nowrap transition-colors ${
          value
            ? 'border-brand-300 bg-brand-50 font-medium text-brand-600'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        {current?.label || label}
        <FiChevronDown className={`ml-0.5 h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              onMouseDown={() => { onChange(o.value); setOpen(false) }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                value === o.value ? 'bg-brand-50 font-medium text-brand-600' : 'text-gray-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
