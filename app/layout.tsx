import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '육아정보 — 광고 없는 신뢰할 수 있는 육아 정보',
  description: '임신부터 신생아 3개월까지, 광고 없이 AI가 큐레이션한 믿을 수 있는 육아 정보',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-rose-50/30 min-h-screen text-gray-800 antialiased">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-rose-500 text-lg tracking-tight">🍼 육아정보</a>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">광고 없음</span>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  )
}
