'use client'
import { useCompare } from '../contexts/CompareContext'
import { FiX, FiTrash2, FiInbox, FiStar } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

interface CompareDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CompareDrawer({ open, onClose }: CompareDrawerProps) {
  const { locale } = useLocale()
  const { items, removeItem, clearAll } = useCompare()

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transform rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={locale === 'en' ? 'Product Comparison' : '商品对比'}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle bar */}
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-300" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {locale === 'en' ? 'Product Comparison' : '商品对比'}
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({items.length}/4)
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-red-500"
              >
                <FiTrash2 className="h-3.5 w-3.5" />
                {locale === 'en' ? 'Clear All' : '清空'}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto p-5"
          style={{ maxHeight: 'calc(85vh - 72px)' }}
        >
          {items.length === 0 ? (
            /* ---- Empty state ---- */
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FiInbox className="mb-4 h-16 w-16 text-gray-200" />
              <p className="text-base font-medium text-gray-500">
                {locale === 'en' ? 'No products added for comparison' : '还没有添加对比商品'}
              </p>
              <p className="mt-1 text-sm">
                {locale === 'en' ? 'Select products in search results or product detail pages to compare' : '在搜索结果或商品详情页勾选即可加入对比'}
              </p>
            </div>
          ) : (
            /* ---- Compare table ---- */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="w-24 py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      {locale === 'en' ? 'Item' : '对比项'}
                    </th>
                    {items.map((item) => (
                      <th
                        key={item.id}
                        className="min-w-[160px] px-3 py-3 text-center relative"
                      >
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute -right-1 -top-1 rounded-full p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-red-500"
                          aria-label={`${locale === 'en' ? 'Remove' : '移除'} ${item.name}`}
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* Image */}
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-gray-400">
                      {locale === 'en' ? 'Image' : '图片'}
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="px-3 py-3 text-center">
                        <div className="mx-auto h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                  {/* Name */}
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-gray-400">
                      {locale === 'en' ? 'Name' : '名称'}
                    </td>
                    {items.map((item) => (
                      <td
                        key={item.id}
                        className="px-3 py-3 text-center text-sm font-medium text-gray-900"
                      >
                        {item.name}
                      </td>
                    ))}
                  </tr>
                  {/* Price */}
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-gray-400">
                      {locale === 'en' ? 'Price' : '价格'}
                    </td>
                    {items.map((item) => (
                      <td
                        key={item.id}
                        className="px-3 py-3 text-center text-sm font-semibold text-brand-500"
                      >
                        {item.price}
                      </td>
                    ))}
                  </tr>
                  {/* MOQ */}
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-gray-400">
                      MOQ
                    </td>
                    {items.map((item) => (
                      <td
                        key={item.id}
                        className="px-3 py-3 text-center text-sm text-gray-700"
                      >
                        {item.moq}
                      </td>
                    ))}
                  </tr>
                  {/* 一件代发 */}
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-gray-400">
                      {locale === 'en' ? 'Dropshipping' : '一件代发'}
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="px-3 py-3 text-center">
                        {item.dropship ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                            ✓ {locale === 'en' ? 'Supported' : '支持'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  {/* OEM */}
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-gray-400">
                      OEM
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="px-3 py-3 text-center">
                        {item.oem ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                            ✓ {locale === 'en' ? 'Supported' : '支持'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  {/* Rating */}
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-gray-400">
                      {locale === 'en' ? 'Rating' : '评分'}
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="px-3 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <FiStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-gray-700">
                            {item.rating}
                          </span>
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* Region */}
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-gray-400">
                      {locale === 'en' ? 'Region' : '地区'}
                    </td>
                    {items.map((item) => (
                      <td
                        key={item.id}
                        className="px-3 py-3 text-center text-sm text-gray-700"
                      >
                        {item.location}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
