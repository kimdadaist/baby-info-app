import { supabaseAdmin } from '@/lib/supabase'
import { CATEGORY_META } from '@/lib/search'
import RefreshButton from '@/components/RefreshButton'

export const revalidate = 0

async function getStats() {
  const today = new Date().toISOString().slice(0, 10)

  const [
    { count: totalCount },
    { data: byCategory },
    { data: todayLogs },
    { data: recentFailed },
  ] = await Promise.all([
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabaseAdmin.from('articles').select('category').eq('is_published', true),
    supabaseAdmin.from('pipeline_logs').select('*').eq('run_date', today).order('created_at', { ascending: false }),
    supabaseAdmin.from('pipeline_logs').select('*').eq('status', 'failed').order('created_at', { ascending: false }).limit(10),
  ])

  // 카테고리별 집계
  const categoryCount: Record<string, number> = {}
  for (const row of byCategory ?? []) {
    categoryCount[row.category] = (categoryCount[row.category] ?? 0) + 1
  }

  // 오늘 통과율
  const todayPassed = (todayLogs ?? []).filter((l) => l.status === 'passed').length
  const todayTotal = (todayLogs ?? []).length
  const passRate = todayTotal > 0 ? Math.round((todayPassed / todayTotal) * 100) : null

  return { totalCount, categoryCount, todayLogs: todayLogs ?? [], todayPassed, todayTotal, passRate, recentFailed: recentFailed ?? [] }
}

export default async function AdminPage() {
  const { totalCount, categoryCount, todayLogs, todayPassed, todayTotal, passRate, recentFailed } = await getStats()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">🛠 관리자 대시보드</h1>
        <div className="flex items-center gap-3">
          <RefreshButton />
          <a href="/" className="text-xs text-gray-400 hover:text-rose-500 transition-colors">← 사이트로</a>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="전체 콘텐츠" value={`${totalCount ?? 0}개`} emoji="📚" />
        <StatCard label="오늘 생성" value={`${todayPassed}개`} emoji="✅" />
        <StatCard
          label="오늘 통과율"
          value={passRate !== null ? `${passRate}%` : '-'}
          emoji="📊"
          highlight={passRate !== null && passRate < 70}
        />
      </div>

      {/* 카테고리별 현황 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">카테고리별 콘텐츠</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {Object.keys(CATEGORY_META).map((cat, i, arr) => (
            <div key={cat} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="flex items-center gap-2">
                <span>{CATEGORY_META[cat].emoji}</span>
                <span className="text-sm text-gray-700">{cat}</span>
                <span className="text-xs text-gray-400">{CATEGORY_META[cat].weekRange}</span>
              </div>
              <span className="text-sm font-medium text-gray-800">{categoryCount[cat] ?? 0}개</span>
            </div>
          ))}
        </div>
      </section>

      {/* 오늘 파이프라인 로그 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">
          오늘 파이프라인 {todayTotal > 0 ? `(${todayPassed}/${todayTotal} 통과)` : '(실행 기록 없음)'}
        </h2>
        {todayLogs.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {todayLogs.map((log, i) => (
              <div key={log.id} className={`flex items-center justify-between px-4 py-3 text-sm ${i < todayLogs.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-2">
                  <StatusBadge status={log.status} />
                  <span className="text-gray-700">{log.category}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-500">{log.topic}</span>
                </div>
                <span className="text-gray-400 text-xs">
                  {log.quality_score ? `${log.quality_score}점` : log.error_message ?? ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 bg-white rounded-2xl border border-gray-100 px-4 py-6 text-center">
            오늘 파이프라인이 아직 실행되지 않았어요
          </p>
        )}
      </section>

      {/* 최근 실패 목록 */}
      {recentFailed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">최근 실패 목록</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {recentFailed.map((log, i) => (
              <div key={log.id} className={`px-4 py-3 ${i < recentFailed.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{log.category} / {log.topic}</span>
                  <span className="text-xs text-gray-400">{log.run_date}</span>
                </div>
                {log.error_message && (
                  <p className="text-xs text-red-400 mt-1">{log.error_message}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value, emoji, highlight }: { label: string; value: string; emoji: string; highlight?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 ${highlight ? 'border-red-200' : 'border-gray-100'}`}>
      <div className="text-xl mb-1">{emoji}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-red-500' : 'text-gray-800'}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    passed: 'bg-green-100 text-green-600',
    failed: 'bg-red-100 text-red-500',
    skipped: 'bg-gray-100 text-gray-400',
  }
  const labels: Record<string, string> = { passed: '통과', failed: '실패', skipped: '스킵' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? ''}`}>
      {labels[status] ?? status}
    </span>
  )
}
