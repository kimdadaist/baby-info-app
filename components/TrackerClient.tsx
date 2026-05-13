'use client'

import { useState, useEffect } from 'react'
import {
  type LogEntry, type ActiveSession, type FeedType, type DiaperType, type EntryType,
  loadEntries, saveEntries, loadSession, saveSession,
  getEntriesForDate, getLastOf, isSameDay, formatDateLabel,
  formatTimer, formatDuration, formatTime, formatSince,
} from '@/lib/tracker-storage'

type Sheet = 'nursing' | 'diaper' | null

export default function TrackerClient() {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [sheet, setSheet] = useState<Sheet>(null)
  const [editEntry, setEditEntry] = useState<LogEntry | null>(null)
  const [viewDate, setViewDate] = useState(() => new Date())
  const [now, setNow] = useState(Date.now())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setEntries(loadEntries())
    setSession(loadSession())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!session) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [session])

  const isToday = isSameDay(viewDate, new Date())
  const dayEntries = getEntriesForDate(entries, viewDate)
  const lastNursing = getLastOf(entries, 'nursing')
  const lastDiaper = getLastOf(entries, 'diaper')
  const lastSleep = getLastOf(entries, 'sleep')
  const dayCounts = {
    nursing: dayEntries.filter(e => e.type === 'nursing').length,
    diaper: dayEntries.filter(e => e.type === 'diaper').length,
    sleep: dayEntries.filter(e => e.type === 'sleep').length,
  }
  const elapsedMs = session ? Math.max(0, now - session.startTime) : 0

  function finishCurrent(cur: ActiveSession, cur_entries: LogEntry[]): LogEntry[] {
    return [...cur_entries, {
      id: Math.random().toString(36).slice(2),
      type: cur.type,
      feedType: cur.feedType,
      startTime: cur.startTime,
      endTime: Date.now(),
    }]
  }

  // 과거 날짜 보는 중이면 viewDate + 지금 시각으로 기록
  function getRecordingTs(): number {
    if (isToday) return Date.now()
    const now = new Date()
    const d = new Date(viewDate)
    d.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0)
    return d.getTime()
  }

  function startSession(type: 'nursing' | 'sleep', feedType?: FeedType) {
    // 과거 날짜에선 타이머 없이 즉시 기록
    if (!isToday) { logInstant(type, feedType ? { feedType } : undefined); return }
    let next = entries
    if (session) { next = finishCurrent(session, entries); setEntries(next); saveEntries(next) }
    const s: ActiveSession = { type, feedType, startTime: Date.now() }
    setSession(s); saveSession(s); setSheet(null)
  }

  function stopSession() {
    if (!session) return
    const next = finishCurrent(session, entries)
    setEntries(next); saveEntries(next); setSession(null); saveSession(null)
  }

  function switchBreast() {
    if (!session || session.type !== 'nursing') return
    const updated: ActiveSession = { ...session, feedType: session.feedType === 'left' ? 'right' : 'left' }
    setSession(updated); saveSession(updated)
  }

  function logInstant(type: EntryType, sub?: { feedType?: FeedType; diaperType?: DiaperType }) {
    const entry: LogEntry = { id: Math.random().toString(36).slice(2), type, ...sub, startTime: getRecordingTs() }
    const next = [...entries, entry]
    setEntries(next); saveEntries(next); setSheet(null)
  }

  function saveEdit(updated: LogEntry) {
    const next = entries.map(e => e.id === updated.id ? updated : e)
    setEntries(next); saveEntries(next); setEditEntry(null)
  }

  function deleteEntry(id: string) {
    const next = entries.filter(e => e.id !== id)
    setEntries(next); saveEntries(next); setEditEntry(null)
  }

  function prevDay() {
    const d = new Date(viewDate); d.setDate(d.getDate() - 1); setViewDate(d)
  }

  function nextDay() {
    if (isToday) return
    const d = new Date(viewDate); d.setDate(d.getDate() + 1); setViewDate(d)
  }

  function entryLabel(e: LogEntry): string {
    if (e.type === 'nursing') {
      if (e.feedType === 'left') return '🤱 왼쪽 모유'
      if (e.feedType === 'right') return '🤱 오른쪽 모유'
      if (e.feedType === 'bottle') return '🍼 분유'
    }
    if (e.type === 'diaper') {
      if (e.diaperType === 'pee') return '💛 소변'
      if (e.diaperType === 'poop') return '💩 대변'
      if (e.diaperType === 'both') return '💩 소변+대변'
    }
    if (e.type === 'sleep') return '😴 수면'
    return ''
  }

  function entryMeta(e: LogEntry): string {
    const parts: string[] = []
    if (e.endTime && e.type !== 'diaper') parts.push(formatDuration(e.endTime - e.startTime))
    if (e.amount) parts.push(`${e.amount}ml`)
    return parts.join(' · ')
  }

  if (!mounted) return null

  return (
    <div className="space-y-4 pb-8">

      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevDay}
          className="w-10 h-10 flex items-center justify-center rounded-full text-xl text-gray-400 hover:bg-gray-100 transition-colors active:bg-gray-100"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">{formatDateLabel(viewDate)}</p>
          {(dayCounts.nursing + dayCounts.diaper + dayCounts.sleep) > 0 && (
            <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400 mt-0.5">
              {dayCounts.nursing > 0 && <span>🤱 {dayCounts.nursing}회</span>}
              {dayCounts.diaper > 0 && <span>🧷 {dayCounts.diaper}회</span>}
              {dayCounts.sleep > 0 && <span>😴 {dayCounts.sleep}회</span>}
            </div>
          )}
        </div>
        <button
          onClick={nextDay}
          disabled={isToday}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-xl transition-colors
            ${isToday ? 'text-gray-200 cursor-default' : 'text-gray-400 hover:bg-gray-100 active:bg-gray-100'}`}
        >
          ›
        </button>
      </div>

      {/* Active timer card */}
      {session && (
        <div className={`rounded-3xl p-6 ${
          session.type === 'nursing'
            ? 'bg-gradient-to-br from-rose-400 to-rose-500'
            : 'bg-gradient-to-br from-violet-500 to-violet-600'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
              {session.type === 'nursing' ? '수유 중' : '수면 중'}
            </p>
            {session.type === 'nursing' && session.feedType !== 'bottle' && (
              <span className="text-white/80 text-xs bg-white/20 rounded-full px-2.5 py-0.5">
                {session.feedType === 'left' ? '왼쪽' : '오른쪽'}
              </span>
            )}
          </div>
          <div className="text-center py-5">
            <p className="text-6xl font-mono font-bold text-white tracking-tight tabular-nums">
              {formatTimer(elapsedMs)}
            </p>
          </div>
          <div className="flex gap-2">
            {session.type === 'nursing' && session.feedType !== 'bottle' && (
              <button
                onClick={switchBreast}
                className="flex-1 bg-white/20 active:bg-white/30 rounded-2xl py-3 text-sm font-medium text-white transition-colors"
              >
                {session.feedType === 'left' ? '오른쪽 전환' : '왼쪽 전환'}
              </button>
            )}
            <button
              onClick={stopSession}
              className="flex-1 bg-white rounded-2xl py-3 text-sm font-bold transition-colors active:scale-95"
              style={{ color: session.type === 'nursing' ? '#f43f5e' : '#7c3aed' }}
            >
              {session.type === 'nursing' ? '완료' : '일어남'}
            </button>
          </div>
        </div>
      )}

      {/* Past date notice */}
      {!isToday && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
          <span className="text-sm">📝</span>
          <p className="text-xs text-amber-700">
            <span className="font-semibold">{formatDateLabel(viewDate)}</span>에 기록됩니다 · 기록 후 시간 수정 가능
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3">
        <ActionBtn emoji="🤱" label="수유" color="rose"
          active={session?.type === 'nursing'}
          onClick={() => session?.type === 'nursing' ? stopSession() : setSheet('nursing')}
        />
        <ActionBtn emoji="🧷" label="기저귀" color="amber"
          onClick={() => setSheet('diaper')}
        />
        <ActionBtn emoji="😴" label="수면" color="violet"
          active={session?.type === 'sleep'}
          onClick={() => session?.type === 'sleep' ? stopSession() : startSession('sleep')}
        />
      </div>

      {/* Insight panel — today only */}
      {isToday && (
        <InsightPanel
          lastNursing={lastNursing}
          lastDiaper={lastDiaper}
          lastSleep={lastSleep}
          session={session}
          now={now}
        />
      )}

      {/* Day log */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {isToday ? '오늘 기록' : `${formatDateLabel(viewDate)} 기록`}
        </p>
        {dayEntries.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-3">🌱</p>
            <p className="text-sm text-gray-400">{isToday ? '아직 기록이 없어요' : '이날 기록이 없어요'}</p>
            {isToday && <p className="text-xs text-gray-300 mt-1">위 버튼을 눌러 첫 기록을 남겨보세요</p>}
          </div>
        ) : (
          <div className="space-y-1.5">
            {dayEntries.map(entry => (
              <button
                key={entry.id}
                onClick={() => setEditEntry(entry)}
                className="w-full flex items-center bg-white rounded-2xl border border-gray-50 px-4 py-3.5 gap-3 active:bg-gray-50 transition-colors text-left"
              >
                <span className="text-xs text-gray-400 w-16 shrink-0 tabular-nums">
                  {formatTime(entry.startTime)}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-700">
                  {entryLabel(entry)}
                </span>
                {entryMeta(entry) && (
                  <span className="text-xs text-gray-400 shrink-0">{entryMeta(entry)}</span>
                )}
                <span className="text-gray-300 text-sm shrink-0">›</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sub-type sheet */}
      {sheet && (
        <BottomSheet onClose={() => setSheet(null)}>
          {sheet === 'nursing' ? (
            <>
              <p className="text-center text-sm font-semibold text-gray-700 mb-5">어떻게 수유할까요?</p>
              <div className="grid grid-cols-3 gap-3">
                <SheetBtn emoji="🤱" label="왼쪽" sub="모유" color="rose" onClick={() => startSession('nursing', 'left')} />
                <SheetBtn emoji="🤱" label="오른쪽" sub="모유" color="rose" onClick={() => startSession('nursing', 'right')} />
                <SheetBtn emoji="🍼" label="분유" sub="즉시기록" color="rose" onClick={() => logInstant('nursing', { feedType: 'bottle' })} />
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-sm font-semibold text-gray-700 mb-5">어떤 기저귀인가요?</p>
              <div className="grid grid-cols-3 gap-3">
                <SheetBtn emoji="💛" label="소변" sub="쉬" color="amber" onClick={() => logInstant('diaper', { diaperType: 'pee' })} />
                <SheetBtn emoji="💩" label="대변" sub="응가" color="amber" onClick={() => logInstant('diaper', { diaperType: 'poop' })} />
                <SheetBtn emoji="🌊" label="둘다" sub="같이" color="amber" onClick={() => logInstant('diaper', { diaperType: 'both' })} />
              </div>
            </>
          )}
        </BottomSheet>
      )}

      {/* Edit sheet */}
      {editEntry && (
        <EditSheet
          entry={editEntry}
          entryLabel={entryLabel(editEntry)}
          onSave={saveEdit}
          onDelete={deleteEntry}
          onClose={() => setEditEntry(null)}
        />
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionBtn({ emoji, label, color, active, onClick }: {
  emoji: string; label: string; color: 'rose' | 'amber' | 'violet'; active?: boolean; onClick: () => void
}) {
  const styles = {
    rose:   { idle: 'bg-rose-50 border-rose-100 text-rose-500',   act: 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200' },
    amber:  { idle: 'bg-amber-50 border-amber-100 text-amber-500', act: 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200' },
    violet: { idle: 'bg-violet-50 border-violet-100 text-violet-500', act: 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-200' },
  }
  const s = styles[color]
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-3xl py-7 border transition-all active:scale-95
        ${active ? s.act : s.idle}`}
    >
      <span className="text-4xl leading-none">{emoji}</span>
      <span className="text-sm font-semibold">{label}</span>
      {active && <span className="text-[10px] font-medium opacity-75">진행 중</span>}
    </button>
  )
}

function InsightPanel({ lastNursing, lastDiaper, lastSleep, session, now }: {
  lastNursing?: LogEntry
  lastDiaper?: LogEntry
  lastSleep?: LogEntry
  session: ActiveSession | null
  now: number
}) {
  type Row = { emoji: string; main: string; insight?: string; color?: string }
  const rows: Row[] = []

  // 수면 중이면 최우선 표시
  if (session?.type === 'sleep') {
    rows.push({
      emoji: '😴',
      main: `${formatDuration(Math.max(0, now - session.startTime))}째 자는 중`,
      color: 'text-violet-600',
    })
  }

  // 수유: 마지막 수유 후 경과 + 배고픔 예측
  if (lastNursing) {
    const refTs = lastNursing.endTime ?? lastNursing.startTime
    const minAgo = Math.floor((now - refTs) / 60000)
    let insight = ''
    if (minAgo >= 180) insight = '많이 배고파할 수 있어요'
    else if (minAgo >= 120) insight = '슬슬 배고파할 시간이에요'
    rows.push({ emoji: '🤱', main: `${formatSince(refTs)}`, insight })
  }

  // 기저귀: 4시간 이상이면 알림
  if (lastDiaper) {
    const minAgo = Math.floor((now - lastDiaper.startTime) / 60000)
    if (minAgo >= 240) {
      rows.push({ emoji: '🧷', main: formatSince(lastDiaper.startTime), insight: '확인해볼 시간이에요' })
    }
  }

  if (rows.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="text-sm">{row.emoji}</span>
          <span className={`text-sm font-medium ${row.color ?? 'text-gray-700'}`}>{row.main}</span>
          {row.insight && (
            <span className="text-xs text-gray-400">· {row.insight}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function BottomSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end"
      style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl px-6 pt-5 pb-12 max-w-3xl mx-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        {children}
      </div>
    </div>
  )
}

function SheetBtn({ emoji, label, sub, color, onClick }: {
  emoji: string; label: string; sub: string; color: 'rose' | 'amber'; onClick: () => void
}) {
  const style = {
    rose:  'bg-rose-50 border-rose-100 text-rose-600 active:bg-rose-100',
    amber: 'bg-amber-50 border-amber-100 text-amber-700 active:bg-amber-100',
  }
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-6 border transition-all active:scale-95 ${style[color]}`}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-[10px] opacity-60">{sub}</span>
    </button>
  )
}

function EditSheet({ entry, entryLabel, onSave, onDelete, onClose }: {
  entry: LogEntry
  entryLabel: string
  onSave: (e: LogEntry) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const initHHMM = (ts: number) => {
    const d = new Date(ts)
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }
  const initDuration = entry.endTime ? Math.round((entry.endTime - entry.startTime) / 60000) : 0

  const [timeStr, setTimeStr] = useState(initHHMM(entry.startTime))
  const [durationMin, setDurationMin] = useState(initDuration > 0 ? String(initDuration) : '')
  const [amountMl, setAmountMl] = useState(entry.amount ? String(entry.amount) : '')

  const showDuration = entry.type !== 'diaper'
  const showAmount = entry.type === 'nursing' && entry.feedType === 'bottle'

  function handleSave() {
    const [h, m] = timeStr.split(':').map(Number)
    const base = new Date(entry.startTime)
    base.setHours(h, m, 0, 0)
    const startMs = base.getTime()
    const dur = parseInt(durationMin) || 0
    const amt = parseInt(amountMl) || 0

    onSave({
      ...entry,
      startTime: startMs,
      endTime: showDuration && dur > 0 ? startMs + dur * 60000 : undefined,
      amount: showAmount && amt > 0 ? amt : undefined,
    })
  }

  return (
    <BottomSheet onClose={onClose}>
      <p className="text-center text-sm font-semibold text-gray-700 mb-1">기록 수정</p>
      <p className="text-center text-lg mb-6">{entryLabel}</p>

      <div className="space-y-2.5">
        {/* Time */}
        <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3.5">
          <span className="text-sm text-gray-500">시간</span>
          <input
            type="time"
            value={timeStr}
            onChange={e => setTimeStr(e.target.value)}
            className="text-sm font-semibold text-gray-800 bg-transparent text-right outline-none"
          />
        </div>

        {/* Duration */}
        {showDuration && (
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3.5">
            <span className="text-sm text-gray-500">소요 시간</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="999"
                value={durationMin}
                onChange={e => setDurationMin(e.target.value)}
                placeholder="—"
                className="w-14 text-sm font-semibold text-gray-800 bg-transparent text-right outline-none"
              />
              <span className="text-sm text-gray-400">분</span>
            </div>
          </div>
        )}

        {/* Amount */}
        {showAmount && (
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3.5">
            <span className="text-sm text-gray-500">양</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="999"
                value={amountMl}
                onChange={e => setAmountMl(e.target.value)}
                placeholder="—"
                className="w-14 text-sm font-semibold text-gray-800 bg-transparent text-right outline-none"
              />
              <span className="text-sm text-gray-400">ml</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-5">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-100 text-gray-600 rounded-2xl py-3.5 text-sm font-semibold active:bg-gray-200 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-rose-500 text-white rounded-2xl py-3.5 text-sm font-semibold active:bg-rose-600 transition-colors"
        >
          저장
        </button>
      </div>

      <button
        onClick={() => onDelete(entry.id)}
        className="w-full mt-3 text-red-400 text-sm font-medium py-2 active:text-red-600 transition-colors"
      >
        이 기록 삭제
      </button>
    </BottomSheet>
  )
}
