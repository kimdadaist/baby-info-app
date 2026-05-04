import { MetadataRoute } from 'next'

const BASE_URL = 'https://baby-info-app-taupe.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // 일반 검색엔진 + AI 크롤러 모두 허용
        userAgent: [
          '*',
          'Googlebot',
          'Yeti',          // 네이버
          'GPTBot',        // OpenAI
          'ClaudeBot',     // Anthropic
          'PerplexityBot',
          'anthropic-ai',
          'meta-externalagent', // Meta AI
          'CCBot',
        ],
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
