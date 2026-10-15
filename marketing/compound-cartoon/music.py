"""Soundtrack for the compound interest cartoon, cued to index.html's timeline.
Writes soundtrack.wav next to this file.

    python3 music.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from sound import Track, click, coin, ding, hp, jingle, lp, noise, pop, sine, song, tick, whoosh, woof, write  # noqa: E402

DUR = 68.0
tr = Track(DUR)


def level(t):
    # quieter while Sam is bored, a beat of silence before the twist
    if 36.7 <= t < 37.0 or t >= 67.5:
        return 0.0
    if 5.6 <= t < 10.2:
        return 0.35
    return 0.55 if t < 10.2 else 0.9


def drums(t):
    return 10.2 <= t < 67.5


song(tr, level, drums, 67.5)

# 1 · the first £200
tr.at(0.55, ding(83, 0.6), 0.25)
tr.at(0.65, ding(79, 0.7), 0.2)
tr.at(1.75, coin(), 0.4)
# 2 · a year of months: ticking clock, coins
for k in range(30):
    tr.at(5.6 + k * 0.127, tick(), 0.25)
for i in range(11):
    tr.at(5.7 + i * 0.32 + 0.35, coin(), 0.22)
tr.at(7.7, sine(300, 180, 0.8, 2), 0.12)  # the yawn
tr.at(9.4, hp(noise(0.08, 30), 0.7), 0.2)  # age card flips
# 3 · the snowball
tr.at(10.2, whoosh(0.8), 0.35)
tr.at(11.0, pop(400), 0.3)  # the push
x = lp(noise(4.4, 0), 0.85)
tr.at(11.2, x * 0.5, 0.25)  # rolling
for k in range(14):
    tr.at(11.3 + 4.2 * (k / 14) ** 0.8, sine(120, 70, 0.2, 10), 0.1 + k * 0.015)
tr.at(13.6, ding(91, 0.8), 0.2)
# 4 · the calculator
tr.at(16.2, whoosh(0.8), 0.35)
for ts in (17.55, 18.2, 19.45, 20.95, 21.35):
    tr.at(ts, click(), 0.5)
for a, b, n in ((17.75, 17.9, 1), (18.4, 18.85, 3), (21.45, 21.55, 1)):
    for k in range(n):
        tr.at(a + (b - a) * (k + 0.5) / n, hp(noise(0.03, 120), 0.7), 0.18)
for k in range(10):  # the slider
    tr.at(19.5 + k * 0.1, tick(), 0.2)
for k, ts in enumerate((21.9, 22.1, 22.3, 22.5)):
    tr.at(ts, pop(600 + k * 80), 0.22)
for k in range(15):  # the chart climbing
    tr.at(22.3 + k * 0.28, coin(), 0.06 + k * 0.008)
tr.at(26.8, ding(88, 1.0), 0.25)
tr.at(26.85, ding(95, 1.0), 0.18)
tr.at(32.0, ding(84, 0.8), 0.18)
# 5 · what if Sam waited?
tr.at(38.15, click(), 0.5)
for k in range(14):  # slider back down
    tr.at(38.2 + k * 0.1, tick(), 0.2)
tr.at(39.6, sine(400, 140, 0.6, 3), 0.25)  # sad slide
tr.at(41.8, pop(500), 0.3)
# 6 · age 65
tr.at(51.7, whoosh(0.9), 0.4)
for k in range(8):
    tr.at(52.0 + k * 0.2, click(), 0.25)
tr.at(53.7, ding(91, 1.0), 0.25)
for k in range(8):  # cash rain
    tr.at(53.9 + k * 0.28, hp(noise(0.07, 40), 0.7), 0.1)
for k in range(5):  # paws
    tr.at(56.65 + k * 0.14, sine(220, 160, 0.06, 40), 0.25)
tr.at(57.35, jingle(0.6), 0.2)
tr.at(57.6, woof(), 0.6)
for k in range(6):
    tr.at(57.7 + k * 0.14, sine(220, 160, 0.06, 40), 0.22)
# 7 · end card
tr.at(59.2, whoosh(0.8), 0.3)
tr.at(62.8, ding(91, 1.0), 0.2)

write(tr, Path(__file__).with_name("soundtrack.wav"))
