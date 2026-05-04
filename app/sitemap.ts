import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { CATEGORY_SLUGS } from '@/lib/search'

const BASE_URL = 'https://baby-info-app-taupe.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, updated_at')
    .eq('is_published', true)

  const articleUrls = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/article/${a.slug ?? a.id}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const categoryUrls = Object.keys(CATEGORY_SLUGS).map((slug) => ({
    url: `${BASE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ...categoryUrls,
    ...articleUrls,
  ]
}
