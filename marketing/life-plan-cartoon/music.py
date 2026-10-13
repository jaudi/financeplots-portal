"""Soundtrack for the Life Plan cartoon: an upbeat ukulele-style loop plus
cartoon sound effects cued to index.html's timeline. Synthesised with numpy,
so there is nothing to license. Writes soundtrack.wav next to this file.

    python3 music.py
"""

import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 44.0
rng = np.random.default_rng(7)
mix = np.zeros(int(SR * DUR) + SR)


def at(t, sig, gain=1.0):
    i = int(t * SR)
    n = min(len(sig), len(mix) - i)
    if n > 0:
        mix[i : i + n] += sig[:n] * gain


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


# ---------- music ----------
BEAT = 0.5  # 120 bpm
CHORDS = [(60, [60, 64, 67, 72]), (55, [59, 62, 67, 71]), (57, [57, 60, 64, 69]), (53, [57, 60, 65, 69])]  # C G Am F
PATTERN = [0, 2, 1, 3, 2, 1, 3, 2]
kick = sine(140, 45, 0.25, 14)
snare = hp(noise(0.18, 22)) * 0.8 + np.pad(sine(220, 180, 0.1, 30), (0, int(SR * 0.08))) * 0.3
hat = hp(noise(0.05, 80), 0.5)
bass_cache = {}
pluck_cache = {}


def music_on(t):
    """Music level over time: quiet intro, cut for the gags, full for the app."""
    if 7.0 <= t < 7.75 or 35.62 <= t < 36.05 or t >= 43.6:
        return 0.0
    return 0.55 if t < 13.4 else 1.0


def drums_on(t):
    return (4.8 <= t < 10.9) or (13.9 <= t < 35.62) or (36.05 <= t < 43.5)


bar = 0
t = 0.0
while t < 43.5:
    root, notes = CHORDS[bar % 4]
    for s in range(8):
        ts = t + s * BEAT / 2
        g = music_on(ts)
        if g == 0:
            continue
        key = notes[PATTERN[s]]
        if key not in pluck_cache:
            pluck_cache[key] = pluck(key + 12, 0.7)
        at(ts, pluck_cache[key], 0.16 * g)
        if drums_on(ts):
            at(ts, hat, 0.05 * g)
            if s % 4 == 0:
                at(ts, kick, 0.5 * g)
            if s % 4 == 2:
                at(ts, snare, 0.13 * g)
        if s % 2 == 0:
            if root not in bass_cache:
                x = tt(0.45)
                bass_cache[root] = (np.sin(2 * np.pi * hz(root - 24) * x) + 0.3 * np.sin(4 * np.pi * hz(root - 24) * x)) * env(0.45, 0.01, 5)
            at(ts, bass_cache[root], 0.32 * g)
    # a strummed chord on each bar's downbeat
    if music_on(t) > 0:
        for k, n in enumerate(notes):
            at(t + k * 0.012, pluck(n, 1.2, 0.6), 0.07 * music_on(t))
    bar += 1
    t += 4 * BEAT
# final chord
for k, n in enumerate([48, 60, 64, 67, 72, 76]):
    at(43.0 + k * 0.03, pluck(n, 2.5, 0.8), 0.13)

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


# 1 · Mum's text
at(0.55, ding(88, 0.6), 0.25)
at(0.62, ding(93, 0.6), 0.2)
at(0.95, buzz(), 0.12)
at(1.3, buzz(), 0.12)
# thought chain, cloud
for i, ts in enumerate([3.9, 4.15, 4.4]):
    at(ts, pop(500 + i * 120), 0.3)
at(4.8, whoosh(0.5), 0.25)
at(4.9, pop(400), 0.35)
# mansion → LOL NO → normal home
for k in range(4):  # sparkle
    at(5.9 + 0.06 * k, ding(84 + k * 4, 0.5), 0.12)
at(6.95, scratch(), 0.5)
at(7.05, sine(120, 40, 0.3, 10), 0.6)
for ts in (7.8, 8.5, 9.3):
    at(ts, pop(700), 0.3)
at(8.6, jingle(0.4), 0.06)  # rattle
# panic
for i in range(5):
    at(10.7 + i * 0.16, pop(900 - i * 90), 0.25)
at(11.2, pop(500), 0.3)
at(11.6, pop(450), 0.3)
at(11.4, sine(300, 80, 0.5, 4), 0.25)  # calculator fizzles
at(11.7, lp(noise(1.3, 1.5), 0.3), 0.08)  # smoke hiss
# laptop, FinancePlots
at(13.15, click(), 0.4)
at(13.2, sine(200, 900, 0.5, 3), 0.1)
at(13.9, whoosh(0.8), 0.35)
for ts in (15.05, 16.0, 16.9, 18.0, 18.75, 19.5, 27.6):
    at(ts, click(), 0.5)
for a, b, n in ((15.15, 15.85, 7), (16.05, 16.75, 7), (16.95, 17.5, 6)):
    for k in range(n):
        at(a + (b - a) * (k + 0.5) / n, hp(noise(0.03, 120), 0.7), 0.18)
for k, ts in enumerate((18.05, 18.8, 19.55)):
    at(ts + 0.05, pop(600 + k * 100), 0.25)
at(20.4, whoosh(0.9), 0.12)
at(21.4, sine(300, 1200, 2.8, 0.6), 0.04)  # line rising
for k, ts in enumerate((24.2, 24.65, 25.1, 25.55)):
    at(ts, ding([76, 79, 83, 88][k], 0.8), 0.18)
at(28.0, whoosh(0.6), 0.15)
for k, ts in enumerate((29.7, 30.4, 31.1)):
    at(ts, ding([72, 76, 79][k], 0.6), 0.16)
# the future
at(32.0, whoosh(0.9), 0.4)
for k in range(5):
    at(32.8 + k * 0.3, click(), 0.3)
at(33.75, hp(noise(0.25, 12), 0.6), 0.35)  # party popper
at(33.8, ding(84, 1.2), 0.15)
at(33.65, jingle(0.6), 0.12)
at(35.2, boing(), 0.3)
at(35.62, jingle(0.4), 0.15)
at(35.64, scratch(), 0.5)
at(35.9, woof(), 0.6)
at(36.25, woof(), 0.5)
for k in range(10):
    at(36.0 + k * 0.13, sine(220, 160, 0.06, 40), 0.25)  # paws
# end card
at(38.0, whoosh(0.8), 0.3)
at(41.0, ding(91, 1.0), 0.2)

# ---------- master ----------
mix = mix[: int(SR * DUR)]
fade = int(SR * 0.4)
mix[-fade:] *= np.linspace(1, 0, fade)
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
mix *= 0.89 / max(1e-9, np.abs(mix).max())
st = np.stack([mix, np.roll(mix, int(SR * 0.004)) * 0.96], axis=1)  # a touch of width
out = Path(__file__).with_name("soundtrack.wav")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print("wrote", out)
