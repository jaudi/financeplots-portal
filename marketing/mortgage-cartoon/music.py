"""Soundtrack for the mortgage cartoon, cued to index.html's timeline.
Writes soundtrack.wav next to this file.

    python3 music.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from sound import Track, boing, click, coin, ding, hp, jingle, lp, noise, pop, scratch, sine, smash, song, tick, vacuum, whoosh, woof, write  # noqa: E402

DUR = 46.5
tr = Track(DUR)


def level(t):
    # quiet while the payment sinks in, cut for the snap back and the smash
    if 8.6 <= t < 9.0 or 32.85 <= t < 33.2 or t >= 46.0:
        return 0.0
    if 4.4 <= t < 8.6:
        return 0.35
    return 0.55 if t < 16.0 else 1.0


def drums(t):
    return (13.2 <= t < 32.85) or (33.2 <= t < 46.0)


song(tr, level, drums, 46.0)

# 1 · the bank's notification
tr.at(0.55, ding(83, 0.6), 0.25)
tr.at(0.65, ding(79, 0.7), 0.2)
# 2 · years fly by: ticking clock, pages flipping
for k in range(40):
    ts = 4.6 + 3.8 * (k / 40) ** 0.7
    tr.at(ts, tick(), 0.35)
    if k % 3 == 0:
        tr.at(ts, hp(noise(0.08, 30), 0.7), 0.08)
tr.at(8.62, scratch(), 0.5)  # snap back to 2029
# 3 · the vacuum sucks up the interest
tr.at(9.1, whoosh(0.5), 0.3)
tr.at(9.3, vacuum(3.6), 0.12)
for i in range(14):
    tr.at(9.6 + i * 0.21, coin(), 0.18)
tr.at(12.6, whoosh(0.6), 0.25)
# 4 · the idea, the piggy bank
tr.at(13.2, ding(88, 1.0), 0.25)
tr.at(13.25, ding(95, 1.0), 0.15)
tr.at(13.7, pop(500), 0.3)
for ts in (14.75, 15.4):
    tr.at(ts, coin(), 0.35)
tr.at(16.0, whoosh(0.8), 0.35)
# 5 · the calculator
for ts in (17.05, 17.4, 18.1, 18.6, 19.15):
    tr.at(ts, click(), 0.5)
for a, b, n in ((17.45, 18.0, 8), (18.15, 18.5, 4), (18.65, 19.05, 5), (19.2, 19.45, 2)):
    for k in range(n):
        tr.at(a + (b - a) * (k + 0.5) / n, hp(noise(0.03, 120), 0.7), 0.18)
for k, ts in enumerate((19.75, 20.1)):
    tr.at(ts, pop(600 + k * 100), 0.25)
tr.at(20.5, whoosh(0.9), 0.12)
for k, ts in enumerate((21.5, 21.9, 22.3, 22.7)):
    tr.at(ts, ding([76, 79, 83, 88][k], 0.7), 0.16)
for k in range(12):  # the pot filling
    tr.at(23.3 + k * 0.28, coin(), 0.1 + k * 0.01)
tr.at(26.75, lp(noise(0.6, 6), 0.5), 0.5)  # boom
tr.at(26.8, sine(200, 60, 0.4, 6), 0.4)
tr.at(28.2, ding(84, 0.8), 0.18)
# 6 · 2049
tr.at(31.0, whoosh(0.9), 0.4)
for k in range(5):
    tr.at(31.5 + k * 0.25, click(), 0.3)
tr.at(32.2, boing(), 0.2)
tr.at(32.88, smash(), 0.7)
for i in range(10):
    tr.at(32.95 + i * 0.05, coin(), 0.15)
tr.at(33.5, pop(500), 0.3)
tr.at(34.0, sine(150, 50, 0.25, 12), 0.6)  # stamp
tr.at(34.05, hp(noise(0.08, 40), 0.6), 0.4)
tr.at(35.1, ding(91, 1.0), 0.2)
for k in range(8):  # cash rain
    tr.at(35.2 + k * 0.25, hp(noise(0.07, 40), 0.7), 0.1)
tr.at(37.6, jingle(0.8), 0.12)  # keys in the dog's mouth
for k in range(7):
    tr.at(37.65 + k * 0.14, sine(220, 160, 0.06, 40), 0.25)  # paws
tr.at(38.75, woof(), 0.6)
tr.at(38.85, jingle(0.3), 0.2)
# 7 · end card
tr.at(40.0, whoosh(0.8), 0.3)
tr.at(43.0, ding(91, 1.0), 0.2)

write(tr, Path(__file__).with_name("soundtrack.wav"))
