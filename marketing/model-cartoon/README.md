# 5-year model cartoon ("Sam meets the bank")

Episode 3, 46.5 s, vertical 1080×1920 for Reels / TikTok / Shorts. Sam wants a
loan for a coffee roastery; the bank manager asks for a 5-year plan. Sam's is
on a napkin ("Year 5: world domination") — REJECTED — and the dog eats it.
Sam builds a real one in the 5-Year Financial Model: sales and margins, then
the cash flow, where year 2 makes £31,125 profit but cash only grows £11,094
(customers pay in 45 days; new kit and the loan eat the rest). Back at the
bank with a PDF: "Now THAT's a plan. Let's talk." The dog applies for a job.

The finished videos are `public/model-cartoon.mp4` and
`public/model-cartoon-es.mp4`, shown on `/tools/financial-model` by
`VideoTeaser`. Every figure is that page's own maths for the inputs listed at
the top of `index.html` — change them and the figures need re-working.

```sh
python3 music.py
node ../render.mjs model-cartoon ../../public/model-cartoon.mp4              # ~5 min each
node ../render.mjs model-cartoon ../../public/model-cartoon-es.mp4 --lang es
ffmpeg -ss 7.6 -i ../../public/model-cartoon.mp4 -frames:v 1 -q:v 4 ../../public/model-cartoon-poster.jpg
```

Built on `../kit.js` and `../sound.py`. Open `index.html` in a browser to
watch; `?t=12.5` freezes on a moment, `?lang=es` is the Spanish cut.
