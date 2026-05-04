import { config } from 'dotenv'
if (!process.env.OPENAI_API_KEY) config({ path: '.env.local' })

import { supabaseAdmin } from '../lib/supabase'
import { slugify } from '../lib/slugify'

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  for (let i = 0; i < 100; i++) {
    const candidate = i === 0 ? base : `${base}-${i}`
    const query = supabaseAdmin.from('articles').select('id').eq('slug', candidate)
    if (excludeId) query.neq('id', excludeId)
    const { data } = await query.limit(1)
    if (!data?.length) return candidate
  }
  return `${base}-${Date.now()}`
}

async function main() {
  console.log('\n🔗 슬러그 생성 시작\n')

  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug')
    .is('slug', null)

  if (error) throw new Error(error.message)
  console.log(`슬러그 없는 아티클: ${articles?.length ?? 0}개\n`)

  for (const article of articles ?? []) {
    const base = slugify(article.title)
    const slug = await uniqueSlug(base, article.id)

    const { error: updateError } = await supabaseAdmin
      .from('articles')
      .update({ slug })
      .eq('id', article.id)

    if (updateError) {
      console.error(`  ❌ ${article.title}: ${updateError.message}`)
    } else {
      console.log(`  ✅ ${article.title}\n     → ${slug}`)
    }
  }

  console.log('\n✅ 완료')
}

main().catch((e) => { console.error(e); process.exit(1) })
