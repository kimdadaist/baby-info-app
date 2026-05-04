export type SoundId =
  | 'white' | 'pink' | 'brown' | 'lofi'
  | 'fan' | 'aircon'
  | 'rain' | 'waves' | 'stream' | 'fire'
  | 'shush' | 'heartbeat'
  | 'brahms' | 'schubert'

export type SoundCategory = {
  label: string
  emoji: string
  sounds: { id: SoundId; label: string }[]
}

export const SOUND_CATEGORIES: SoundCategory[] = [
  {
    label: '백색소음',
    emoji: '〰️',
    sounds: [
      { id: 'white', label: '백색소음' },
      { id: 'pink', label: '핑크소음' },
      { id: 'brown', label: '갈색소음' },
      { id: 'lofi', label: '저주파소음' },
    ],
  },
  {
    label: '팬소리',
    emoji: '🌀',
    sounds: [
      { id: 'fan', label: '선풍기' },
      { id: 'aircon', label: '에어컨' },
    ],
  },
  {
    label: '자연소리',
    emoji: '🌿',
    sounds: [
      { id: 'rain', label: '빗소리' },
      { id: 'waves', label: '파도소리' },
      { id: 'stream', label: '시냇물' },
      { id: 'fire', label: '모닥불' },
    ],
  },
  {
    label: '쉬소리 & 심장박동',
    emoji: '💓',
    sounds: [
      { id: 'shush', label: '쉬소리' },
      { id: 'heartbeat', label: '심장박동' },
    ],
  },
  {
    label: '자장가',
    emoji: '🎵',
    sounds: [
      { id: 'brahms', label: '브람스 자장가' },
      { id: 'schubert', label: '슈베르트 자장가' },
    ],
  },
]

// ── 노이즈 버퍼 생성 헬퍼 ───────────────────────────────────────

function makeWhiteBuffer(ctx: AudioContext, seconds = 2) {
  const size = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(1, size, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < size; i++) d[i] = Math.random() * 2 - 1
  return buf
}

function makePinkBuffer(ctx: AudioContext, seconds = 2) {
  const size = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(1, size, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < size; i++) {
    const w = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.96900 * b2 + w * 0.1538520
    b3 = 0.86650 * b3 + w * 0.3104856
    b4 = 0.55000 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.0168980
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) / 7
    b6 = w * 0.115926
  }
  return buf
}

function makeBrownBuffer(ctx: AudioContext, seconds = 2) {
  const size = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(1, size, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < size; i++) {
    const w = Math.random() * 2 - 1
    d[i] = (last + 0.02 * w) / 1.02
    last = d[i]
    d[i] *= 3.5
  }
  return buf
}

function loopedSource(ctx: AudioContext, buf: AudioBuffer) {
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  return src
}

// ── 음표 시퀀스 재생 ─────────────────────────────────────────────

type Note = { freq: number; dur: number } // freq=0 은 쉼표

function playMelody(ctx: AudioContext, gainNode: GainNode, notes: Note[], bpm = 80): () => void {
  const beatDur = 60 / bpm
  let stopped = false
  let timeouts: ReturnType<typeof setTimeout>[] = []

  function schedule(startTime: number) {
    if (stopped) return
    let t = startTime
    notes.forEach((note) => {
      const duration = note.dur * beatDur
      if (note.freq > 0) {
        const osc = ctx.createOscillator()
        const env = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = note.freq
        env.gain.setValueAtTime(0, t)
        env.gain.linearRampToValueAtTime(0.4, t + 0.02)
        env.gain.linearRampToValueAtTime(0.25, t + duration * 0.7)
        env.gain.linearRampToValueAtTime(0, t + duration)
        osc.connect(env)
        env.connect(gainNode)
        osc.start(t)
        osc.stop(t + duration)
      }
      t += duration
    })
    const loopDur = notes.reduce((s, n) => s + n.dur * beatDur, 0)
    const id = setTimeout(() => schedule(startTime + loopDur), (loopDur - 0.1) * 1000)
    timeouts.push(id)
  }

  schedule(ctx.currentTime)
  return () => {
    stopped = true
    timeouts.forEach(clearTimeout)
  }
}

// 브람스 자장가 (Lullaby Op. 49 No. 4)
const BRAHMS: Note[] = [
  { freq: 392, dur: 0.75 }, { freq: 392, dur: 0.25 }, { freq: 440, dur: 0.5 }, { freq: 392, dur: 0.5 },
  { freq: 523, dur: 1 }, { freq: 494, dur: 1 },
  { freq: 392, dur: 0.75 }, { freq: 392, dur: 0.25 }, { freq: 440, dur: 0.5 }, { freq: 392, dur: 0.5 },
  { freq: 587, dur: 1 }, { freq: 523, dur: 1 },
  { freq: 392, dur: 0.75 }, { freq: 392, dur: 0.25 }, { freq: 784, dur: 0.5 }, { freq: 659, dur: 0.5 },
  { freq: 523, dur: 0.75 }, { freq: 494, dur: 0.25 }, { freq: 440, dur: 0.5 }, { freq: 698, dur: 0.5 },
  { freq: 587, dur: 0.75 }, { freq: 587, dur: 0.25 }, { freq: 659, dur: 0.5 }, { freq: 523, dur: 0.5 },
  { freq: 494, dur: 1 }, { freq: 392, dur: 1 },
]

