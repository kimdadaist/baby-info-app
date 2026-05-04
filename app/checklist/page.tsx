import { Metadata } from 'next'
import Link from 'next/link'
import ChecklistClient from '@/components/ChecklistClient'

export const metadata: Metadata = {
  title: '출산 준비물 체크리스트',
  description: '출산전·조리원·출산후별 준비물을 직접 체크해보세요.',
  robots: { index: false },
}

export default function ChecklistPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-sm text-gray-400 hover:text-rose-500 transition-colors">← 홈</Link>
        <span className="text-gray-200">|</span>
        <Link href="/checklist/dad" className="text-sm text-gray-400 hover:text-blue-500 transition-colors">출산직후 아빠용 →</Link>
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-800">📦 출산 준비물 체크리스트</h1>
        <p className="text-sm text-gray-400 mt-1">체크한 항목은 이 기기 브라우저에 자동 저장돼요</p>
      </div>
      <ChecklistClient />
    </div>
  )
}
