export type FeedType = 'left' | 'right' | 'bottle'
export type DiaperType = 'pee' | 'poop' | 'both'
export type EntryType = 'nursing' | 'diaper' | 'sleep'

export interface LogEntry {
  id: string
  type: EntryType
  feedType?: FeedType
  diaperType?: DiaperType
  startTime: number
  endTime?: number
  amount?: number  // ml (분유 기록용)
}

export interface ActiveSession {
  type: 'nursing' | 'sleep'
  feedType?: FeedType
  startTime: number
}

const ENTRIES_KEY = 'baby-tracker-entries-v1'
const SESSION_KEY = 'baby-tracker-session-v1'

export function loadEntries(): LogEntry[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]') }
  catch { return [] }
}

export function saveEntries(entries: LogEntry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function loadSession(): ActiveSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveSession(session: ActiveSession | null): void {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getEntriesForDate(entries: LogEntry[], date: Date): LogEntry[] {
  const start = new Date(date); start.setHours(0, 0, 0, 0)
  const end = new Date(date); end.setHours(23, 59, 59, 999)
  return entries
    .filter(e => e.startTime >= start.getTime() && e.startTime <= end.getTime())
    .sort((a, b) => b.startTime - a.startTime)
}

export function getLastOf(entries: LogEntry[], type: EntryType): LogEntry | undefined {
  return [...entries]
    .filter(e => e.type === type)
    .sort((a, b) => b.startTime - a.startTime)[0]
}

export function getTodayCounts(entries: LogEntry[]) {
  const today = getEntriesForDate(entries, new Date())
  return {
    nursing: today.filter(e => e.type === 'nursing').length,
    diaper: today.filter(e => e.type === 'diaper').length,
    sleep: today.filter(e => e.type === 'sleep').length,
  }
}

export function formatDateLabel(date: Date): string {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return '오늘'
  if (diff === 1) return '어제'
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

export function formatTimer(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000)
  if (totalMin < 1) return '1분 미만'
  if (totalMin < 60) return `${totalMin}분`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function formatSince(ts: number): string {
  const min = Math.floor((Date.now() - ts) / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}시간 ${m}분 전` : `${h}시간 전`
}
