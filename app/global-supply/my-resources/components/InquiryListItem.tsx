'use client'

import { FiClock, FiTag, FiCheckCircle } from 'react-icons/fi'
import { timeAgo } from '../utils'
import { INQUIRY_STATUS_META } from '../constants'
import type { InquiryRecord } from '../types'

interface InquiryListItemProps {
  inquiry: InquiryRecord
}

export default function InquiryListItem({ inquiry }: InquiryListItemProps) {
  const statusMeta = INQUIRY_STATUS_META[inquiry.status] || INQUIRY_STATUS_META.pending

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-sm">{inquiry.supplierName}</h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
                {statusMeta.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="inline-flex items-center gap-1">
                <FiTag className="w-3 h-3" />
                {inquiry.contactName}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{inquiry.message}</p>
            <p className="text-[11px] text-gray-400 inline-flex items-center gap-1 mt-2">
              <FiClock className="w-3 h-3" />
              {timeAgo(inquiry.createdAt)}
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              {inquiry.status === 'replied' && <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
