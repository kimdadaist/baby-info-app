import { config } from 'dotenv'
if (!process.env.OPENAI_API_KEY) config({ path: '.env.local' })

import { generateArticle } from '../pipeline/generate'
import { reviewArticle } from '../pipeline/review'
import { saveArticle, savePipelineLog } from '../pipeline/save'
import { supabaseAdmin } from '../lib/supabase'

const PASS_SCORE = 85
const MAX_RETRY = 2

const WEEK_RANGE: Record<string, string> = {
  '임신초기': '1~12주',
  '임신중기': '13~27주',
  '임신말기': '28~40주',
  '출산준비': 'D-4주~D-Day',
  '신생아초기': '0~4주',
  '신생아중기': '1~2개월',
  '신생아말기': '2~3개월',
}

type Target = { category: string; topic: string; hint: string }

const BRAND_ARTICLES: Target[] = [
  // 출산준비 (5개)
  {
    category: '출산준비', topic: '준비물/용품',
    hint: '유모차 대표 브랜드 가이드: 스토케, 에어버기, 도나도나, 맥클라렌 등 국내외 주요 브랜드 특징·가격대 구간·선택 기준. 신생아 탑승 가능 여부, 무게, 접이식 편의성 위주. 구체적 가격 수치 대신 고가/중가/합리적 구간으로 표현',
  },
  {
    category: '출산준비', topic: '준비물/용품',
    hint: '카시트 브랜드 완전 가이드: 신생아 전용과 영유아 겸용 구분, 사이벡스, 조이, 맥시코시, 컴비 등 브랜드 특징과 안전 기준. ISOFIX 설치 방식, 사용 월령 범위, 선택 포인트 위주',
  },
  {
    category: '출산준비', topic: '준비물/용품',
    hint: '아기 침대·요람 브랜드 가이드: 스토케 슬리피, 노르딕 스타일 브랜드, 국내 브랜드 특징 비교. 매트리스 포함 여부, 사이즈 규격, 바퀴 유무, 높이 조절, 가성비 위주',
  },
  {
    category: '출산준비', topic: '먹이기/수유',
    hint: '유축기 브랜드 완전 비교: 메델라, 스펙트라, 필립스 아벤트 등 주요 브랜드 특징. 전동 단유/양유, 흡입력 조절, 소음 수준, 건강보험 공단 지원 대상 여부, 직장맘 선택 기준 위주',
  },
  {
    category: '출산준비', topic: '준비물/용품',
    hint: '아기띠·힙시트 브랜드 가이드: 에르고베이비, 아이엔젤, 콜로솔, 베이비비욘 등 브랜드 특징. 신생아 인서트 필요 여부, 허리 지지력, 통기성 소재, 사용 가능 월령 범위 위주',
  },

  // 신생아초기 (5개)
  {
    category: '신생아초기', topic: '준비물/용품',
    hint: '신생아 배냇저고리·의류 브랜드 가이드: 베베드피노, 알로앤루, 모이몰른 등 국내 대표 브랜드 특징. 소재(순면/모달/뱀부), 사이즈 기준(kg/신장), 끈 타입 vs 똑딱이 타입, 계절별 추천 위주',
  },
  {
    category: '신생아초기', topic: '먹이기/수유',
    hint: '젖병 브랜드 완전 비교: 닥터브라운, 필립스 아벤트, 누크, 치코 등 국내외 브랜드 특징. 모유실감 젖꼭지, 가스배출 밸브 기능, 소재(유리/PP/트라이탄) 차이, 모유수유 병행 시 선택 기준 위주',
  },
  {
    category: '신생아초기', topic: '목욕/위생',
    hint: '신생아 목욕 용품 브랜드 가이드: 프리미 배스, 스토케 플렉시배스 등 욕조 브랜드와 아기 전용 타월·목욕 가운 브랜드 비교. 미끄럼 방지, 체온 유지, 사용 기간, 사이즈 선택 기준 위주',
  },
  {
    category: '신생아초기', topic: '목욕/위생',
    hint: '신생아 스킨케어 브랜드 비교: 무스텔라, 세타필 베이비, 아토팜, 피죤 베이비 등 특징. 파라벤·향료 무첨가 기준, 아토피·건성 민감 피부 대응 제품, 바디워시·로션·오일 용도별 선택법 위주',
  },
  {
    category: '신생아초기', topic: '준비물/용품',
    hint: '신생아 기저귀 브랜드 완전 비교: 하기스 네이처메이드, 팸퍼스 프리미엄케어, 마미포코, 러블리베이비 등. 흡수층 구조, 피부 친화 성분, 배꼽 홈 여부(신생아 전용), 가성비, 사이즈 구간 위주',
  },

  // 신생아중기 (5개)
  {
    category: '신생아중기', topic: '먹이기/수유',
    hint: '분유 브랜드 완전 가이드: 남양 아이엠마더, 매일 앱솔루트, 일동 후디스, 압타밀, 시밀락 등 국내외 브랜드 특징. DHA·프리바이오틱스 성분 비교, 소화 예민 아기용 특수 분유, 모유 수유 중단 시 전환 팁 위주',
  },
  {
    category: '신생아중기', topic: '발달/성장',
    hint: '아기 바운서·스윙 브랜드 가이드: 4moms 마마루, 치코 폴리, 바운티나 등 브랜드 특징. 전동/수동 차이, 진동 단계, 최대 무게 제한, 안전 인증, 재구매율 높은 이유 위주',
  },
  {
    category: '신생아중기', topic: '발달/성장',
    hint: '아기 모빌·시각 발달 장난감 브랜드: 틴클리, 에이노블, 피셔프라이스 등. 1~2개월 시각 발달 자극 원리(고대비 패턴, 색 인지), 음악·소리 기능, 침대형/바운서 거치 방식, 안전 소재 기준 위주',
  },
  {
    category: '신생아중기', topic: '목욕/위생',
    hint: '아기 물티슈 브랜드 완전 비교: 하기스 네이처메이드, 보솜이, 러블리베이비, 위찬 등. 성분(알코올·향료·형광증백제 무첨가 기준), 두께·수분감, 아토피 피부 적합성, 캡형 vs 일반형 편의성 위주',
  },
  {
    category: '신생아중기', topic: '준비물/용품',
    hint: '아기 보습·스킨케어 브랜드 1~2개월 특화 가이드: 이 시기 피부 특성(태지 사라진 후 건조 심해짐)에 맞는 로션·오일·크림 브랜드. 아토팜, 무스텔라, 드레텍 등 특징과 계절별 사용법 위주',
  },

  // 신생아말기 (5개)
  {
    category: '신생아말기', topic: '먹이기/수유',
    hint: '이유식 브랜드·제품 가이드: 시판 이유식(아이배냇, 베이비본죽, 풀무원 등)과 홈메이드 시 필요한 이유식 메이커·용기 브랜드 비교. 이유식 시작 시기(생후 4~6개월), 처음 식재료 선택 기준, 보관 용기 소재 위주',
  },
  {
    category: '신생아말기', topic: '발달/성장',
    hint: '아기 점퍼루·쏘서 브랜드 가이드: 에이텍스, 피셔프라이스 레인포레스트, 4moms 등 브랜드 특징. 사용 가능 월령(앉기 전 목가눔 기준), 안전 기준, 음악·빛·놀이패널 자극 요소, 조립 편의성 위주',
  },
  {
    category: '신생아말기', topic: '발달/성장',
    hint: '0~3개월 발달 단계별 장난감 브랜드 가이드: 피셔프라이스, 플레이그로, 만요 등. 촉각·청각·시각 자극 종류별 추천 장난감, 소재 안전 기준(BPA 프리), 월령별 발달 목표에 맞는 선택 기준 위주',
  },
  {
    category: '신생아말기', topic: '목욕/위생',
    hint: '아기 구강 케어 브랜드 가이드: 이앓이 시작 전후 관리. 핑거칫솔, 실리콘 치발기, 구강 물티슈 브랜드(피죤, 치코 등) 특징. 구강 관리 시작 시기, 불소 사용 기준, 소재 안전성 위주',
  },
  {
    category: '신생아말기', topic: '준비물/용품',
    hint: '이유식 식기·수저·턱받이 브랜드 가이드: 에지포에버, 누비, 치코, 에디슨 등. BPA 프리 소재, 온도 감지 변색 스푼, 흡착판 그릇, 방수 긴팔 턱받이 선택 기준. 처음 이유식 준비 체크리스트 포함',
  },
]

