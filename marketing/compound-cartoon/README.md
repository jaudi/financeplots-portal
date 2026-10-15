# Compound interest cartoon ("Sam starts at 25")

Episode 3, 68 s, vertical 1080×1920 for Reels / TikTok / Shorts. Sam, 25,
invests a first £200; a year later the jar holds £2,467 ("that's… it?"). A
snowball rolls down a hill — interest on interest — then Sam runs the
Compound Interest calculator: £200 a month for 40 years at an assumed 6% is
£398,298 from £96,000 paid in, £302,298 of it interest. Then the slider goes
back to 30 years: starting at 35 instead means £24,000 less paid in and
£197,395 less at 65. At 65, on a beach, the dog takes the keys again.

Paced slower than episodes 1–2 so people can read it: each caption stays up
about 4.5 s.

The finished videos are `public/compound-cartoon.mp4` and
`public/compound-cartoon-es.mp4`, shown on `/tools/compound-interest` by
`VideoTeaser`. The figures are `compoundGrowth()` in `lib/calculators.ts` for
the scenario in the comment at the top of `index.html`; change the scenario
and they need re-working.

```sh
python3 music.py
node ../render.mjs compound-cartoon ../../public/compound-cartoon.mp4              # ~10 min each
node ../render.mjs compound-cartoon ../../public/compound-cartoon-es.mp4 --lang es
ffmpeg -ss 13.5 -i ../../public/compound-cartoon.mp4 -frames:v 1 -q:v 4 ../../public/compound-cartoon-poster.jpg
ffmpeg -ss 13.5 -i ../../public/compound-cartoon-es.mp4 -frames:v 1 -q:v 4 ../../public/compound-cartoon-es-poster.jpg
```

Built on `../kit.js` and `../sound.py`. Open `index.html` in a browser to
watch; `?t=12.5` freezes on a moment, `?lang=es` is the Spanish cut.
