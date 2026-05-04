import { notFound } from 'next/navigation'
import Link from 'next/link'
import ArticleCard from '@/components/ArticleCard'
import { CATEGORY_SLUGS, CATEGORY_META, TOPICS, getArticlesByCategory } from '@/lib/search'

export const revalidate = 3600

type Props = { params: { slug: string }; searchParams: { topic?: string } }

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = CATEGORY_SLUGS[params.slug]
  if (!category) notFound()

  const meta = CATEGORY_META[category]
  const activeTopic = searchParams.topic
  const articles = await getArticlesByCategory(category, activeTopic)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <Link href="/" className="text-sm text-gray-400 hover:text-rose-500 transition-colors">← 홈</Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-3xl">{meta.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{category}</h1>
            <p className="text-sm text-gray-400">{meta.weekRange}</p>
          </div>
        </div>
      </div>

      {/* 주제 필터 */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/category/${params.slug}`}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !activeTopic
              ? 'bg-rose-500 text-white border-rose-500'
              : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300'
          }`}
        >
          전체
        </Link>
        {TOPICS.map((topic) => (
          <Link
            key={topic}
            href={`/category/${params.slug}?topic=${encodeURIComponent(topic)}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeTopic === topic
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300'
            }`}
          >
            {topic}
          </Link>
        ))}
      </div>

      {/* 아티클 목록 */}
      {articles.length > 0 ? (
        <div className="space-y-3">
          {articles.map((a) => (
            <ArticleCard
              key={a.id}
              id={a.id}
              title={a.title}
              summary={a.summary}
              topic={a.topic}
              tags={a.tags}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-12">아직 준비 중인 정보예요.</p>
      )}
    </div>
  )
}
