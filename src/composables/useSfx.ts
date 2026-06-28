// Synthesised UI sound effects — no asset files. A module-scope singleton shares one
// AudioContext across every component AND the router guard (so it is a plain module,
// not a lifecycle-bound composable). Mobile WebViews start the context 'suspended'
// until a user gesture resumes it; call unlock() from the first tap. Everything no-ops
// under prefers-reduced-motion or when Web Audio is unavailable.

type Ctor = typeof AudioContext

function getCtor(): Ctor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

let ctx: AudioContext | null = null

// Read live (not cached): the OS setting can flip while the app is running.
function reduced(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function ensure(): AudioContext | null {
  if (ctx) return ctx
  const Ctor = getCtor()
  if (!Ctor) return null
  try {
    ctx = new Ctor()
  } catch {
    /* Web Audio unavailable */
    ctx = null
  }
  return ctx
}

// Resume the context after a user gesture (and defensively before each sound).
export function unlock(): void {
  const c = ensure()
  if (c && c.state === 'suspended') void c.resume().catch(() => {})
}

// One oscillator + gain with a short attack/decay envelope. Envelope values stay above
// zero: exponentialRampToValueAtTime throws on a 0 target.
function tone(opts: {
  type: OscillatorType
  from: number
  to?: number
  dur: number
  peak: number
}) {
  if (reduced()) return
  const c = ensure()
  if (!c) return
  if (c.state === 'suspended') void c.resume().catch(() => {})
  const t = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = opts.type
  osc.frequency.setValueAtTime(opts.from, t)
  if (opts.to !== undefined) osc.frequency.exponentialRampToValueAtTime(opts.to, t + opts.dur)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(opts.peak, t + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + opts.dur + 0.02)
}

// Soft tick on any button tap.
export function click(): void {
  tone({ type: 'triangle', from: 880, dur: 0.05, peak: 0.06 })
}

// Quick upward blip when a popup appears.
export function pop(): void {
  tone({ type: 'sine', from: 420, to: 760, dur: 0.12, peak: 0.08 })
}

// Short rising major arpeggio (C–E–G–C) — a one-shot "ta-da" played when the quiz
// score screen appears. Notes are spaced with setTimeout so each is its own short tone();
// the last note rings a touch longer/louder for the cadence.
export function fanfare(): void {
  if (reduced()) return
  const notes: [number, number, number][] = [
    // [frequency, delay ms, duration s]
    [523, 0, 0.18],
    [659, 90, 0.18],
    [784, 180, 0.18],
    [1047, 300, 0.36],
  ]
  for (const [freq, delay, dur] of notes) {
    setTimeout(() => tone({ type: 'triangle', from: freq, dur, peak: 0.07 }), delay)
  }
}

// Airy downward sweep on page change (oscillator + lowpass, no noise buffer to keep it
// light on low-end Android).
export function whoosh(): void {
  if (reduced()) return
  const c = ensure()
  if (!c) return
  if (c.state === 'suspended') void c.resume().catch(() => {})
  const t = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(1200, t)
  lp.frequency.exponentialRampToValueAtTime(300, t + 0.22)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(520, t)
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.22)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.05, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26)
  osc.connect(lp).connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + 0.28)
}
