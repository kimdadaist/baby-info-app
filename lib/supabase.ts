import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 웹앱용 (읽기) — Next.js fetch 캐시 비활성화
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
})

// 파이프라인용 (쓰기 — service role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type Article = {
  id: string
  category: string
  week_range: string | null
  topic: string
  title: string
  summary: string
  content: string
  tags: string[]
  quality_score: number | null
  review_notes: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export type PipelineLog = {
  id: string
  run_date: string
  category: string
  topic: string
  attempt: number
  status: 'passed' | 'failed' | 'skipped'
  quality_score: number | null
  article_id: string | null
  error_message: string | null
  created_at: string
}
