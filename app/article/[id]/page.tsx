import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import FeedbackButtons from '@/components/FeedbackButtons'
import ArticleCard from '@/components/ArticleCard'
import { getArticle, getRelatedArticles, SLUG_BY_CATEGORY, CATEGORY_META } from '@/lib/search'

const BASE_URL = 'https://baby-info-app-taupe.vercel.app'

type Props = { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.id)
  if (!article) return {}
  const url = `${BASE_URL}/article/${article.slug ?? article.id}`
  return {
    title: article.title,
    description: article.summary,
    keywords: article.tags,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.summary,
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      tags: article.tags,
    },
    twitter: { card: 'summary', title: article.title, description: article.summary },
  }
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.id)
  if (!article) notFound()

  const related = await getRelatedArticles(article.category, article.id)
  const categorySlug = SLUG_BY_CATEGORY[article.category]
  const meta = CATEGORY_META[article.category]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    keywords: article.tags?.join(', '),
    datePublished: article.created_at,
    dateModified: article.updated_at,
    author: { '@type': 'Organization', name: '육아정보' },
    publisher: { '@type': 'Organization', name: '육아정보' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/article/${article.slug ?? article.id}` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: article.category, item: `${BASE_URL}/category/${categorySlug}` },
        { '@type': 'ListItem', position: 3, name: article.title, item: `${BASE_URL}/article/${article.slug ?? article.id}` },
      ],
    },
  }

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-rose-500 transition-colors">홈</Link>
        <span>›</span>
        <Link href={`/category/${categorySlug}`} className="hover:text-rose-500 transition-colors">
          {article.category}
        </Link>
        <span>›</span>
        <span className="text-gray-500 truncate">{article.topic}</span>
      </nav>

      {/* 아티클 카드 */}
      <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* 헤더 영역 */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 px-6 pt-6 pb-5 border-b border-rose-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{meta?.emoji}</span>
            <span className="text-xs font-medium text-rose-500 bg-white px-2.5 py-0.5 rounded-full border border-rose-200">
              {article.category}
            </span>
            <span className="text-xs text-gray-400 bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
              {article.topic}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 leading-snug mb-4">{article.title}</h1>

          {/* 요약 — 콜아웃 스타일 */}
          <div className="flex gap-3 bg-white rounded-2xl p-4 border border-rose-100 shadow-sm">
            <span className="text-xl shrink-0 mt-0.5">💡</span>
            <p className="text-sm text-gray-700 leading-relaxed">{article.summary}</p>
          </div>
        </div>

        {/* 본문 */}
        <div className="px-6 py-6">
          <div className="article-body">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          {/* 태그 */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
              {article.tags.map((tag: string) => (
                <span key={tag} className="text-xs text-gray-500 bg-gray-100 hover:bg-rose-50 hover:text-rose-500 px-3 py-1 rounded-full transition-colors cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 품질 점수 — 작게 표시 */}
          {article.quality_score && (
            <p className="text-xs text-gray-300 mt-3 text-right">AI 검수 점수 {article.quality_score}점</p>
          )}
        </div>
      </article>

      {/* 피드백 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <FeedbackButtons articleId={article.id} />
      </div>

      {/* 관련 글 */}
      {related.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
            <span>{meta?.emoji}</span> {article.category} 다른 글
          </h2>
          <div className="space-y-2.5">
            {related.map((a) => (
              <ArticleCard key={a.id} id={a.id} slug={a.slug ?? undefined} title={a.title} summary="" topic={a.topic} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
