'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RefreshButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRefresh() {
    setLoading(true)
    router.refresh()
    setTimeout(() => setLoading(false), 800)
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="text-xs text-gray-400 hover:text-rose-500 border border-gray-200 hover:border-rose-300 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
    >
      {loading ? '갱신 중...' : '↻ 새로고침'}
    </button>
  )
}
