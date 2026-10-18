"""Soundtrack for the 5-year-model cartoon, cued to index.html's timeline.
Writes soundtrack.wav next to this file.

    python3 music.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from sound import Track, click, coin, ding, hp, jingle, lp, noise, pop, scratch, sine, song, whoosh, woof, write  # noqa: E402

DUR = 46.5
tr = Track(DUR)


def level(t):
    # quiet in the bank, a cut for the stamp, full once the model starts
    if 7.15 <= t < 7.7 or t >= 46.0:
        return 0.0
    return 0.45 if t < 15.6 else 1.0


def drums(t):
    return (12.6 <= t < 46.0)


song(tr, level, drums, 46.0)

# 1 · the question, the sweat
tr.at(0.5, pop(420), 0.3)
tr.at(1.3, sine(900, 500, 0.25, 8), 0.12)  # gulp
# 2 · the napkin
tr.at(4.4, hp(noise(0.5, 4), 0.6), 0.12)  # slide
tr.at(5.7, whoosh(0.4), 0.25)
tr.at(7.15, scratch(), 0.5)
tr.at(7.2, sine(130, 40, 0.3, 10), 0.6)  # stamp
# 3 · the dog eats it
tr.at(8.9, sine(200, 700, 0.35, 4), 0.2)  # jump
for k in range(6):
    tr.at(10.1 + k * 0.28, lp(noise(0.08, 30), 0.5), 0.35)  # chomp
tr.at(11.2, sine(160, 90, 0.35, 5), 0.5)  # burp
tr.at(12.2, woof(), 0.5)
# 4 · the idea
tr.at(12.7, ding(88, 1.0), 0.25)
tr.at(12.75, ding(95, 1.0), 0.15)
tr.at(15.6, whoosh(0.8), 0.35)
# 5 · the model
for ts in (16.65, 17.6, 18.3, 18.65, 19.0, 24.0, 30.5):
    tr.at(ts, click(), 0.5)
for a, b, n in ((16.7, 17.5, 10), (17.65, 18.2, 7), (18.35, 18.55, 2), (18.7, 18.9, 2), (19.05, 19.25, 2)):
    for k in range(n):
        tr.at(a + (b - a) * (k + 0.5) / n, hp(noise(0.03, 120), 0.7), 0.18)
for k, ts in enumerate((19.5, 19.8, 20.1, 20.4)):
    tr.at(ts, ding([76, 79, 83, 88][k], 0.6), 0.15)
for k in range(5):
    tr.at(20.5 + k * 0.32, pop(500 + k * 80), 0.22)  # bars
tr.at(22.6, whoosh(0.8), 0.12)
tr.at(24.6, sine(300, 900, 0.3, 6), 0.15)  # twist
tr.at(24.9, ding(70, 1.2), 0.2)
tr.at(28.6, ding(91, 0.9), 0.2)
for k in range(4):
    tr.at(28.65 + k * 0.08, coin(), 0.1)
tr.at(29.9, whoosh(0.5), 0.1)
# 6 · back at the bank
tr.at(31.4, whoosh(0.9), 0.4)
tr.at(32.2, hp(noise(0.4, 6), 0.6), 0.12)  # paper
tr.at(33.3, sine(400, 1200, 0.25, 8), 0.2)  # wow
tr.at(34.0, pop(500), 0.3)
tr.at(37.8, sine(200, 700, 0.35, 4), 0.2)
tr.at(38.3, woof(), 0.5)
tr.at(38.6, jingle(0.3), 0.08)
# 7 · end card
tr.at(40.1, whoosh(0.8), 0.3)
tr.at(43.1, ding(91, 1.0), 0.2)

write(tr, Path(__file__).with_name("soundtrack.wav"))