type ArticleContext = { title: string; summary: string; tags: string[] }

async function fetchExisting(category: string, topic: string): Promise<ArticleContext[]> {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('title, summary, tags')
    .eq('category', category)
    .eq('topic', topic)
    .eq('is_published', true)
  return (data ?? []).map((a) => ({ title: a.title, summary: a.summary, tags: a.tags ?? [] }))
}

async function runOne(target: Target, index: number, total: number) {
  const { category, topic, hint } = target
  const weekRange = WEEK_RANGE[category] ?? null
  console.log(`\n[${index}/${total}] ${category} / ${topic}`)
  console.log(`  힌트: ${hint.slice(0, 60)}...`)

  const existing = await fetchExisting(category, topic)
  let lastError = ''

  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      const article = await generateArticle(category, weekRange, topic, existing, hint)

      const hasHanja = /[一-鿿]/.test(article.title + article.summary + article.content)
      if (hasHanja) {
        lastError = '한자 감지 — 재시도'
        console.log(`  [재시도] ${lastError}`)
        continue
      }

      const review = await reviewArticle(article, category, topic)
      console.log(`  [점수] ${review.total}점 — ${review.notes}`)

      if (review.total >= PASS_SCORE) {
        const id = await saveArticle(article, review, category, weekRange, topic)
        await savePipelineLog({ category, topic, attempt, status: 'passed', quality_score: review.total, article_id: id })
        console.log(`  ✅ 저장 완료: "${article.title}" (ID: ${id})`)
        return true
      }

      lastError = `점수 미달 (${review.total}점)`
      console.log(`  [재시도] ${lastError}`)
    } catch (e) {
      lastError = String(e)
      console.error(`  [오류] ${lastError}`)
    }
  }

  await savePipelineLog({ category, topic, attempt: MAX_RETRY, status: 'failed', error_message: lastError })
  console.log(`  ❌ 실패: ${lastError}`)
  return false
}

async function main() {
  console.log(`\n🛍 브랜드 가이드 아티클 생성 시작`)
  console.log(`총 ${BRAND_ARTICLES.length}개 예정 | 통과 기준: ${PASS_SCORE}점\n`)

  let passed = 0
  let failed = 0

  for (let i = 0; i < BRAND_ARTICLES.length; i++) {
    const ok = await runOne(BRAND_ARTICLES[i], i + 1, BRAND_ARTICLES.length)
    if (ok) passed++; else failed++
  }

  console.log(`\n✅ 완료: ${passed}개 저장 / ❌ ${failed}개 실패`)
}

main().catch((e) => {
  console.error('치명적 오류:', e)
  process.exit(1)
})
