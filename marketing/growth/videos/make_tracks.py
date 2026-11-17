"""Three original background beds for the Jessica demo videos.

Synthesised locally with numpy — no samples, no licences.
Run: python3 marketing/growth/videos/make_tracks.py
"""

import math
import os
import wave

import numpy as np

SR = 44100
OUT = "/tmp/jessica-tracks"


def env(n: int, attack: float, release: float) -> np.ndarray:
    e = np.ones(n)
    a = int(attack * SR)
    r = int(release * SR)
    if a:
        e[:a] = np.linspace(0, 1, a)
    if r:
        e[-r:] = np.linspace(1, 0, r)
    return e


def pluck(freq: float, dur: float, amp: float = 0.3, bright: float = 0.4) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = (
        np.sin(2 * np.pi * freq * t)
        + 0.4 * bright * np.sin(4 * np.pi * freq * t)
        + 0.18 * bright * np.sin(6 * np.pi * freq * t)
    )
    return x * np.exp(-t * (4.6 / max(dur, 0.01))) * amp


def pad(freqs, dur: float, amp: float = 0.14) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for det in (-0.35, 0.35):
            x += np.sin(2 * np.pi * (f + det) * t)
    x /= len(freqs) * 2
    return x * env(n, min(1.0, dur * 0.3), min(1.4, dur * 0.45)) * amp


def bass(freq: float, dur: float, amp: float = 0.2) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t)
    return x * env(n, 0.02, min(0.5, dur * 0.4)) * amp


def kick(dur: float = 0.3, amp: float = 0.4) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 112 * np.exp(-t * 15) + 44
    phase = np.cumsum(2 * np.pi * f / SR)
    return np.sin(phase) * np.exp(-t * 9) * amp


def hat(dur: float = 0.05, amp: float = 0.05) -> np.ndarray:
    n = int(dur * SR)
    rng = np.random.default_rng(7)
    noise = rng.standard_normal(n)
    noise = np.diff(noise, prepend=0)
    return noise * np.exp(-np.arange(n) / SR * 65) * amp


def clap(amp: float = 0.12) -> np.ndarray:
    n = int(0.09 * SR)
    rng = np.random.default_rng(21)
    noise = rng.standard_normal(n)
    return noise * np.exp(-np.arange(n) / SR * 38) * amp


def add(buf: np.ndarray, sig: np.ndarray, at: float) -> None:
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if j > i:
        buf[i:j] += sig[: j - i]


def write(name: str, mono: np.ndarray, fade_out: float = 2.6) -> None:
    mono = mono / max(1e-6, np.max(np.abs(mono))) * 0.8
    fade_in, out = int(0.25 * SR), int(fade_out * SR)
    mono[:fade_in] *= np.linspace(0, 1, fade_in)
    mono[-out:] *= np.linspace(1, 0, out)
    delay = int(0.009 * SR)
    left = mono
    right = np.concatenate([np.zeros(delay), mono[:-delay]])
    stereo = np.stack([left, right * 0.96], axis=1)
    data = (np.clip(stereo, -1, 1) * 32767).astype("<i2")
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print("wrote", name, round(len(mono) / SR, 1), "s")


def tour() -> np.ndarray:
    """Warm, cinematic, slow build — the full app tour."""
    dur = 36.0
    buf = np.zeros(int(dur * SR))
    bar = 4 * 60 / 72
    chords = [
        [261.63, 329.63, 392.0, 493.88],  # Cmaj7
        [220.0, 261.63, 329.63, 392.0],  # Am7
        [174.61, 220.0, 261.63, 329.63],  # Fmaj7
        [196.0, 246.94, 293.66, 392.0],  # G6
    ]
    roots = [130.81, 110.0, 87.31, 98.0]
    steps = int(dur / bar) + 1
    for i in range(steps):
        chord = chords[i % 4]
        at = i * bar
        add(buf, pad(chord, bar + 0.5, 0.15), at)
        add(buf, bass(roots[i % 4], bar * 0.85, 0.17), at)
        if i >= 1:
            pattern = [0, 2, 1, 3, 2, 0, 1, 2]
            for s, idx in enumerate(pattern):
                add(buf, pluck(chord[idx] * 2, 0.42, 0.08, 0.4), at + s * bar / 8)
        if i >= 2:
            add(buf, kick(0.3, 0.2), at)
            add(buf, kick(0.26, 0.14), at + bar / 2)
        if i >= 3:
            for h in range(8):
                add(buf, hat(0.05, 0.022 if h % 2 else 0.015), at + h * bar / 8)
        if i % 4 == 0:
            add(buf, pluck(chord[3] * 2, 2.4, 0.04, 0.6), at)
    return buf


def labs_ar() -> np.ndarray:
    """Minimal, curious, techy — the Arabic labs cut."""
    dur = 34.0
    buf = np.zeros(int(dur * SR))
    bar = 4 * 60 / 92
    drone = [110.0, 164.81, 220.0]
    for i in range(int(dur / (bar * 2)) + 1):
        add(buf, pad(drone, bar * 2 + 0.6, 0.11), i * bar * 2)
    notes = [440.0, 523.25, 587.33, 659.25, 783.99]
    pattern = [0, None, 2, 1, None, 3, 2, None, 4, 3, None, 2, 1, None, 0, None]
    step = bar / 8
    for i in range(int(dur / step)):
        idx = pattern[i % 16]
        if idx is not None:
            add(buf, pluck(notes[idx], 0.34, 0.09, 0.45), i * step)
        if i % 8 == 0:
            add(buf, kick(0.26, 0.16), i * step)
        if i % 8 == 4:
            add(buf, hat(0.05, 0.02), i * step)
        if i % 16 == 8:
            add(buf, pluck(1318.51, 0.14, 0.03, 0.7), i * step)
    return buf


def labs_en() -> np.ndarray:
    """Bright, upbeat, light electronic — the English labs cut."""
    dur = 34.0
    buf = np.zeros(int(dur * SR))
    beat = 60 / 116
    bar = 4 * beat
    chords = [
        [261.63, 329.63, 392.0],  # C
        [196.0, 246.94, 293.66],  # G
        [220.0, 261.63, 329.63],  # Am
        [174.61, 220.0, 261.63],  # F
    ]
    roots = [130.81, 98.0, 110.0, 87.31]
    for i in range(int(dur / bar) + 1):
        chord = chords[i % 4]
        at = i * bar
        add(buf, pad(chord, bar, 0.09), at)
        add(buf, bass(roots[i % 4], bar * 0.8, 0.16), at)
        for s in range(16):
            note = chord[s % 3] * 2
            add(buf, pluck(note, 0.18, 0.06, 0.55), at + s * bar / 16)
        for b in range(4):
            add(buf, kick(0.22, 0.18), at + b * beat)
        add(buf, clap(0.1), at + beat)
        add(buf, clap(0.1), at + 3 * beat)
        for h in range(4):
            add(buf, hat(0.04, 0.03), at + h * beat + beat / 2)
    return buf


if __name__ == "__main__":
    write("tour.wav", tour())
    write("labs-ar.wav", labs_ar())
    write("labs-en.wav", labs_en())
