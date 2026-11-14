"""Two short, original background beds for the Jessica films.

Synthesised locally with numpy — no samples, no licences, nothing to clear.
Run: python3 make_music.py
"""

import math
import wave

import numpy as np

SR = 44100
DURATION = 20.0


def env(n: int, attack: float, release: float) -> np.ndarray:
    e = np.ones(n)
    a = int(attack * SR)
    r = int(release * SR)
    if a:
        e[:a] = np.linspace(0, 1, a)
    if r:
        e[-r:] = np.linspace(1, 0, r)
    return e


def pluck(freq: float, dur: float, amp: float = 0.4, bright: float = 0.35) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = (
        np.sin(2 * np.pi * freq * t)
        + 0.45 * bright * np.sin(4 * np.pi * freq * t)
        + 0.2 * bright * np.sin(6 * np.pi * freq * t)
    )
    return x * np.exp(-t * (4.2 / max(dur, 0.01))) * amp


def pad(freqs, dur: float, amp: float = 0.16) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for det in (-0.4, 0.4):
            x += np.sin(2 * np.pi * (f + det) * t)
    x /= len(freqs) * 2
    return x * env(n, min(0.9, dur * 0.35), min(1.3, dur * 0.4)) * amp


def kick(dur: float = 0.32, amp: float = 0.45) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 115 * np.exp(-t * 16) + 46
    phase = np.cumsum(2 * np.pi * f / SR)
    return np.sin(phase) * np.exp(-t * 8.5) * amp


def hat(dur: float = 0.06, amp: float = 0.06) -> np.ndarray:
    n = int(dur * SR)
    rng = np.random.default_rng(7)
    noise = rng.standard_normal(n)
    noise = np.diff(noise, prepend=0)  # cheap high-pass
    return noise * np.exp(-np.arange(n) / SR * 60) * amp


def add(buf: np.ndarray, sig: np.ndarray, at: float) -> None:
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if j > i:
        buf[i:j] += sig[: j - i]


def write(path: str, mono: np.ndarray) -> None:
    mono = mono / max(1e-6, np.max(np.abs(mono))) * 0.82
    fade_in, fade_out = int(0.25 * SR), int(1.4 * SR)
    mono[:fade_in] *= np.linspace(0, 1, fade_in)
    mono[-fade_out:] *= np.linspace(1, 0, fade_out)
    # a touch of width: 9 ms haas on one side
    delay = int(0.009 * SR)
    left = mono
    right = np.concatenate([np.zeros(delay), mono[:-delay]])
    stereo = np.stack([left, right * 0.96], axis=1)
    data = (np.clip(stereo, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def warm() -> np.ndarray:
    """Film 1 — calm, emotional, hopeful."""
    n = int(DURATION * SR)
    buf = np.zeros(n)
    chords = [
        (0.0, [261.63, 329.63, 392.0, 493.88]),  # Cmaj7
        (5.0, [220.0, 261.63, 329.63, 392.0]),  # Am7
        (10.0, [174.61, 220.0, 261.63, 329.63]),  # Fmaj7
        (15.0, [196.0, 246.94, 293.66, 329.63]),  # G6
    ]
    for at, notes in chords:
        add(buf, pad(notes, 5.2, 0.2), at)

    rng = np.random.default_rng(11)
    melody = [523.25, 587.33, 659.25, 783.99, 880.0, 659.25, 587.33, 523.25]
    for i, freq in enumerate(melody):
        add(buf, pluck(freq, 1.1, 0.18, 0.25), 1.2 + i * 2.2)

    # vinyl-ish air
    air = rng.standard_normal(n) * 0.006
    air = np.convolve(air, np.ones(12) / 12, mode="same")
    buf += air
    return buf


def bright() -> np.ndarray:
    """Film 2 — light, optimistic, a soft pulse."""
    n = int(DURATION * SR)
    buf = np.zeros(n)
    bars = [
        [220.0, 261.63, 329.63],  # Am
        [174.61, 220.0, 261.63],  # F
        [261.63, 329.63, 392.0],  # C
        [196.0, 246.94, 293.66],  # G
    ]
    bar = 2.5
    for i in range(int(DURATION / bar)):
        notes = bars[i % len(bars)]
        at = i * bar
        add(buf, pad(notes, bar + 0.3, 0.07), at)
        add(buf, np.sin(2 * np.pi * notes[0] / 2 * np.arange(int(1.1 * SR)) / SR) * env(int(1.1 * SR), 0.02, 1.0) * 0.22, at)
        # 8th-note arpeggio
        pattern = [0, 1, 2, 1, 0, 2, 1, 2]
        for step, idx in enumerate(pattern):
            add(buf, pluck(notes[idx] * 2, 0.34, 0.16, 0.5), at + step * (bar / 8))
        add(buf, kick(0.3, 0.4), at)
        add(buf, kick(0.26, 0.28), at + bar / 2)
        for h in range(8):
            add(buf, hat(0.05, 0.05 if h % 2 == 0 else 0.03), at + h * (bar / 8))
    return buf


if __name__ == "__main__":
    write("jessica-launch/assets/music/bed.wav", warm())
    write("jessica-features/assets/music/bed.wav", bright())
    print("music written")
