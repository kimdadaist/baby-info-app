'use client'

import { useState, useEffect } from 'react'
import { CHECKLIST, CATEGORIES, type TimingFilter } from '@/lib/checklist-data'

const STORAGE_KEY = 'baby-checklist-v1'

const TIMING_COLORS: Record<string, string> = {
  '출산전': 'bg-blue-50 text-blue-600 border-blue-200',
  '조리원': 'bg-orange-50 text-orange-600 border-orange-200',
  '출산후': 'bg-green-50 text-green-600 border-green-200',
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

  const filtered = CHECKLIST.filter((item) => {
    if (filter === '전체') return true
    return item.timing.includes(filter)
  })

  const total = filtered.length
  const done = filtered.filter((i) => checked.has(i.id)).length

  // 카테고리별 그룹핑 (필터 순서 유지)
  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: filtered.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0)

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* 진행 현황 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">전체 진행</span>
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
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['전체', '출산전', '조리원', '출산후'] as TimingFilter[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors ${
              filter === tab
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="grid grid-cols-[80px_1fr_1fr_56px] bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
          <div className="px-3 py-2.5">구분</div>
          <div className="px-3 py-2.5">품목</div>
          <div className="px-3 py-2.5">준비&사용 Tip</div>
          <div className="px-3 py-2.5 text-center">구매여부</div>
        </div>

        {/* 행 */}
        {grouped.map(({ cat, items }) =>
          items.map((item, idx) => (
            <div
              key={item.id}
              className={`grid grid-cols-[80px_1fr_1fr_56px] border-b border-gray-50 last:border-0 hover:bg-rose-50/30 transition-colors ${
                checked.has(item.id) ? 'opacity-50' : ''
              }`}
            >
              {/* 구분 */}
              <div className="px-3 py-2.5 text-xs text-gray-500 flex items-start">
                {idx === 0 ? (
                  <span className="font-medium text-gray-700 leading-relaxed">{cat}</span>
                ) : null}
              </div>

              {/* 품목 */}
              <div className="px-3 py-2.5 flex items-start gap-1.5 flex-wrap">
                <span className={`text-sm ${checked.has(item.id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {item.name}
                </span>
                {item.timing.map((t) => (
                  <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded border ${TIMING_COLORS[t]}`}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Tip */}
              <div className="px-3 py-2.5 text-xs text-gray-400 leading-relaxed">
                {item.tip ?? '—'}
              </div>

              {/* 구매여부 */}
              <div className="px-3 py-2.5 flex items-center justify-center">
                <button
                  onClick={() => toggle(item.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    checked.has(item.id)
                      ? 'bg-rose-500 border-rose-500'
                      : 'border-gray-300 hover:border-rose-400'
                  }`}
                >
                  {checked.has(item.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 리셋 */}
      {done > 0 && (
        <div className="text-center">
          <button
            onClick={() => {
              if (confirm('체크를 모두 초기화할까요?')) {
                setChecked(new Set())
                try { localStorage.removeItem(STORAGE_KEY) } catch {}
              }
            }}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            전체 초기화
          </button>
        </div>
      )}
    </div>
  )
}
