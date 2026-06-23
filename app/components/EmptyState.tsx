import Link from 'next/link'
import { FiInbox } from 'react-icons/fi'
import type { IconType } from 'react-icons'

export interface EmptyStateProps {
  /** 自定义图标，默认 FiInbox */
  icon?: IconType
  /** 标题，默认 "暂无数据" */
  title?: string
  /** 描述文本 */
  description?: string
  /** 操作按钮 */
  action?: { label: string; href: string }
}

export default function EmptyState({
  icon: Icon = FiInbox,
  title = '暂无数据',
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-center text-sm text-gray-500">
          {description}
        </p>
      )}
      {action && (
        <Link href={action.href} className="btn-primary text-sm">
          {action.label}
        </Link>
      )}
    </div>
  )
}
