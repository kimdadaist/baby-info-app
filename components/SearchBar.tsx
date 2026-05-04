'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 bg-white rounded-2xl border-2 border-rose-200 focus-within:border-rose-400 shadow-sm transition-colors px-4 py-3">
        <span className="text-gray-400 text-lg">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="궁금한 육아 정보를 검색해보세요"
          className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-base bg-transparent"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); router.push('/') }}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >✕</button>
        )}
        <button
          type="submit"
          className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-colors"
        >
          검색
        </button>
      </div>
    </form>
  )
}
