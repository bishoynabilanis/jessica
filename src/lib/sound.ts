/**
 * Tiny WebAudio cues for the kids world: a rising pair for a right answer, a
 * soft low note for a wrong one, and a short run of notes when a paper ends.
 * No files, no network, and silence when the browser blocks audio.
 */

type Note = { at: number; freq: number; length?: number; gain?: number }

function play(notes: Note[]) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const now = ctx.currentTime
    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = note.freq
      const start = now + note.at
      const length = note.length ?? 0.24
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(note.gain ?? 0.16, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + length + 0.02)
    }
    window.setTimeout(() => void ctx.close(), (notes.at(-1)?.at ?? 0) * 1000 + 900)
  } catch {
    /* sound is a bonus */
  }
}

export function playCorrect() {
  play([
    { at: 0, freq: 660, length: 0.16 },
    { at: 0.14, freq: 880, length: 0.22 },
  ])
}

export function playWrong() {
  play([{ at: 0, freq: 300, length: 0.26, gain: 0.1 }])
}

export function playFinish() {
  play([
    { at: 0, freq: 660, length: 0.18 },
    { at: 0.16, freq: 880, length: 0.18 },
    { at: 0.32, freq: 990, length: 0.3 },
  ])
}

export function playStar() {
  play([
    { at: 0, freq: 990, length: 0.14, gain: 0.12 },
    { at: 0.1, freq: 1320, length: 0.18, gain: 0.12 },
  ])
}
