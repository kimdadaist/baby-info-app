import { config } from 'dotenv'
// 로컬: .env.local / GitHub Actions: 환경변수 직접 주입
if (!process.env.OPENAI_API_KEY) config({ path: '.env.local' })
import { generateArticle } from '../pipeline/generate'
import { reviewArticle } from '../pipeline/review'
import { saveArticle, savePipelineLog } from '../pipeline/save'

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

// 오늘 실행할 카테고리+주제 조합 선택 (랜덤)
function pickTargets(count: number) {
  const pairs: { category: string; topic: string }[] = []
  for (const category of CATEGORIES) {
    for (const topic of TOPICS) {
      pairs.push({ category, topic })
    }
  }
  // 셔플 후 count개 선택
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  return pairs.slice(0, count)
}

async function runOne(category: string, topic: string, dryRun: boolean) {
  const weekRange = WEEK_RANGE[category] ?? null
  let lastError = ''

  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      console.log(`  [생성] ${category} / ${topic} (시도 ${attempt})`)
      const article = await generateArticle(category, weekRange, topic)

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

  const targets = pickTargets(DAILY_TARGET)

  for (const { category, topic } of targets) {
    await runOne(category, topic, dryRun)
    console.log('')
  }

  console.log('✅ 파이프라인 완료')
}

main().catch((e) => {
  console.error('파이프라인 치명적 오류:', e)
  process.exit(1)
})
