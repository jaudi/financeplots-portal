# Break-even cartoon ("Sam's coffee bike")

Episode 4, 67 s, vertical 1080×1920 for Reels / TikTok / Shorts. Sam starts a
coffee bike and works out by hand how many coffees a month cover the costs:
£3,300 of fixed costs ÷ £3.50 a coffee = 943. The dog eats the page. Sam does
it again in the Break-Even Analysis tool: each coffee costs £1.30 to make, so
only £2.20 of it pays the fixed costs and break-even is 1,500 coffees — at
943 Sam would lose £1,225 a month. Good dog.

Paced like episode 3: each caption stays up about 4.5 s.

The finished videos are `public/break-even-cartoon.mp4` and
`public/break-even-cartoon-es.mp4`, shown on `/tools/break-even` by
`VideoTeaser`. The figures are `breakEven()` in `lib/calculators.ts` for the
scenario in the comment at the top of `index.html`; change the scenario and
they need re-working.

```sh
python3 music.py
node ../render.mjs break-even-cartoon ../../public/break-even-cartoon.mp4              # ~10 min each
node ../render.mjs break-even-cartoon ../../public/break-even-cartoon-es.mp4 --lang es
ffmpeg -ss 22.6 -i ../../public/break-even-cartoon.mp4 -frames:v 1 -q:v 4 ../../public/break-even-cartoon-poster.jpg
ffmpeg -ss 22.6 -i ../../public/break-even-cartoon-es.mp4 -frames:v 1 -q:v 4 ../../public/break-even-cartoon-es-poster.jpg
```

Built on `../kit.js` and `../sound.py`. Open `index.html` in a browser to
watch; `?t=12.5` freezes on a moment, `?lang=es` is the Spanish cut.
