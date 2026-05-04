import type { Metadata } from 'next'
import './globals.css'

const BASE_URL = 'https://baby-info-app-taupe.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: '육아정보 — 광고 없는 신뢰할 수 있는 육아 정보',
    template: '%s | 육아정보',
  },
  description: '임신 초기부터 신생아 3개월까지, AI가 검수한 광고 없는 육아 정보. 임신 주차별, 신생아 월령별 맞춤 정보를 제공합니다.',
  keywords: ['육아정보', '임신', '신생아', '육아', '임산부', '태교', '출산준비', '신생아케어'],
  authors: [{ name: '육아정보' }],
  creator: '육아정보',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: BASE_URL,
    siteName: '육아정보',
    title: '육아정보 — 광고 없는 신뢰할 수 있는 육아 정보',
    description: '임신 초기부터 신생아 3개월까지, AI가 검수한 광고 없는 육아 정보',
  },
  twitter: {
    card: 'summary',
    title: '육아정보 — 광고 없는 신뢰할 수 있는 육아 정보',
    description: '임신 초기부터 신생아 3개월까지, AI가 검수한 광고 없는 육아 정보',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: 'vot705SzUcXaOCSbjWzNStzZ4c1wGHa_7cfSQF_T1DM',
    other: {
      'naver-site-verification': '31345335b3d3798643e0690b4c4c7ccd08071807',
    },
  },
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
