# Mortgage cartoon ("Sam pays it off")

Episode 2, 46.5 s, vertical 1080×1920 for Reels / TikTok / Shorts. Sam's first
mortgage payment leaves, the calendar flips to 2054, the bank's vacuum sucks up
£166,874 of interest — then a piggy bank: £227 a month on top of the mortgage,
and in 2049 the pot clears it five years early. The dog (who stole the keys in
episode 1) brings them back.

The finished videos are `public/mortgage-cartoon.mp4` and
`public/mortgage-cartoon-es.mp4`, shown on `/tools/lending` by `VideoTeaser`.

The figures are the Lending Calculator's own maths (its "Mortgage & Early
Repayment" tab) for £250,000 at 4.5% over 25 years with savings earning 3% —
see the comment at the top of `index.html`. Change the scenario and they need
re-working.

```sh
python3 music.py
node ../render.mjs mortgage-cartoon ../../public/mortgage-cartoon.mp4              # ~5 min each
node ../render.mjs mortgage-cartoon ../../public/mortgage-cartoon-es.mp4 --lang es
ffmpeg -ss 11.0 -i ../../public/mortgage-cartoon.mp4 -frames:v 1 -q:v 4 ../../public/mortgage-cartoon-poster.jpg
```

Built on `../kit.js` (timing, Sam, captions, language switch) and `../sound.py`
(the synth). Open `index.html` in a browser to watch; `?t=12.5` freezes on a
moment, `?lang=es` is the Spanish cut.
