'use client'

import { useState, useEffect } from 'react'
import { DAD_CHECKLIST } from '@/lib/dad-checklist-data'
import ConfirmDialog from '@/components/ConfirmDialog'

const STORAGE_KEY = 'baby-dad-checklist-v1'

const BADGE_STYLES: Record<string, string> = {
  red:   'bg-red-50 text-red-700 border border-red-200',
  green: 'bg-green-50 text-green-700 border border-green-200',
  blue:  'bg-blue-50 text-blue-700 border border-blue-200',
  gray:  'bg-gray-100 text-gray-600 border border-gray-200',
}

export default function DadChecklistClient() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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

  const allItems = DAD_CHECKLIST.flatMap((s) => s.days.flatMap((d) => d.items))
  const total = allItems.length
  const done = allItems.filter((i) => checked.has(i.id)).length

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

      {/* 섹션 */}
      {DAD_CHECKLIST.map((section) => {
        const sItems = section.days.flatMap((d) => d.items)
        const sDone = sItems.filter((i) => checked.has(i.id)).length
        return (
          <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* 섹션 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/60">
              <span className="text-sm font-semibold text-gray-700">
                {section.emoji} {section.title}
              </span>
              <span className="text-xs text-gray-400">{sDone} / {sItems.length}</span>
            </div>

            {/* 데이 그룹 */}
            {section.days.map((day) => (
              <div key={day.label}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50/40 border-b border-gray-50 tracking-wide">
                  {day.label}
                </div>
                {day.items.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-rose-50/30 ${
                      idx < day.items.length - 1 ? 'border-b border-gray-50' : ''
                    } ${checked.has(item.id) ? 'opacity-50' : ''}`}
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
                        <span className={`text-sm ${checked.has(item.id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {item.text}
                        </span>
                        {item.badge && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLES[item.badge.color]}`}>
                            {item.badge.text}
                          </span>
                        )}
                      </div>
                      {item.sub && (
                        <p className={`text-xs mt-0.5 leading-relaxed ${checked.has(item.id) ? 'text-gray-300' : 'text-gray-400'}`}>
                          {item.sub}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      })}

      {/* 초기화 버튼 */}
      <div className="flex justify-center pb-4">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={done === 0}
          className="text-sm text-gray-400 border border-gray-200 hover:border-red-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition-colors"
        >
          전체 초기화
        </button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="전체 초기화"
        message={`체크한 항목 ${done}개가 모두 삭제돼요.`}
        confirmLabel="전체 초기화할게요"
        onConfirm={() => {
          setChecked(new Set())
          try { localStorage.removeItem(STORAGE_KEY) } catch {}
          setShowConfirm(false)
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
