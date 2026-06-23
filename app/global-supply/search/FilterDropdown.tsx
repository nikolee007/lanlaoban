'use client'

import { useState } from 'react'
import { FiCheck, FiChevronDown } from 'react-icons/fi'

export default function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border shadow-sm transition-all whitespace-nowrap ${
          value
            ? 'border-brand-300 bg-brand-50 text-brand-600 font-medium'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        {value && <FiCheck className="w-3.5 h-3.5" />}
        {current?.label || label}
        <FiChevronDown
          className={`w-3.5 h-3.5 ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[140px] py-1">
          {options.map((o) => (
            <button
              key={o.value}
              onMouseDown={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                value === o.value ? 'text-brand-600 bg-brand-50 font-medium' : 'text-gray-700'
              }`}
            >
              {o.value && value === o.value && <FiCheck className="w-3 h-3 inline mr-1.5" />}
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
