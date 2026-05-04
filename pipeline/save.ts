import { supabaseAdmin } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'
import type { GeneratedArticle } from './generate'
import type { ReviewResult } from './review'

async function uniqueSlug(base: string): Promise<string> {
  for (let i = 0; i < 100; i++) {
    const candidate = i === 0 ? base : `${base}-${i}`
    const { data } = await supabaseAdmin.from('articles').select('id').eq('slug', candidate).limit(1)
    if (!data?.length) return candidate
  }
  return `${base}-${Date.now()}`
}

export async function saveArticle(
  article: GeneratedArticle,
  review: ReviewResult,
  category: string,
  weekRange: string | null,
  topic: string
): Promise<string> {
  const slug = await uniqueSlug(slugify(article.title))

  const { data, error } = await supabaseAdmin
    .from('articles')
    .insert({
      category,
      week_range: weekRange,
      topic,
      title: article.title,
      summary: article.summary,
      content: article.content,
      tags: article.tags,
      quality_score: review.total,
      review_notes: review.notes,
      is_published: true,
      slug,
    })
    .select('id')
    .single()

  if (error) throw new Error(`DB 저장 실패: ${error.message}`)
  return data.id
}

export async function savePipelineLog(params: {
  category: string
  topic: string
  attempt: number
  status: 'passed' | 'failed' | 'skipped'
  quality_score?: number
  article_id?: string
  error_message?: string
}) {
  await supabaseAdmin.from('pipeline_logs').insert({
    category: params.category,
    topic: params.topic,
    attempt: params.attempt,
    status: params.status,
    quality_score: params.quality_score ?? null,
    article_id: params.article_id ?? null,
    error_message: params.error_message ?? null,
  })
}
