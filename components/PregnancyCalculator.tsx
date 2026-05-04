'use client'

import { useState, useEffect } from 'react'
import { getWeekInfo, getCategory, getTrimesterLabel } from '@/lib/pregnancy-data'

type Mode = 'due' | 'lmp'
const STORAGE_KEY = 'pregnancy-calculator-v1'

function calcWeekFromDue(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  const daysLeft = Math.round((due.getTime() - today.getTime()) / 86400000)
  return Math.max(1, Math.min(42, 40 - Math.round(daysLeft / 7)))
}

function calcWeekFromLmp(lmpDate: string): number {
  const lmp = new Date(lmpDate)
  const today = new Date()
  const daysPassed = Math.round((today.getTime() - lmp.getTime()) / 86400000)
  return Math.max(1, Math.min(42, Math.floor(daysPassed / 7) + 1))
}

export default function PregnancyCalculator() {
  const [mode, setMode] = useState<Mode>('due')
  const [dateInput, setDateInput] = useState('')
  const [week, setWeek] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { mode: m, date } = JSON.parse(saved)
        setMode(m)
        setDateInput(date)
        setWeek(m === 'due' ? calcWeekFromDue(date) : calcWeekFromLmp(date))
      }
    } catch {}
  }, [])

  function handleChange(value: string) {
    setDateInput(value)
    if (!value) { setWeek(null); return }
    const w = mode === 'due' ? calcWeekFromDue(value) : calcWeekFromLmp(value)
    setWeek(w)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, date: value })) } catch {}
  }

  function handleModeChange(next: Mode) {
    setMode(next)
    setDateInput('')
    setWeek(null)
  }

  if (!mounted) return null

  const info = week ? getWeekInfo(week) : null
  const category = week ? getCategory(week) : null
  const progress = week ? Math.min(100, Math.round((week / 40) * 100)) : 0

  const today = new Date()
  const maxDue = new Date(today); maxDue.setMonth(today.getMonth() + 10)
  const minLmp = new Date(today); minLmp.setFullYear(today.getFullYear() - 1)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">🤰 지금 몇 주차예요?</h2>
          <div className="flex text-xs bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => handleModeChange('due')}
              className={`px-3 py-1 rounded-md transition-colors ${mode === 'due' ? 'bg-white text-gray-700 shadow-sm font-medium' : 'text-gray-400'}`}
            >
              출산 예정일
            </button>
            <button
              onClick={() => handleModeChange('lmp')}
              className={`px-3 py-1 rounded-md transition-colors ${mode === 'lmp' ? 'bg-white text-gray-700 shadow-sm font-medium' : 'text-gray-400'}`}
            >
              마지막 생리일
            </button>
          </div>
        </div>

        <input
          type="date"
          value={dateInput}
          onChange={(e) => handleChange(e.target.value)}
          min={mode === 'lmp' ? minLmp.toISOString().slice(0, 10) : today.toISOString().slice(0, 10)}
          max={mode === 'due' ? maxDue.toISOString().slice(0, 10) : today.toISOString().slice(0, 10)}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-300 text-gray-700"
        />
      </div>

      {/* 결과 */}
      {week && info && (
        <div className="border-t border-gray-50">
          {/* 주차 표시 */}
          <div className="px-5 py-4 bg-rose-50">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-3xl font-bold text-rose-500">{week}주차</span>
                <span className="text-sm text-rose-400 ml-2">{getTrimesterLabel(week)} · {week}/40주</span>
              </div>
              {category && (
                <a
                  href={`/category/${encodeURIComponent(category.slug)}`}
                  className="text-xs font-medium text-rose-500 bg-white border border-rose-200 rounded-full px-3 py-1 hover:bg-rose-500 hover:text-white transition-colors shrink-0"
                >
                  {category.name} 글 보기 →
                </a>
              )}
            </div>
            {/* 진행 바 */}
            <div className="h-2 bg-rose-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 이번 주차 정보 */}
          <div className="px-5 py-4 space-y-3">
            {info.milestone && (
              <div className="flex items-start gap-2">
                <span className="text-base">🎯</span>
                <p className="text-sm font-semibold text-gray-700">{info.milestone}</p>
              </div>
            )}

            {info.checkup && (
              <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5">
                <span className="text-base shrink-0">🏥</span>
                <p className="text-sm text-blue-700">{info.checkup}</p>
              </div>
            )}

            {info.caution && (
              <div className="flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2.5">
                <span className="text-base shrink-0">⚠️</span>
                <p className="text-sm text-amber-700">{info.caution}</p>
              </div>
            )}

            <ul className="space-y-2">
              {info.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-rose-300 mt-0.5 shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
