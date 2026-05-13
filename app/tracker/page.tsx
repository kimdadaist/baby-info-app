import type { Metadata } from 'next'
import TrackerClient from '@/components/TrackerClient'

export const metadata: Metadata = {
  title: '육아 트래커',
  description: '수유, 수면, 기저귀를 간편하게 기록하세요',
}

export default function TrackerPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">트래커</h1>
        <p className="text-sm text-gray-400 mt-0.5">수유, 수면, 기저귀를 한 번에</p>
      </div>
      <TrackerClient />
    </div>
  )
}
