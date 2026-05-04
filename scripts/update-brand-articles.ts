import { config } from 'dotenv'
if (!process.env.OPENAI_API_KEY) config({ path: '.env.local' })

import { generateArticle } from '../pipeline/generate'
import { reviewArticle } from '../pipeline/review'
import { supabaseAdmin } from '../lib/supabase'

const PASS_SCORE = 85
const MAX_RETRY = 3

const WEEK_RANGE: Record<string, string> = {
  '출산준비': 'D-4주~D-Day',
  '신생아초기': '0~4주',
  '신생아중기': '1~2개월',
  '신생아말기': '2~3개월',
}

type Target = {
  id: string
  category: string
  topic: string
  hint: string
}

// 국내 인지도 낮은 브랜드가 포함된 5개 글만 타겟
const TARGETS: Target[] = [
  {
    id: '0b780a4a-9146-45c2-9a2f-0176ba70b00d',
    category: '출산준비',
    topic: '준비물/용품',
    hint: '유모차 대표 브랜드 가이드: 국내에서 실제 구매 가능하고 인지도 높은 브랜드 위주. 스토케, 에어버기(에어버기는 일본 브랜드로 국내 판매), 도나도나(국내 브랜드), 사이베이비, 아이앤젤 등 쿠팡·네이버쇼핑에서 구매 가능한 브랜드 특징·가격대 구간·선택 기준. 신생아 탑승 가능 여부, 무게, 접이식 편의성 위주. 구체적 가격 수치 대신 고가/중가/합리적 구간으로 표현. 해외 직구만 가능한 브랜드는 언급하지 말 것',
  },
  {
    id: '49e7537c-9beb-4ac0-b552-6b8f0c8a58d1',
    category: '출산준비',
    topic: '준비물/용품',
    hint: '아기 침대·요람 브랜드 가이드: 국내에서 실제 구매 가능하고 인지도 높은 브랜드만. 스토케 슬리피(국내 공식 판매), 콤비(일본 브랜드 국내 유통), 아이베베·꿈비 등 국내 브랜드, 필립스 아벤트 등 국내 유통 브랜드 특징 비교. 매트리스 포함 여부, 사이즈 규격, 바퀴 유무, 높이 조절, 가성비 위주. 국내에서 구매 어려운 노르딕 직수입 브랜드 언급 금지',
  },
  {
    id: 'd1f7fdab-01cb-4326-9571-c96e0a1a86bb',
    category: '출산준비',
    topic: '준비물/용품',
    hint: '아기띠·힙시트 브랜드 가이드: 국내에서 실제 구매 가능하고 인지도 높은 브랜드 위주. 에르고베이비(국내 공식 판매), 아이엔젤(국내 브랜드), 콜로솔(국내 브랜드), 베이비웨이브 등 쿠팡·육아용품점에서 쉽게 구할 수 있는 브랜드 특징. 신생아 인서트 필요 여부, 허리 지지력, 통기성 소재, 사용 가능 월령 범위 위주. 국내 인지도 낮은 해외 브랜드(베이비비욘 등) 제외',
  },
  {
    id: '2d0177f0-519a-4f83-b41e-d1b74cdd8354',
    category: '신생아중기',
    topic: '발달/성장',
    hint: '아기 바운서·스윙 브랜드 가이드: 국내에서 실제 구매 가능하고 인지도 높은 브랜드 위주. 치코(국내 공식 판매), 바운티나(국내 유통), 콤비 바운서, 아이베베, 맘스쿨 등 국내 쇼핑몰에서 쉽게 구할 수 있는 브랜드 특징 비교. 전동/수동 차이, 진동 단계, 최대 무게 제한, 안전 인증 위주. 국내에서 구하기 어려운 고가 수입 브랜드(4moms 등) 제외',
  },
  {
    id: 'f6be9a90-d597-4ebb-b992-47242daeb833',
    category: '신생아말기',
    topic: '발달/성장',
    hint: '0~3개월 발달 단계별 장난감 브랜드 가이드: 국내에서 실제 구매 가능하고 인지도 높은 브랜드 위주. 피셔프라이스(국내 공식 판매), 치코(국내 공식 판매), 브라이트스타트, 에듀케이션 퍼스트(ELC) 등 국내 마트·쇼핑몰에서 구매 가능한 브랜드. 촉각·청각·시각 자극 종류별 추천, 소재 안전 기준(BPA 프리), 월령별 발달 목표에 맞는 선택 기준 위주. 국내 인지도 낮은 해외 브랜드(플레이그로, 만요 등) 제외',
  },
]

async function updateArticle(target: Target, index: number) {
  const { id, category, topic, hint } = target
  const weekRange = WEEK_RANGE[category] ?? null
  console.log(`\n[${index}/${TARGETS.length}] 업데이트: ${category} / ${topic} (ID: ${id.slice(0, 8)}...)`)

  // 현재 글 외 같은 카테고리+토픽 기존 글 컨텍스트 조회
  const { data: existing } = await supabaseAdmin
    .from('articles')
    .select('title, summary, tags')
    .eq('category', category)
    .eq('topic', topic)
    .eq('is_published', true)
    .neq('id', id)

  const existingArticles = (existing ?? []).map((a) => ({
    title: a.title, summary: a.summary, tags: a.tags ?? [],
  }))

  let lastError = ''

  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      const article = await generateArticle(category, weekRange, topic, existingArticles, hint)

      const hasHanja = /[一-鿿]/.test(article.title + article.summary + article.content)
      if (hasHanja) {
        lastError = '한자 감지 — 재시도'
        console.log(`  [재시도] ${lastError}`)
        continue
      }

      const review = await reviewArticle(article, category, topic)
      console.log(`  [점수] ${review.total}점 — ${review.notes}`)

      if (review.total >= PASS_SCORE) {
        // 기존 slug 유지하면서 내용만 업데이트
        const { error } = await supabaseAdmin
          .from('articles')
          .update({
            title: article.title,
            summary: article.summary,
            content: article.content,
            tags: article.tags,
            quality_score: review.total,
            review_notes: review.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)

        if (error) throw new Error(`DB 업데이트 실패: ${error.message}`)
        console.log(`  ✅ 업데이트 완료: "${article.title}"`)
        return true
      }

      lastError = `점수 미달 (${review.total}점)`
      console.log(`  [재시도] ${lastError}`)
    } catch (e) {
      lastError = String(e)
      console.error(`  [오류] ${lastError}`)
    }
  }

  console.log(`  ❌ 업데이트 실패: ${lastError}`)
  return false
}

async function main() {
  console.log(`\n🔄 브랜드 글 업데이트 시작 (${TARGETS.length}개)`)
  console.log(`기존 ID 유지 · slug 유지 · 내용만 교체\n`)

  let ok = 0, fail = 0
  for (let i = 0; i < TARGETS.length; i++) {
    const success = await updateArticle(TARGETS[i], i + 1)
    if (success) ok++; else fail++
  }

  console.log(`\n완료: ✅ ${ok}개 업데이트 / ❌ ${fail}개 실패`)
}

main().catch((e) => { console.error('오류:', e); process.exit(1) })
