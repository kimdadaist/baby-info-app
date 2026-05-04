'use client'

import { useState } from 'react'

const CATEGORIES = ['임신초기', '임신중기', '임신말기', '출산준비', '신생아초기', '신생아중기', '신생아말기']
const TOPICS = ['건강/증상관리', '준비물/용품', '수면/생활패턴', '먹이기/수유', '목욕/위생', '발달/성장', '병원/의료', '심리/감정']

type Result = {
  id?: string
  title?: string
  summary?: string
  score?: number
  existingCount?: number
  error?: string
  notes?: string
}

export default function AdminGenerateForm() {
  const [category, setCategory] = useState(CATEGORIES[0])
  const [topic, setTopic] = useState(TOPICS[0])
  const [hint, setHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, topic, hint }),
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setResult({ error: String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-500">수동 콘텐츠 생성</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-300"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">토픽</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-300"
          >
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">힌트 (선택) — 원하는 방향이나 특정 주제를 입력하면 반영돼요</label>
        <input
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="예: 초보 부모를 위한 실전 팁 위주로, 배앓이 원인과 해결법 중심으로..."
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-300 placeholder-gray-300"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-2.5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 rounded-xl transition-colors"
      >
        {loading ? '생성 중… (최대 60초 소요)' : '✨ 콘텐츠 1개 생성'}
      </button>

      {/* 결과 */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
          <span className="w-2 h-2 bg-rose-400 rounded-full inline-block animate-bounce" />
          GPT가 글을 쓰고 검수 중이에요…
        </div>
      )}

      {result && !loading && (
        <div className={`rounded-xl p-4 text-sm space-y-1 ${result.error ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
          {result.error ? (
            <>
              <p className="font-semibold text-red-600">생성 실패</p>
              <p className="text-red-500">{result.error}</p>
              {result.notes && <p className="text-gray-400 text-xs">{result.notes}</p>}
            </>
          ) : (
            <>
              <p className="font-semibold text-green-700">✅ 생성 완료 ({result.score}점)</p>
              <p className="text-gray-700 font-medium">{result.title}</p>
              <p className="text-gray-400 text-xs">{result.summary}</p>
              {(result.existingCount ?? 0) > 0 && (
                <p className="text-xs text-blue-400">기존 {result.existingCount}개 글 참고해 다른 각도로 생성됨</p>
              )}
              <a
                href={`/article/${result.id}`}
                target="_blank"
                className="text-xs text-rose-500 hover:underline block pt-1"
              >
                글 확인하기 →
              </a>
            </>
          )}
        </div>
      )}
    </div>
  )
}
