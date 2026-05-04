'use client'

import { useState } from 'react'

export default function FeedbackButtons() {
  const [voted, setVoted] = useState<'helpful' | 'not' | null>(null)

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
        onClick={() => setVoted('helpful')}
        className="text-sm px-4 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
      >
        👍 도움됐어요
      </button>
      <button
        onClick={() => setVoted('not')}
        className="text-sm px-4 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
      >
        아쉬워요
      </button>
    </div>
  )
}
