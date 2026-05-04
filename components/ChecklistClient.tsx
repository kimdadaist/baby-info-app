'use client'

import { useState, useEffect } from 'react'
import { CHECKLIST, CATEGORIES, type TimingFilter } from '@/lib/checklist-data'

const STORAGE_KEY = 'baby-checklist-v1'

const TIMING_COLORS: Record<string, string> = {
  '출산전': 'bg-blue-50 text-blue-600 border-blue-100',
  '조리원': 'bg-orange-50 text-orange-600 border-orange-100',
  '출산후': 'bg-green-50 text-green-600 border-green-100',
}

export default function ChecklistClient() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<TimingFilter>('전체')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setChecked(new Set(JSON.parse(saved)))
    } catch {}
    setMounted(true)
  }, [])

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next))) } catch {}
      return next
    })
  }

  const filtered = CHECKLIST.filter((item) =>
    filter === '전체' ? true : item.timing.includes(filter)
  )

  const total = filtered.length
  const done = filtered.filter((i) => checked.has(i.id)).length

  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: filtered.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0)

  if (!mounted) return null

  return (
    <div className="space-y-5">
      {/* 진행 현황 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">전체 진행</span>
          <span className="text-sm font-bold text-rose-500">{done} / {total}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-400 rounded-full transition-all duration-300"
            style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2">
        {(['전체', '출산전', '조리원', '출산후'] as TimingFilter[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              filter === tab
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 카테고리별 카드 */}
      {grouped.map(({ cat, items }) => {
        const catDone = items.filter((i) => checked.has(i.id)).length
        return (
          <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* 카테고리 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/70 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-700">{cat}</span>
              <span className="text-xs text-gray-400">{catDone}/{items.length}</span>
            </div>

            {/* 항목 목록 */}
            {items.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-rose-50/40 ${
                  idx < items.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                {/* 체크박스 */}
                <div className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                  checked.has(item.id)
                    ? 'bg-rose-500 border-rose-500'
                    : 'border-gray-300'
                }`}>
                  {checked.has(item.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-sm font-medium leading-snug ${
                      checked.has(item.id) ? 'line-through text-gray-300' : 'text-gray-800'
                    }`}>
                      {item.name}
                    </span>
                    {item.timing.map((t) => (
                      <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded border leading-none ${TIMING_COLORS[t]}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {item.tip && (
                    <p className={`text-xs mt-1 leading-relaxed ${
                      checked.has(item.id) ? 'text-gray-300' : 'text-gray-400'
                    }`}>
                      {item.tip}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      })}

      {/* 리셋 */}
      {done > 0 && (
        <div className="text-center pb-4">
          <button
            onClick={() => {
              if (confirm('체크를 모두 초기화할까요?')) {
                setChecked(new Set())
                try { localStorage.removeItem(STORAGE_KEY) } catch {}
              }
            }}
            className="text-xs text-gray-300 hover:text-red-400 transition-colors"
          >
            전체 초기화
          </button>
        </div>
      )}
    </div>
  )
}
