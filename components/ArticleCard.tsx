import Link from 'next/link'

type Props = {
  id: string
  title: string
  summary: string
  category?: string
  topic: string
  tags?: string[]
}

export default function ArticleCard({ id, title, summary, category, topic }: Props) {
  return (
    <Link href={`/article/${id}`} className="block group">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          {category && (
            <span className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
              {category}
            </span>
          )}
          <span className="text-xs text-gray-400">{topic}</span>
        </div>
        <h3 className="font-semibold text-gray-800 group-hover:text-rose-600 transition-colors leading-snug mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">{summary}</p>
      </div>
    </Link>
  )
}
