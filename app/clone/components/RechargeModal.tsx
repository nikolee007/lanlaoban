'use client'
import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { getAuthHeaders } from '../lib'
import { useToast } from '@/app/contexts/ToastContext'

interface Props {
  open: boolean
  onClose: () => void
  onRecharged: () => void
}

const AMOUNTS = [10, 50, 100, 200]

export default function RechargeModal({ open, onClose, onRecharged }: Props) {
  const { showToast } = useToast()
  const [amount, setAmount] = useState(50)
  const [qr, setQr] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/clone/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json()
      if (!data.success) { showToast(data.error || '下单失败', 'error'); return }
      setQr(data.data.qrcode)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : '下单失败', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">算力充值</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">充值后可用于生成克隆分身和产品宣传图</p>

        {!qr ? (
          <>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(a)}
                  className={`py-2 rounded-xl border-2 text-sm font-medium transition ${amount === a ? 'border-[#FF6034] text-[#FF6034] bg-orange-50' : 'border-gray-200 text-gray-600'}`}>
                  ¥{a}
                </button>
              ))}
            </div>
            <button onClick={submit} disabled={loading}
              className="w-full py-3 rounded-xl bg-[#FF6034] text-white font-medium disabled:opacity-40 hover:opacity-90">
              {loading ? '下单中...' : `充值 ¥${amount}`}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="支付二维码" className="w-56 h-56 object-contain mb-3" />
            <p className="text-sm text-gray-500 mb-4">请用微信/支付宝扫码支付</p>
            <button onClick={() => { setQr(''); onRecharged() }} className="px-6 py-2.5 rounded-xl bg-[#FF6034] text-white text-sm font-medium">我已完成支付</button>
          </div>
        )}
      </div>
    </div>
  )
}
