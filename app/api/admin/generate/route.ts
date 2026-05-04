import { NextRequest, NextResponse } from 'next/server'
import { generateArticle } from '@/pipeline/generate'
import { reviewArticle } from '@/pipeline/review'
import { saveArticle, savePipelineLog } from '@/pipeline/save'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60

const WEEK_RANGE: Record<string, string> = {
  '임신초기': '1~12주', '임신중기': '13~27주', '임신말기': '28~40주',
  '출산준비': 'D-4주~D-Day', '신생아초기': '0~4주', '신생아중기': '1~2개월', '신생아말기': '2~3개월',
}

export async function POST(req: NextRequest) {
  const { category, topic, hint } = await req.json()
  if (!category || !topic) {
    return NextResponse.json({ error: '카테고리와 토픽을 선택해주세요.' }, { status: 400 })
  }

  const weekRange = WEEK_RANGE[category] ?? null

  // 기존 글 조회 (제목 + 요약 + 태그)
  const { data: existing } = await supabaseAdmin
    .from('articles')
    .select('title, summary, tags')
    .eq('category', category)
    .eq('topic', topic)
    .eq('is_published', true)

  const existingArticles = (existing ?? []).map((a: { title: string; summary: string; tags: string[] }) => ({
    title: a.title,
    summary: a.summary,
    tags: a.tags ?? [],
  }))

  try {
    const article = await generateArticle(category, weekRange, topic, existingArticles, hint || undefined)

    const hasHanja = /[一-鿿]/.test(article.title + article.summary + article.content)
    if (hasHanja) {
      return NextResponse.json({ error: '한자 감지 — 다시 시도해주세요.' }, { status: 422 })
    }

    const review = await reviewArticle(article, category, topic)

    if (review.total < 85) {
      return NextResponse.json({
        error: `품질 점수 미달 (${review.total}점 / 기준 85점) — 다시 시도해주세요.`,
        score: review.total,
        notes: review.notes,
      }, { status: 422 })
    }

    const id = await saveArticle(article, review, category, weekRange, topic)
    await savePipelineLog({ category, topic, attempt: 1, status: 'passed', quality_score: review.total, article_id: id })

    return NextResponse.json({
      id,
      title: article.title,
      summary: article.summary,
      score: review.total,
      existingCount: existingArticles.length,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
