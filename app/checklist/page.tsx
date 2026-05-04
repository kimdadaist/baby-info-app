import { Metadata } from 'next'
import ChecklistClient from '@/components/ChecklistClient'

export const metadata: Metadata = {
  title: '출산 준비 체크리스트',
  description: '출산전·조리원·출산후별로 구매 여부를 직접 체크해보세요.',
  robots: { index: false },
}

export default function ChecklistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">👶 출산 준비 체크리스트</h1>
        <p className="text-sm text-gray-400 mt-1">체크한 항목은 이 기기 브라우저에 자동 저장돼요</p>
      </div>
      <ChecklistClient />
    </div>
  )
}
