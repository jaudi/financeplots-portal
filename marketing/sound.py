"""Shared synth for the FinancePlots cartoons: a Karplus-Strong ukulele, drums,
cartoon effects and a song() that loops the C–G–Am–F progression. Each
cartoon's music.py imports this, lays out its own cues and calls write().
Nothing to license: it is all synthesised with numpy.

The Life Plan cartoon's music.py predates this file and carries its own copy.
"""

import wave
from pathlib import Path

import numpy as np

SR = 44100
rng = np.random.default_rng(7)


class Track:
    """A mono buffer `dur` seconds long that sounds are added into."""

    def __init__(self, dur):
        self.dur = dur
        self.buf = np.zeros(int(SR * dur) + SR)

    def at(self, t, sig, gain=1.0):
        i = int(t * SR)
        n = min(len(sig), len(self.buf) - i)
        if n > 0:
            self.buf[i : i + n] += sig[:n] * gain


def tt(d):
    return np.arange(int(SR * d)) / SR


def env(d, a=0.005, decay=6.0):
    x = tt(d)
    return np.minimum(1, x / a) * np.exp(-x * decay)


def hz(note):
    return 440 * 2 ** ((note - 69) / 12)


def pluck(note, d=0.6, bright=1.0):
    """Karplus-Strong string: reads as a ukulele."""
    f = hz(note)
    n = int(SR * d)
    p = int(SR / f)
    buf = rng.uniform(-1, 1, p) * bright
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * np.minimum(1, tt(d) / 0.002)


def sine(f0, f1, d, decay=8.0):
    f = np.linspace(f0, f1, int(SR * d))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.003, decay)


def noise(d, decay=20.0):
    return rng.uniform(-1, 1, int(SR * d)) * env(d, 0.001, decay)


def hp(x, k=0.85):
    """Crude high-pass: subtract a one-pole low-pass."""
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = k * acc + (1 - k) * v
        y[i] = v - acc
    return y


def lp(x, k=0.9):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = k * acc + (1 - k) * v
        y[i] = acc
    return y


# ---------- sound effects ----------
def pop(f=600):
    return sine(f, f * 2.2, 0.09, 30)


def click():
    return hp(noise(0.02, 200), 0.6)


def whoosh(d=0.6):
    x = noise(d, 0) * np.sin(np.pi * tt(d) / d) ** 2
    return lp(x, 0.8)


def ding(n, d=1.0):
    x = tt(d)
    f = hz(n)
    return (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * 2.76 * f * x) * np.exp(-x * 6)) * env(d, 0.002, 4)


def buzz(d=0.28):
    x = tt(d)
    return np.sign(np.sin(2 * np.pi * 160 * x)) * (0.5 + 0.5 * np.sin(2 * np.pi * 30 * x)) * np.minimum(1, (d - x) / 0.02)


def scratch():
    d = 0.42
    x = tt(d)
    rate = np.where(x < 0.2, np.linspace(1, 3, len(x)), np.linspace(3, 0.3, len(x)))
    ph = np.cumsum(rate) / SR
    return lp(noise(d, 0), 0.6) * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * ph)) * np.sin(np.pi * x / d)


def jingle(d=0.5):
    out = np.zeros(int(SR * d))
    for k in range(9):
        i = int(rng.uniform(0, d - 0.12) * SR)
        f = rng.uniform(3200, 6200)
        s = np.sin(2 * np.pi * f * tt(0.12)) * env(0.12, 0.001, 35)
        out[i : i + len(s)] += s
    return out


def woof():
    d = 0.22
    x = tt(d)
    f = np.linspace(520, 230, len(x))
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return lp(saw * 0.7 + noise(d, 0) * 0.3, 0.55) * np.sin(np.pi * x / d) ** 0.5


def boing():
    d = 0.45
    x = tt(d)
    f = 180 + 500 * x / d + 40 * np.sin(2 * np.pi * 14 * x)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.005, 3)




def coin():
    return ding(96, 0.25) * 0.7 + ding(100, 0.25) * 0.3


def tick():
    return hp(noise(0.015, 300), 0.5)


def vacuum(d):
    x = tt(d)
    hum = np.sign(np.sin(2 * np.pi * 95 * x)) * 0.3 + lp(noise(d, 0), 0.7) * 0.7
    return hum * np.minimum(1, np.minimum(x / 0.15, (d - x) / 0.2))


def smash():
    return lp(noise(0.5, 9), 0.4) + np.pad(sine(160, 50, 0.3, 10), (0, int(SR * 0.2)))


# ---------- the song ----------
BEAT = 0.5  # 120 bpm
CHORDS = [(60, [60, 64, 67, 72]), (55, [59, 62, 67, 71]), (57, [57, 60, 64, 69]), (53, [57, 60, 65, 69])]  # C G Am F
PATTERN = [0, 2, 1, 3, 2, 1, 3, 2]


def song(track, level, drums, until):
    """Ukulele arpeggios, bass and drums up to `until` seconds.
    level(t) → 0..1 (0 mutes, e.g. for a gag); drums(t) → bool."""
    kick = sine(140, 45, 0.25, 14)
    snare = hp(noise(0.18, 22)) * 0.8 + np.pad(sine(220, 180, 0.1, 30), (0, int(SR * 0.08))) * 0.3
    hat = hp(noise(0.05, 80), 0.5)
    plucks, basses = {}, {}
    bar, t = 0, 0.0
    while t < until:
        root, notes = CHORDS[bar % 4]
        for s in range(8):
            ts = t + s * BEAT / 2
            g = level(ts)
            if g == 0:
                continue
            key = notes[PATTERN[s]]
            if key not in plucks:
                plucks[key] = pluck(key + 12, 0.7)
            track.at(ts, plucks[key], 0.16 * g)
            if drums(ts):
                track.at(ts, hat, 0.05 * g)
                if s % 4 == 0:
                    track.at(ts, kick, 0.5 * g)
                if s % 4 == 2:
                    track.at(ts, snare, 0.13 * g)
            if s % 2 == 0:
                if root not in basses:
                    x = tt(0.45)
                    basses[root] = (np.sin(2 * np.pi * hz(root - 24) * x) + 0.3 * np.sin(4 * np.pi * hz(root - 24) * x)) * env(0.45, 0.01, 5)
                track.at(ts, basses[root], 0.32 * g)
        if level(t) > 0:
            for k, n in enumerate(notes):
                track.at(t + k * 0.012, pluck(n, 1.2, 0.6), 0.07 * level(t))
        bar += 1
        t += 4 * BEAT
    for k, n in enumerate([48, 60, 64, 67, 72, 76]):
        track.at(until - 0.5 + k * 0.03, pluck(n, 2.5, 0.8), 0.13)


def write(track, path):
    """Soft-clip, normalise, fade out and save as 16-bit stereo WAV."""
    mix = track.buf[: int(SR * track.dur)].copy()
    fade = int(SR * 0.4)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix = np.tanh(mix * 1.3) / np.tanh(1.3)
    mix *= 0.89 / max(1e-9, np.abs(mix).max())
    st = np.stack([mix, np.roll(mix, int(SR * 0.004)) * 0.96], axis=1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())
    print("wrote", path)
