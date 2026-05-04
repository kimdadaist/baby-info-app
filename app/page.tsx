import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import ArticleCard from '@/components/ArticleCard'
import { searchArticles, CATEGORY_META, SLUG_BY_CATEGORY } from '@/lib/search'

export const revalidate = 3600

export default async function HomePage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() ?? ''
  const articles = query ? await searchArticles(query) : []

  return (
    <div className="space-y-10">
      {/* 히어로 */}
      <section className="text-center space-y-4 py-4">
        <h1 className="text-2xl font-bold text-gray-800">믿을 수 있는 육아 정보</h1>
        <p className="text-gray-500 text-sm">임신 초기부터 신생아 3개월까지, AI가 검수한 정보만 제공해요</p>
        <SearchBar defaultValue={query} />
      </section>

      {/* 검색 결과 */}
      {query && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-4">
            &ldquo;{query}&rdquo; 검색 결과 {articles.length}건
          </h2>
          {articles.length > 0 ? (
            <div className="space-y-3">
              {articles.map((a) => (
                <ArticleCard
                  key={a.id}
                  id={a.id}
                  title={a.title}
                  summary={a.summary}
                  category={a.category}
                  topic={a.topic}
                  tags={a.tags}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">검색 결과가 없어요. 다른 키워드로 찾아보세요.</p>
          )}
        </section>
      )}

      {/* 카테고리 그리드 */}
      {!query && (
        <>
          <CategorySection
            title="임신 기간별"
            categories={['임신초기', '임신중기', '임신말기', '출산준비']}
          />
          <CategorySection
            title="신생아 월령별"
            categories={['신생아초기', '신생아중기', '신생아말기']}
          />
        </>
      )}
    </div>
  )
}

function CategorySection({ title, categories }: { title: string; categories: string[] }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-700 mb-3">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat]
          const slug = SLUG_BY_CATEGORY[cat]
          return (
            <Link key={cat} href={`/category/${slug}`}>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all cursor-pointer">
                <div className="text-2xl mb-1">{meta.emoji}</div>
                <div className="font-semibold text-gray-800 text-sm">{cat}</div>
                <div className="text-xs text-gray-400 mt-0.5">{meta.weekRange}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
