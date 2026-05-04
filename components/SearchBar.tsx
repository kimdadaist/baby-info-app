'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  defaultValue?: string
  suggestions?: string[]
}

export default function SearchBar({ defaultValue = '', suggestions = [] }: Props) {
  const [query, setQuery] = useState(defaultValue)
  const [focused, setFocused] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setFocused(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setFocused(false)
    router.push(`/?q=${encodeURIComponent(query.trim())}`)
  }

  function handleSuggestion(tag: string) {
    setQuery(tag)
    setFocused(false)
    router.push(`/?q=${encodeURIComponent(tag)}`)
  }

  const showSuggestions = focused && query.length === 0 && suggestions.length > 0

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-white rounded-2xl border-2 border-rose-200 focus-within:border-rose-400 shadow-sm transition-colors px-4 py-3">
          <span className="text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
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

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-lg p-4 z-10">
          <p className="text-xs text-gray-400 mb-2.5">인기 검색어</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag) => (
              <button
                key={tag}
                onMouseDown={(e) => { e.preventDefault(); handleSuggestion(tag) }}
                className="text-xs text-gray-600 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 border border-gray-200 hover:border-rose-200 px-3 py-1.5 rounded-full transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
