import { config } from 'dotenv'
// 로컬: .env.local / GitHub Actions: 환경변수 직접 주입
if (!process.env.OPENAI_API_KEY) config({ path: '.env.local' })
import { generateArticle } from '../pipeline/generate'
import { reviewArticle } from '../pipeline/review'
import { saveArticle, savePipelineLog } from '../pipeline/save'
import { supabaseAdmin } from '../lib/supabase'

const PASS_SCORE = 85
const MAX_RETRY = 2
const DAILY_TARGET = 10

// 카테고리별 week_range 매핑
const WEEK_RANGE: Record<string, string> = {
  '임신초기': '1~12주',
  '임신중기': '13~27주',
  '임신말기': '28~40주',
  '출산준비': 'D-4주~D-Day',
  '신생아초기': '0~4주',
  '신생아중기': '1~2개월',
  '신생아말기': '2~3개월',
}

const CATEGORIES = Object.keys(WEEK_RANGE)

const TOPICS = [
  '건강/증상관리', '준비물/용품', '수면/생활패턴', '먹이기/수유',
  '목욕/위생', '발달/성장', '병원/의료', '심리/감정',
]

// DB에서 기존 글 현황 조회: { "카테고리::토픽" → 제목 배열 }
async function fetchExistingArticles(): Promise<Map<string, string[]>> {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('category, topic, title')
    .eq('is_published', true)
  const map = new Map<string, string[]>()
  for (const row of data ?? []) {
    const key = `${row.category}::${row.topic}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row.title)
  }
  return map
}

// 오늘 실행할 카테고리+주제 조합 선택
// 기존 글이 없는 조합을 우선 채우고, 나머지는 글이 적은 순으로 선택
function pickTargets(count: number, existing: Map<string, string[]>) {
  const pairs: { category: string; topic: string; existingCount: number }[] = []
  for (const category of CATEGORIES) {
    for (const topic of TOPICS) {
      const key = `${category}::${topic}`
      pairs.push({ category, topic, existingCount: existing.get(key)?.length ?? 0 })
    }
  }
  // 기존 글 수 오름차순 정렬 후, 같은 수끼리는 셔플
  pairs.sort((a, b) => {
    if (a.existingCount !== b.existingCount) return a.existingCount - b.existingCount
    return Math.random() - 0.5
  })
  return pairs.slice(0, count)
}

async function runOne(category: string, topic: string, existingTitles: string[], dryRun: boolean) {
  const weekRange = WEEK_RANGE[category] ?? null
  let lastError = ''

  if (existingTitles.length > 0) {
    console.log(`  [중복확인] 기존 글 ${existingTitles.length}개 감지 — 다른 각도로 생성`)
  }

  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      console.log(`  [생성] ${category} / ${topic} (시도 ${attempt})`)
      const article = await generateArticle(category, weekRange, topic, existingTitles)

      // 한자 포함 여부 검사 (CJK Unified Ideographs: U+4E00~U+9FFF)
      const hasHanja = /[一-鿿]/.test(article.title + article.summary + article.content)
      if (hasHanja) {
        lastError = '한자 혼용 감지 — 재생성'
        console.log(`  [재시도] ${lastError}`)
        continue
      }

      console.log(`  [검수] "${article.title}"`)
      const review = await reviewArticle(article, category, topic)
      console.log(`  [점수] ${review.total}점 — ${review.notes}`)

      if (review.total >= PASS_SCORE) {
        if (!dryRun) {
          const id = await saveArticle(article, review, category, weekRange, topic)
          await savePipelineLog({ category, topic, attempt, status: 'passed', quality_score: review.total, article_id: id })
          console.log(`  [저장] ✅ ID: ${id}`)
        } else {
          console.log(`  [DRY-RUN] 저장 스킵 (${review.total}점 통과)`)
        }
        return
      }

      lastError = `점수 미달 (${review.total}점)`
      console.log(`  [재시도] ${lastError}`)
    } catch (e) {
      lastError = String(e)
      console.error(`  [오류] ${lastError}`)
    }
  }

  if (!dryRun) {
    await savePipelineLog({ category, topic, attempt: MAX_RETRY, status: 'failed', error_message: lastError })
  }
  console.log(`  [실패] ❌ ${category} / ${topic}`)
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  console.log(`\n🍼 육아 정보 파이프라인 시작 ${dryRun ? '[DRY-RUN]' : ''}`)
  console.log(`목표: ${DAILY_TARGET}개 / 통과 기준: ${PASS_SCORE}점\n`)

  console.log('📊 기존 콘텐츠 현황 조회 중...')
  const existing = await fetchExistingArticles()
  const totalExisting = Array.from(existing.values()).reduce((s, v) => s + v.length, 0)
  const covered = existing.size
  console.log(`  총 ${totalExisting}개 글 / ${covered}/56개 조합 커버됨\n`)

  const targets = pickTargets(DAILY_TARGET, existing)

  for (const { category, topic, existingCount } of targets) {
    const key = `${category}::${topic}`
    const existingTitles = existing.get(key) ?? []
    console.log(`▶ ${category} / ${topic} (기존 ${existingCount}개)`)
    await runOne(category, topic, existingTitles, dryRun)
    console.log('')
  }

  console.log('✅ 파이프라인 완료')
}

main().catch((e) => {
  console.error('파이프라인 치명적 오류:', e)
  process.exit(1)
})
