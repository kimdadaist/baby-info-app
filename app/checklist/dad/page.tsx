import { Metadata } from 'next'
import Link from 'next/link'
import DadChecklistClient from '@/components/DadChecklistClient'

export const metadata: Metadata = {
  title: '출산직후 아빠용 체크리스트',
  description: '출생신고, 지원금 신청, 예방접종 스케줄 등 출산 직후 아빠가 해야 할 일을 정리했어요.',
  robots: { index: false },
}

export default function DadChecklistPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-sm text-gray-400 hover:text-rose-500 transition-colors">← 홈</Link>
        <span className="text-gray-200">|</span>
        <Link href="/checklist" className="text-sm text-gray-400 hover:text-rose-500 transition-colors">출산 준비물 →</Link>
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-800">👨 출산직후 아빠용 체크리스트</h1>
        <p className="text-sm text-gray-400 mt-1">체크한 항목은 이 기기 브라우저에 자동 저장돼요</p>
      </div>
      <DadChecklistClient />
    </div>
  )
}
