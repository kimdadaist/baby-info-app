'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SOUND_CATEGORIES, startSound, type SoundId, type SoundHandle } from '@/lib/sleep-sounds'

const TIMER_OPTIONS = [
  { label: '타이머 없음', value: 0 },
  { label: '15분', value: 15 },
  { label: '30분', value: 30 },
  { label: '60분', value: 60 },
  { label: '90분', value: 90 },
]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function SleepSoundPlayer() {
  const [selectedSound, setSelectedSound] = useState<SoundId | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  const ctxRef = useRef<AudioContext | null>(null)
  const handleRef = useRef<SoundHandle | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopAll = useCallback((fade = false) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (handleRef.current) {
      if (fade) handleRef.current.fadeOutAndStop(3)
      else handleRef.current.stop()
      handleRef.current = null
    }
    setIsPlaying(false)
    setRemainingSeconds(0)
  }, [])

  useEffect(() => () => stopAll(), [stopAll])

  function getOrCreateContext() {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }

  function handlePlay(id: SoundId) {
    stopAll()
    const ctx = getOrCreateContext()
    const handle = startSound(ctx, id, volume)
    handleRef.current = handle
    setSelectedSound(id)
    setIsPlaying(true)

    if (timerMinutes > 0) startTimer(timerMinutes)
  }

  function handleStop() {
    stopAll(true)
    setSelectedSound(null)
  }

  function handleVolumeChange(v: number) {
    setVolume(v)
    handleRef.current?.setVolume(v)
  }

  function startTimer(minutes: number) {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (minutes <= 0) { setRemainingSeconds(0); return }
    const totalSeconds = Math.round(minutes * 60)
    setRemainingSeconds(totalSeconds)
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          handleRef.current?.fadeOutAndStop(5)
          handleRef.current = null
          setIsPlaying(false)
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function handleTimerChange(minutes: number) {
    setTimerMinutes(minutes)
    if (isPlaying) startTimer(minutes)
  }

  return (
    <div className="space-y-6">
      {/* 소리 카테고리 */}
      {SOUND_CATEGORIES.map((cat) => (
        <section key={cat.label}>
          <h3 className="text-xs font-semibold text-gray-400 mb-2.5 flex items-center gap-1.5">
            <span>{cat.emoji}</span>{cat.label}
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {cat.sounds.map((s) => {
              const active = selectedSound === s.id && isPlaying
              return (
                <button
                  key={s.id}
                  onClick={() => active ? handleStop() : handlePlay(s.id)}
                  className={`rounded-2xl py-3 px-2 text-sm font-medium transition-all border
                    ${active
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-95'
                      : 'bg-white text-gray-700 border-gray-100 hover:border-rose-200 hover:shadow-sm'
                    }`}
                >
                  {active ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="inline-flex gap-0.5 items-end h-4">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="w-0.5 bg-white rounded-full animate-sound-bar"
                            style={{ height: `${40 + i * 20}%`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </span>
                      {s.label}
                    </span>
                  ) : s.label}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {/* 컨트롤 패널 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 sticky bottom-4">
        {/* 재생 상태 */}
        <div className="flex items-center justify-between">
          <div>
            {isPlaying && selectedSound ? (
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {SOUND_CATEGORIES.flatMap(c => c.sounds).find(s => s.id === selectedSound)?.label} 재생 중
                </p>
                {remainingSeconds > 0 && (
                  <p className="text-xs text-rose-500 mt-0.5">⏱ {formatTime(remainingSeconds)} 후 자동 종료</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">소리를 선택해 주세요</p>
            )}
          </div>
          {isPlaying && (
            <button
              onClick={handleStop}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors border border-gray-200 rounded-xl px-3 py-1.5"
            >
              정지
            </button>
          )}
        </div>

        {/* 볼륨 */}
        <div className="flex items-center gap-3">
          <span className="text-base">🔈</span>
          <input
            type="range" min={0} max={1} step={0.05} value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="flex-1 h-1.5 accent-rose-400"
          />
          <span className="text-base">🔊</span>
        </div>

        {/* 타이머 */}
        <div>
          <p className="text-xs text-gray-400 mb-2">자동 종료 타이머</p>
          <div className="flex gap-2 flex-wrap">
            {TIMER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleTimerChange(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-colors
                  ${timerMinutes === opt.value
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-rose-200'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
