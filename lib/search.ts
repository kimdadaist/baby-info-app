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

export async function searchArticles(query: string) {
  const { data } = await supabase
    .from('articles')
    .select('id, slug, title, summary, category, topic, tags, quality_score')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
    .order('quality_score', { ascending: false })
    .limit(20)
  return data ?? []
}

export async function getArticlesByCategory(category: string, topic?: string) {
  const query = supabase
    .from('articles')
    .select('id, slug, title, summary, topic, tags, quality_score')
    .eq('category', category)
    .eq('is_published', true)
    .order('quality_score', { ascending: false })

  if (topic) query.eq('topic', topic)

  const { data } = await query
  return data ?? []
}

export async function getArticle(idOrSlug: string) {
  if (!UUID_REGEX.test(idOrSlug)) {
    const { data } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('slug', idOrSlug)
      .eq('is_published', true)
      .maybeSingle()
    if (data) return data
    return null
  }

  const { data } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('id', idOrSlug)
    .eq('is_published', true)
    .maybeSingle()
  return data
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
