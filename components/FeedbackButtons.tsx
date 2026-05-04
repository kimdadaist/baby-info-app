'use client'

import { useState, useEffect } from 'react'

const STORAGE_PREFIX = 'vote-v1-'

export default function FeedbackButtons({ articleId }: { articleId: string }) {
  const [voted, setVoted] = useState<'helpful' | 'not_helpful' | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + articleId)
      if (saved) setVoted(saved as 'helpful' | 'not_helpful')
    } catch {}
  }, [articleId])

  async function handleVote(type: 'helpful' | 'not_helpful') {
    if (voted || loading) return
    setLoading(true)
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, type }),
      })
      setVoted(type)
      localStorage.setItem(STORAGE_PREFIX + articleId, type)
    } catch {}
    setLoading(false)
  }

  if (voted) {
    return (
      <p className="text-sm text-gray-500 text-center py-2">
        {voted === 'helpful' ? '도움이 됐다니 기뻐요 😊' : '더 좋은 정보로 개선할게요 🙏'}
      </p>
    )
  }

  return (
    <div className="flex items-center gap-3 justify-center">
      <span className="text-sm text-gray-500">이 정보가 도움이 됐나요?</span>
      <button
        onClick={() => handleVote('helpful')}
        disabled={loading}
        className="text-sm px-4 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors disabled:opacity-50"
      >
        👍 도움됐어요
      </button>
      <button
        onClick={() => handleVote('not_helpful')}
        disabled={loading}
        className="text-sm px-4 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-50"
      >
        아쉬워요
      </button>
    </div>
  )
}
