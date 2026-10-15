"""Soundtrack for the break-even cartoon, cued to index.html's timeline.
Writes soundtrack.wav next to this file.

    python3 music.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from sound import Track, boing, click, coin, ding, hp, lp, noise, pop, scratch, sine, song, whoosh, woof, write  # noqa: E402

DUR = 67.0
tr = Track(DUR)


def level(t):
    # the music stops dead when the dog strikes, and comes back for the redo
    if 20.4 <= t < 25.5 or t >= 66.5:
        return 0.0
    if 10.2 <= t < 20.4:
        return 0.4
    return 0.55 if t < 25.5 else 0.9


def drums(t):
    return 25.5 <= t < 66.5


song(tr, level, drums, 66.5)

# 1 · the coffee bike
tr.at(0.5, pop(500), 0.3)
tr.at(1.0, ding(84, 0.7), 0.2)
tr.at(5.4, pop(700), 0.3)  # thought bubble
# 2 · pencil on paper
for a, b in ((10.6, 11.2), (11.3, 11.7), (11.8, 12.2), (12.3, 12.7), (12.8, 13.2), (13.3, 13.7), (13.8, 14.2), (14.4, 15.0), (15.8, 16.9)):
    k = 0
    while a + k * 0.07 < b:
        tr.at(a + k * 0.07, hp(noise(0.05, 60), 0.4), 0.06)
        k += 1
tr.at(14.1, hp(noise(0.3, 10), 0.5), 0.05)  # underline
tr.at(17.1, hp(noise(0.6, 4), 0.5), 0.05)  # the ring
tr.at(17.7, ding(91, 0.9), 0.25)
tr.at(17.75, ding(96, 0.9), 0.18)
# 3 · the dog
tr.at(20.35, scratch(), 0.5)
for k in range(5):
    tr.at(20.4 + k * 0.14, sine(220, 160, 0.06, 40), 0.25)  # paws
tr.at(21.0, boing(), 0.35)
tr.at(21.3, woof(), 0.5)
for k in range(12):  # chewing paper
    tr.at(21.9 + k * 0.15, lp(noise(0.1, 20), 0.5), 0.25)
tr.at(23.7, sine(110, 70, 0.4, 4) + lp(noise(0.4, 6), 0.6) * 0.3, 0.5)  # burp
tr.at(24.2, whoosh(0.6), 0.25)
# 4 · the tool
tr.at(25.5, whoosh(0.8), 0.35)
for a, b, n in ((26.9, 27.2, 3), (27.6, 28.0, 5), (28.4, 28.6, 3), (29.0, 29.2, 3), (29.6, 29.8, 3), (30.2, 30.4, 3), (31.0, 31.3, 4), (31.9, 32.2, 4), (32.8, 33.2, 5)):
    tr.at(a - 0.2, click(), 0.45)
    for k in range(n):
        tr.at(a + (b - a) * (k + 0.5) / n, hp(noise(0.03, 120), 0.7), 0.16)
for k, ts in enumerate((33.5, 33.7, 33.9, 34.1)):
    tr.at(ts, pop(600 + k * 80), 0.22)
tr.at(35.2, ding(88, 1.0), 0.25)  # break-even line
tr.at(35.4, ding(84, 0.8), 0.15)
tr.at(40.4, ding(91, 0.7), 0.18)
tr.at(45.5, sine(400, 140, 0.6, 3), 0.25)  # the loss
for k in range(4):
    tr.at(50.4 + k * 0.12, coin(), 0.2)
# 5 · open for business
tr.at(54.5, whoosh(0.9), 0.35)
tr.at(55.4, pop(500), 0.3)
for k in range(6):
    tr.at(55.25 + k * 0.14, sine(220, 160, 0.06, 40), 0.22)
tr.at(57.0, woof(), 0.5)
tr.at(57.1, ding(96, 0.5), 0.15)
# 6 · end card
tr.at(59.1, whoosh(0.8), 0.3)
tr.at(62.7, ding(91, 1.0), 0.2)

write(tr, Path(__file__).with_name("soundtrack.wav"))
