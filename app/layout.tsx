import type { Metadata } from 'next'
import './globals.css'

const BASE_URL = 'https://baby-info-app-taupe.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: '육아정보 — 임신부터 신생아까지 믿을 수 있는 육아 정보',
    template: '%s | 육아정보',
  },
  description: '임신 초기부터 신생아 3개월까지, AI가 검수한 신뢰할 수 있는 육아 정보. 임신 주차별, 신생아 월령별 맞춤 정보를 제공합니다.',
  keywords: ['육아정보', '임신', '신생아', '육아', '임산부', '태교', '출산준비', '신생아케어', '임신초기', '임신중기'],
  authors: [{ name: '육아정보' }],
  creator: '육아정보',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: BASE_URL,
    siteName: '육아정보',
    title: '육아정보 — 임신부터 신생아까지 믿을 수 있는 육아 정보',
    description: '임신 초기부터 신생아 3개월까지, AI가 검수한 신뢰할 수 있는 육아 정보',
  },
  twitter: {
    card: 'summary',
    title: '육아정보 — 임신부터 신생아까지 믿을 수 있는 육아 정보',
    description: '임신 초기부터 신생아 3개월까지, AI가 검수한 신뢰할 수 있는 육아 정보',
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
            <div className="flex items-center gap-4">
              <a href="/tracker" className="text-sm text-gray-500 hover:text-rose-500 transition-colors">트래커</a>
              <a href="/sleep" className="text-sm text-gray-500 hover:text-rose-500 transition-colors">백색소음기</a>
              <a href="/checklist" className="text-sm text-gray-500 hover:text-rose-500 transition-colors">준비물</a>
            </div>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-8">
          {children}
        </div>
        <footer className="max-w-3xl mx-auto px-4 py-8 mt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://qr.kakaopay.com/FdzuMdlnA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-500 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-2xl px-4 py-2.5 transition-colors"
            >
              ☕ 커피값 보내기
            </a>
            <a
              href="https://www.instagram.com/dada.kimm"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2.5 transition-colors"
            >
              📩 개선 요청 · 문의
            </a>
          </div>
          <p className="text-center text-xs text-gray-300 mt-4">이 서비스의 정보는 참고용이며 의료 전문가의 조언을 대체하지 않아요</p>
        </footer>
      </body>
    </html>
  )
}
