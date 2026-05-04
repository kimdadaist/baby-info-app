import { supabaseAdmin } from '@/lib/supabase'
import { CATEGORY_META, SLUG_BY_CATEGORY } from '@/lib/search'

const BASE_URL = 'https://baby-info-app-taupe.vercel.app'

export const revalidate = 3600

export async function GET() {
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('title, summary, slug, id, category, topic')
    .eq('is_published', true)
    .order('category')
    .order('quality_score', { ascending: false })

  const byCategory: Record<string, typeof articles> = {}
  for (const a of articles ?? []) {
    if (!byCategory[a.category]) byCategory[a.category] = []
    byCategory[a.category]!.push(a)
  }

  const total = articles?.length ?? 0
  let content = `# 육아정보\n\n`
  content += `> 임신 초기부터 신생아 3개월까지, AI가 검수한 신뢰할 수 있는 육아 정보 서비스 (총 ${total}개 아티클)\n\n`
  content += `## 서비스 소개\n\n`
  content += `- 대상: 임신 중인 예비맘, 신생아(0~3개월) 부모\n`
  content += `- 특징: 모든 콘텐츠는 AI 생성 후 의학적 사실 기반으로 검수\n`
  content += `- 업데이트: 매일 새로운 육아 정보 자동 업데이트\n`
  content += `- URL: ${BASE_URL}\n\n`

  for (const category of Object.keys(CATEGORY_META)) {
    const list = byCategory[category]
    if (!list?.length) continue
    const meta = CATEGORY_META[category]
    content += `## ${category} (${meta.weekRange}) — ${list.length}개\n\n`
    for (const a of list) {
      const url = `${BASE_URL}/article/${a.slug ?? a.id}`
      content += `- [${a.title}](${url}): ${a.summary}\n`
    }
    content += '\n'
  }

  content += `## 링크\n\n`
  content += `- [전체 사이트맵](${BASE_URL}/sitemap.xml)\n`
  content += `- [카테고리별 페이지]\n`
  for (const [cat, slug] of Object.entries(SLUG_BY_CATEGORY)) {
    content += `  - [${cat}](${BASE_URL}/category/${slug})\n`
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
