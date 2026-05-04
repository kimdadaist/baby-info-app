import { supabase, supabaseAdmin } from './supabase'

export const CATEGORY_SLUGS: Record<string, string> = {
  'pregnancy-early': '임신초기',
  'pregnancy-mid': '임신중기',
  'pregnancy-late': '임신말기',
  'birth-prep': '출산준비',
  'newborn-early': '신생아초기',
  'newborn-mid': '신생아중기',
  'newborn-late': '신생아말기',
}

export const SLUG_BY_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([slug, cat]) => [cat, slug])
)

export const CATEGORY_META: Record<string, { weekRange: string; emoji: string; type: 'pregnancy' | 'newborn' }> = {
  '임신초기':  { weekRange: '1~12주',      emoji: '🌱', type: 'pregnancy' },
  '임신중기':  { weekRange: '13~27주',     emoji: '🤰', type: 'pregnancy' },
  '임신말기':  { weekRange: '28~40주',     emoji: '🏠', type: 'pregnancy' },
  '출산준비':  { weekRange: 'D-4주~D-Day', emoji: '🎒', type: 'pregnancy' },
  '신생아초기': { weekRange: '0~4주',      emoji: '👶', type: 'newborn' },
  '신생아중기': { weekRange: '1~2개월',    emoji: '🍼', type: 'newborn' },
  '신생아말기': { weekRange: '2~3개월',    emoji: '😊', type: 'newborn' },
}

export const TOPICS = [
  '건강/증상관리', '준비물/용품', '수면/생활패턴', '먹이기/수유',
  '목욕/위생', '발달/성장', '병원/의료', '심리/감정',
]

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// 공백 있는 형태 ↔ 없는 형태 양방향 동의어
const COMPOUND_SYNONYMS: Record<string, string> = {
  '임신초기': '임신 초기', '임신 초기': '임신초기',
  '임신중기': '임신 중기', '임신 중기': '임신중기',
  '임신말기': '임신 말기', '임신 말기': '임신말기',
  '출산준비': '출산 준비', '출산 준비': '출산준비',
  '신생아초기': '신생아 초기', '신생아 초기': '신생아초기',
  '신생아중기': '신생아 중기', '신생아 중기': '신생아중기',
  '신생아말기': '신생아 말기', '신생아 말기': '신생아말기',
  '수면교육': '수면 교육', '수면 교육': '수면교육',
  '모유수유': '모유 수유', '모유 수유': '모유수유',
  '산전검사': '산전 검사', '산전 검사': '산전검사',
  '기형아검사': '기형아 검사', '기형아 검사': '기형아검사',
  '태동느끼기': '태동 느끼기', '태동 느끼기': '태동느끼기',
  '수유자세': '수유 자세', '수유 자세': '수유자세',
  '이유식시작': '이유식 시작', '이유식 시작': '이유식시작',
  '예방접종': '예방 접종', '예방 접종': '예방접종',
}

function getSearchTerms(query: string): string[] {
  const terms = new Set<string>()
  terms.add(query)
  const stripped = query.replace(/\s+/g, '')
  if (stripped !== query) terms.add(stripped)
  if (COMPOUND_SYNONYMS[query]) terms.add(COMPOUND_SYNONYMS[query])
  if (COMPOUND_SYNONYMS[stripped]) terms.add(COMPOUND_SYNONYMS[stripped])
  return Array.from(terms)
}

// 카테고리 감지: 검색어가 카테고리명과 일치하면 카테고리 반환
export function detectCategory(query: string): string | null {
  const norm = query.replace(/\s+/g, '')
  for (const cat of Object.keys(CATEGORY_META)) {
    if (cat.replace(/\s+/g, '') === norm) return cat
  }
  return null
}

// 토픽 감지: 검색어가 토픽명과 일치하거나 포함되면 토픽 반환
export function detectTopic(query: string): string | null {
  const norm = query.replace(/\s+/g, '').toLowerCase()
  for (const topic of TOPICS) {
    const topicNorm = topic.replace(/[/\s]/g, '').toLowerCase()
    if (topicNorm === norm || topicNorm.includes(norm) || norm.includes(topicNorm)) return topic
  }
  return null
}

export async function searchArticles(query: string) {
  const terms = getSearchTerms(query)

  const results = await Promise.all(
    terms.map((term) =>
      supabase
        .from('articles')
        .select('id, slug, title, summary, category, topic, tags, quality_score')
        .eq('is_published', true)
        .or(`title.ilike.%${term}%,summary.ilike.%${term}%,content.ilike.%${term}%`)
        .order('quality_score', { ascending: false })
        .limit(20)
    )
  )

  const seen = new Set<string>()
  const merged: NonNullable<(typeof results)[0]['data']> = []
  for (const { data } of results) {
    for (const row of data ?? []) {
      if (!seen.has(row.id)) {
        seen.add(row.id)
        merged.push(row)
      }
    }
  }
  return merged.sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0)).slice(0, 20)
}

export async function getArticlesByCategory(category: string, topic?: string) {
  const query = supabase
    .from('articles')
    .select('id, slug, title, summary, category, topic, tags, quality_score')
    .eq('is_published', true)
    .order('quality_score', { ascending: false })

  if (category) query.eq('category', category)
  if (topic) query.eq('topic', topic)

  const { data } = await query
  return data ?? []
}

export async function getArticle(idOrSlug: string) {
  const decoded = decodeURIComponent(idOrSlug)

  if (!UUID_REGEX.test(decoded)) {
    const { data } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('slug', decoded)
      .eq('is_published', true)
      .maybeSingle()
    if (data) return data
    return null
  }

  const { data } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('id', decoded)
    .eq('is_published', true)
    .maybeSingle()
  return data
}

export async function getPopularTags(limit = 15): Promise<string[]> {
  const { data } = await supabase
    .from('articles')
    .select('tags, title, summary')
    .eq('is_published', true)

  const count: Record<string, number> = {}
  const articleTexts: string[] = []

  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) {
      count[tag] = (count[tag] ?? 0) + 1
    }
    articleTexts.push(
      (row.title + ' ' + row.summary).toLowerCase().replace(/\s+/g, '')
    )
  }

  const candidates = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)

  // 실제 제목/요약에 등장하는 태그만 추천
  const valid = candidates.filter((tag) => {
    const normalized = tag.toLowerCase().replace(/\s+/g, '')
    return articleTexts.some((text) => text.includes(normalized))
  })

  return valid.slice(0, limit)
}

export async function getRelatedArticles(category: string, currentId: string) {
  const { data } = await supabase
    .from('articles')
    .select('id, slug, title, topic')
    .eq('category', category)
    .eq('is_published', true)
    .neq('id', currentId)
    .limit(4)
  return data ?? []
}
