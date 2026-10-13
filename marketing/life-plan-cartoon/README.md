# Life Plan cartoon

A 44-second vertical (1080×1920, 30 fps) cartoon for Reels / TikTok / Shorts:
Mum texts "so… when are you buying a house?", Sam daydreams (a mansion with a
helicopter — LOL NO — then a normal home, a baby, a beach), panics, builds the
plan in Life Plan, tries a Plan B, and lives it… until the dog steals the keys.

The finished video is `public/life-plan-cartoon.mp4`.

- `index.html` — the animation. Open it in a browser to watch (click restarts;
  `?t=12.5` freezes on a moment). Every frame is `render(t)`, a pure function
  of time.
- `music.py` — synthesises the soundtrack (ukulele loop + cartoon effects,
  nothing to license) into `soundtrack.wav`.
- `render.mjs` — steps `render(t)` in headless Chromium and pipes the frames to
  ffmpeg, muxing the soundtrack. `--stills 1,7,25` writes single frames instead.

```sh
python3 music.py && node render.mjs ../../public/life-plan-cartoon.mp4   # ~5 min
```

The figures on screen are the real output of the `life_plan` tool for the
scenario in the comment at the top of `index.html`; change the scenario and
they need re-running. Neutral like the tool: plan colours follow position
(A blue, B orange), the difference shows with ▲, nothing is called better.
