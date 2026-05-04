import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import ArticleCard from '@/components/ArticleCard'
import PregnancyCalculator from '@/components/PregnancyCalculator'
import {
  searchArticles, getArticlesByCategory, getPopularTags,
  detectCategory, detectTopic,
  CATEGORY_META, SLUG_BY_CATEGORY,
} from '@/lib/search'

export const revalidate = 3600

export default async function HomePage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() ?? ''

  const matchedCategory = query ? detectCategory(query) : null
  const matchedTopic = query && !matchedCategory ? detectTopic(query) : null

  const [articles, popularTags, categoryArticles] = await Promise.all([
    query ? searchArticles(query) : Promise.resolve([]),
    getPopularTags(15),
    matchedCategory ? getArticlesByCategory(matchedCategory) : Promise.resolve([]),
  ])

  // 토픽 매칭 시 카테고리 무관하게 해당 토픽 글 조회
  const topicArticles = matchedTopic && !matchedCategory
    ? await Promise.all(
        Object.keys(CATEGORY_META).map((cat) =>
          getArticlesByCategory(cat, matchedTopic)
        )
      ).then((results) =>
        results.flat().sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0)).slice(0, 8)
      )
    : []

  return (
    <div className="space-y-10">
      {/* 히어로 */}
      <section className="text-center space-y-4 py-4">
        <h1 className="text-2xl font-bold text-gray-800">믿을 수 있는 육아 정보</h1>
        <p className="text-gray-500 text-sm">임신 초기부터 신생아 3개월까지, AI가 검수한 정보를 제공해요</p>
        <SearchBar defaultValue={query} suggestions={popularTags} />
      </section>

      {/* 검색 결과 */}
      {query && (
        <div className="space-y-8">
          {/* 텍스트 검색 결과 */}
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
                    slug={a.slug ?? undefined}
                    title={a.title}
                    summary={a.summary}
                    category={a.category}
                    topic={a.topic}
                    tags={a.tags}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">직접 일치하는 글이 없어요.</p>
            )}
          </section>

          {/* 카테고리 매칭 섹션 */}
          {matchedCategory && categoryArticles.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                  <span>{CATEGORY_META[matchedCategory].emoji}</span>
                  <span>{matchedCategory} 카테고리 추천 글</span>
                </h2>
                <Link
                  href={`/category/${SLUG_BY_CATEGORY[matchedCategory]}`}
                  className="text-xs text-rose-500 hover:underline"
                >
                  전체 보기 →
                </Link>
              </div>
              <div className="space-y-3">
                {categoryArticles.slice(0, 6).map((a) => (
                  <ArticleCard
                    key={a.id}
                    id={a.id}
                    slug={a.slug ?? undefined}
                    title={a.title}
                    summary={a.summary}
                    category={matchedCategory ?? undefined}
                    topic={a.topic}
                    tags={a.tags}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 토픽 매칭 섹션 */}
          {matchedTopic && topicArticles.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-gray-500 mb-4">
                &ldquo;{matchedTopic}&rdquo; 관련 추천 글
              </h2>
              <div className="space-y-3">
                {topicArticles.map((a) => (
                  <ArticleCard
                    key={a.id}
                    id={a.id}
                    slug={a.slug ?? undefined}
                    title={a.title}
                    summary={a.summary}
                    category={a.category}
                    topic={a.topic}
                    tags={a.tags}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 아무것도 없을 때 */}
          {articles.length === 0 && !matchedCategory && !matchedTopic && (
            <p className="text-center text-gray-400 py-4">다른 키워드로 검색해보세요.</p>
          )}
        </div>
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

          {/* 주차 계산기 */}
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">임신 주차 확인</h2>
            <PregnancyCalculator />
          </section>

          {/* 체크리스트 */}
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">체크리스트</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/checklist">
                <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">📦</div>
                  <div className="font-semibold text-gray-800 text-sm">출산 준비물</div>
                  <div className="text-xs text-gray-400 mt-1">112개 품목</div>
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 border border-blue-100">출산전</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-500 border border-orange-100">조리원</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-500 border border-green-100">출산후</span>
                  </div>
                </div>
              </Link>
              <Link href="/checklist/dad">
                <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">👨</div>
                  <div className="font-semibold text-gray-800 text-sm">출산직후 아빠용</div>
                  <div className="text-xs text-gray-400 mt-1">출생신고·지원금·접종</div>
                  <div className="mt-2.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 border border-blue-100">행정처리 가이드</span>
                  </div>
                </div>
              </Link>
            </div>
          </section>
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
