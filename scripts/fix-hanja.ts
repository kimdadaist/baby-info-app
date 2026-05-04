import { config } from 'dotenv'
if (!process.env.OPENAI_API_KEY) config({ path: '.env.local' })

import { supabaseAdmin } from '../lib/supabase'
import { generateArticle } from '../pipeline/generate'
import { reviewArticle } from '../pipeline/review'

const HANJA_REGEX = /[一-鿿]/
const PASS_SCORE = 85
const MAX_RETRY = 3

function hasHanja(text: string) {
  return HANJA_REGEX.test(text)
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  console.log(`\n🔍 한자 포함 글 탐색 중... ${dryRun ? '[DRY-RUN]' : ''}`)

  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, summary, content, category, week_range, topic')

  if (error) throw new Error(error.message)
  if (!articles?.length) { console.log('글이 없습니다.'); return }

  const targets = articles.filter((a) =>
    hasHanja(a.title) || hasHanja(a.summary) || hasHanja(a.content)
  )

  console.log(`전체 ${articles.length}개 중 한자 포함: ${targets.length}개\n`)
  if (!targets.length) { console.log('✅ 한자 포함 글 없음'); return }

  for (const article of targets) {
    console.log(`  [발견] "${article.title}" (${article.category} / ${article.topic})`)

    if (dryRun) continue

    let fixed = false
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        const generated = await generateArticle(article.category, article.week_range, article.topic)

        if (hasHanja(generated.title + generated.summary + generated.content)) {
          console.log(`    시도 ${attempt}: 한자 재발생, 재시도`)
          continue
        }

        const review = await reviewArticle(generated, article.category, article.topic)
        console.log(`    시도 ${attempt}: ${review.total}점 — ${review.notes}`)

        if (review.total < PASS_SCORE) {
          console.log(`    점수 미달 (${review.total}점), 재시도`)
          continue
        }

        const { error: updateError } = await supabaseAdmin
          .from('articles')
          .update({
            title: generated.title,
            summary: generated.summary,
            content: generated.content,
            tags: generated.tags,
            quality_score: review.total,
            review_notes: review.notes,
          })
          .eq('id', article.id)

        if (updateError) throw new Error(updateError.message)
        console.log(`    ✅ 수정 완료`)
        fixed = true
        break
      } catch (e) {
        console.error(`    오류: ${e}`)
      }
    }

    if (!fixed) console.log(`    ❌ 수정 실패 (${MAX_RETRY}회 시도)`)
    console.log('')
  }

  console.log('✅ 완료')
}

main().catch((e) => {
  console.error('치명적 오류:', e)
  process.exit(1)
})
