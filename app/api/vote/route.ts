import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { articleId, type } = await req.json()
  if (!articleId || !['helpful', 'not_helpful'].includes(type)) {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
  }

  const field = type === 'helpful' ? 'helpful_count' : 'not_helpful_count'

  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('helpful_count, not_helpful_count')
    .eq('id', articleId)
    .single()

  if (error || !data) return NextResponse.json({ error: '글을 찾을 수 없어요' }, { status: 404 })

  const newCount = (data[field as keyof typeof data] as number) + 1
  await supabaseAdmin.from('articles').update({ [field]: newCount }).eq('id', articleId)

  return NextResponse.json({ ok: true, count: newCount })
}