// 슈베르트 자장가 (Wiegenlied D. 498)
const SCHUBERT: Note[] = [
  { freq: 0, dur: 0.5 }, { freq: 392, dur: 0.5 },
  { freq: 523, dur: 0.75 }, { freq: 523, dur: 0.25 }, { freq: 494, dur: 0.5 }, { freq: 440, dur: 0.5 },
  { freq: 392, dur: 1 }, { freq: 0, dur: 0.5 }, { freq: 523, dur: 0.5 },
  { freq: 659, dur: 0.75 }, { freq: 659, dur: 0.25 }, { freq: 587, dur: 0.5 }, { freq: 523, dur: 0.5 },
  { freq: 440, dur: 1.5 }, { freq: 0, dur: 0.5 },
  { freq: 440, dur: 0.5 }, { freq: 440, dur: 0.5 }, { freq: 587, dur: 0.5 }, { freq: 494, dur: 0.5 },
  { freq: 523, dur: 1.5 }, { freq: 0, dur: 0.5 },
]

// ── 메인 사운드 스타터 ────────────────────────────────────────────

export interface SoundHandle {
  stop: () => void
  setVolume: (v: number) => void  // 0~1
  fadeOutAndStop: (seconds: number) => void
}

export function startSound(ctx: AudioContext, id: SoundId, volume: number): SoundHandle {
  const master = ctx.createGain()
  master.gain.value = volume
  master.connect(ctx.destination)

  let stopMelody: (() => void) | null = null
  const sources: AudioBufferSourceNode[] = []
  const oscillators: OscillatorNode[] = []

  function addSource(src: AudioBufferSourceNode) {
    src.connect(master)
    src.start()
    sources.push(src)
  }

  switch (id) {
    case 'white': {
      addSource(loopedSource(ctx, makeWhiteBuffer(ctx, 3)))
      break
    }
    case 'pink': {
      addSource(loopedSource(ctx, makePinkBuffer(ctx, 3)))
      break
    }
    case 'brown': {
      addSource(loopedSource(ctx, makeBrownBuffer(ctx, 3)))
      break
    }
    case 'lofi': {
      const src = loopedSource(ctx, makeBrownBuffer(ctx, 3))
      const f = ctx.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = 180
      f.Q.value = 0.5
      src.connect(f)
      f.connect(master)
      src.start()
      sources.push(src)
      break
    }
    case 'fan': {
      const src = loopedSource(ctx, makeWhiteBuffer(ctx, 3))
      const f = ctx.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = 300
      f.Q.value = 0.3
      src.connect(f)
      f.connect(master)
      src.start()
      sources.push(src)
      break
    }
    case 'aircon': {
      const src = loopedSource(ctx, makePinkBuffer(ctx, 3))
      const f = ctx.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = 600
      f.Q.value = 0.8
      src.connect(f)
      f.connect(master)
      src.start()
      sources.push(src)
      break
    }
    case 'rain': {
      // 빗소리: 고역 화이트노이즈 + 저역 레이어
      const hi = loopedSource(ctx, makeWhiteBuffer(ctx, 2))
      const lo = loopedSource(ctx, makePinkBuffer(ctx, 2))
      const fHi = ctx.createBiquadFilter(); fHi.type = 'highpass'; fHi.frequency.value = 2000
      const fLo = ctx.createBiquadFilter(); fLo.type = 'bandpass'; fLo.frequency.value = 400; fLo.Q.value = 0.5
      const gHi = ctx.createGain(); gHi.gain.value = 0.6
      const gLo = ctx.createGain(); gLo.gain.value = 0.4
      hi.connect(fHi); fHi.connect(gHi); gHi.connect(master)
      lo.connect(fLo); fLo.connect(gLo); gLo.connect(master)
      hi.start(); lo.start()
      sources.push(hi, lo)
      break
    }
    case 'waves': {
      // 파도: 브라운노이즈 + 저속 LFO 진폭 변조
      const src = loopedSource(ctx, makeBrownBuffer(ctx, 4))
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800
      const lfoGain = ctx.createGain()
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.15  // 파도 주기 ~6.7초
      const lfoDepth = ctx.createGain(); lfoDepth.gain.value = 0.4
      const dcOffset = ctx.createGain(); dcOffset.gain.value = 0.6
      // lfoGain = 0.6 + 0.4*sin(...) → 0.2~1.0
      lfo.connect(lfoDepth); lfoDepth.connect(lfoGain.gain)
      src.connect(f); f.connect(lfoGain); lfoGain.connect(master)
      lfo.start(); src.start()
      oscillators.push(lfo)
      sources.push(src)
      break
    }
    case 'stream': {
      const src = loopedSource(ctx, makeWhiteBuffer(ctx, 2))
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 0.4
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.3
      const lfoDepth = ctx.createGain(); lfoDepth.gain.value = 0.15
      const baseGain = ctx.createGain(); baseGain.gain.value = 0.85
      lfo.connect(lfoDepth); lfoDepth.connect(baseGain.gain)
      src.connect(f); f.connect(baseGain); baseGain.connect(master)
      lfo.start(); src.start()
      oscillators.push(lfo)
      sources.push(src)
      break
    }
    case 'fire': {
      // 모닥불: 갈색노이즈 + 불규칙 gain 떨림
      const src = loopedSource(ctx, makeBrownBuffer(ctx, 3))
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600
      const crackle = ctx.createGain(); crackle.gain.value = 0.7
      // 불규칙 LFO (두 개 합산)
      const lfo1 = ctx.createOscillator(); lfo1.frequency.value = 1.7
      const lfo2 = ctx.createOscillator(); lfo2.frequency.value = 3.3
      const d1 = ctx.createGain(); d1.gain.value = 0.12
      const d2 = ctx.createGain(); d2.gain.value = 0.08
      lfo1.connect(d1); d1.connect(crackle.gain)
      lfo2.connect(d2); d2.connect(crackle.gain)
      src.connect(f); f.connect(crackle); crackle.connect(master)
      lfo1.start(); lfo2.start(); src.start()
      oscillators.push(lfo1, lfo2)
      sources.push(src)
      break
    }
    case 'shush': {
      // 쉬소리: 밴드패스 노이즈 + 리드미컬한 진폭 (1.5Hz)
      const src = loopedSource(ctx, makeWhiteBuffer(ctx, 2))
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3500; f.Q.value = 1.5
      const shushGain = ctx.createGain(); shushGain.gain.value = 0
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 1.5
      const lfoDepth = ctx.createGain(); lfoDepth.gain.value = 0.5
      const baseGain = ctx.createGain(); baseGain.gain.value = 0.5
      lfo.connect(lfoDepth); lfoDepth.connect(shushGain.gain)
      // baseGain 고정값 추가
      const constant = ctx.createConstantSource ? ctx.createConstantSource() : null
      if (constant) {
        const cg = ctx.createGain(); cg.gain.value = 0.5
        constant.connect(cg); cg.connect(shushGain.gain)
        constant.start()
      }
      src.connect(f); f.connect(shushGain); shushGain.connect(master)
      lfo.start(); src.start()
      oscillators.push(lfo)
      sources.push(src)
      break
    }
    case 'heartbeat': {
      const bpm = 65
      const beatInterval = (60 / bpm) * 1000
      let hbStopped = false

      const scheduleBeat = () => {
        if (hbStopped || ctx.state === 'closed') return
        const now = ctx.currentTime
        ;[0, 0.15].forEach((offset) => {
          const osc = ctx.createOscillator()
          const env = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.value = 60
          env.gain.setValueAtTime(0, now + offset)
          env.gain.linearRampToValueAtTime(0.8, now + offset + 0.015)
          env.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12)
          osc.connect(env); env.connect(master)
          osc.start(now + offset)
          osc.stop(now + offset + 0.15)
        })
        setTimeout(scheduleBeat, beatInterval)
      }

      scheduleBeat()
      ;(master as any)._stopHeartbeat = () => { hbStopped = true }
      break
    }
    case 'brahms': {
      stopMelody = playMelody(ctx, master, BRAHMS, 72)
      break
    }
    case 'schubert': {
      stopMelody = playMelody(ctx, master, SCHUBERT, 76)
      break
    }
  }

  return {
    stop() {
      stopMelody?.()
      ;(master as any)._stopHeartbeat?.()
      sources.forEach((s) => { try { s.stop() } catch {} })
      oscillators.forEach((o) => { try { o.stop() } catch {} })
      master.disconnect()
    },
    setVolume(v: number) {
      master.gain.setTargetAtTime(v, ctx.currentTime, 0.05)
    },
    fadeOutAndStop(seconds: number) {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds)
      setTimeout(() => {
        stopMelody?.()
        ;(master as any)._stopHeartbeat?.()
        sources.forEach((s) => { try { s.stop() } catch {} })
        oscillators.forEach((o) => { try { o.stop() } catch {} })
        master.disconnect()
      }, seconds * 1000 + 100)
    },
  }
}
