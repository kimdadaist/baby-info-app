'use client'

import { useState } from 'react'
import ChecklistClient from '@/components/ChecklistClient'
import DadChecklistClient from '@/components/DadChecklistClient'

type Tab = 'items' | 'dad'

export default function ChecklistPage() {
  const [tab, setTab] = useState<Tab>('items')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">👶 출산 체크리스트</h1>
        <p className="text-sm text-gray-400 mt-1">체크한 항목은 이 기기 브라우저에 자동 저장돼요</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 border-b border-gray-100 pb-0">
        <button
          onClick={() => setTab('items')}
          className={`text-sm px-4 py-2 border-b-2 transition-colors -mb-px ${
            tab === 'items'
              ? 'border-rose-500 text-rose-500 font-semibold'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          출산 준비물
        </button>
        <button
          onClick={() => setTab('dad')}
          className={`text-sm px-4 py-2 border-b-2 transition-colors -mb-px ${
            tab === 'dad'
              ? 'border-rose-500 text-rose-500 font-semibold'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          출산직후 아빠용
        </button>
      </div>

      {tab === 'items' ? <ChecklistClient /> : <DadChecklistClient />}
    </div>
  )
}
