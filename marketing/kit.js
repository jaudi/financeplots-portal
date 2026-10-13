/* eslint-disable @typescript-eslint/no-unused-vars -- a classic <script>: every name here is used by the cartoon pages that load it. */
// Shared pieces for the FinancePlots cartoons (marketing/<name>/index.html):
// timing and easing, the language switch, Sam's head, captions and the
// boot code that either plays the animation or waits for render.mjs.
// Every page defines its scenes as render(t), a pure function of time.
//
// The Life Plan cartoon predates this file and carries its own copy.

// ---------- language ----------
const LANG = new URLSearchParams(location.search).get("lang") === "es" ? "es" : "en";
let ES = {};
/** The Spanish string for `key` on ?lang=es, else the English one given. */
const L = (key, en) => (LANG === "es" && key in ES ? ES[key] : en);
/** Swap every [data-l] element's content for its Spanish string. */
function applyLang() {
  document.documentElement.lang = LANG;
  if (LANG === "en") return;
  document.querySelectorAll("[data-l]").forEach(el => { if (el.dataset.l in ES) el.innerHTML = ES[el.dataset.l]; });
}

// ---------- timing ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const p = (t, a, b) => clamp((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c1 = 1.9, c3 = c1 + 1; return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const pop = (t, a, d = .5) => back(p(t, a, a + d));
const lerp = (a, b, x) => a + (b - a) * x;
/** Fade in at a, out at b (seconds), with f-second ramps. */
const win = (t, a, b, f = .3) => Math.min(p(t, a, a + f), 1 - p(t, b - f, b));
const $ = id => document.getElementById(id);
function css(el, o, tf) { if (o !== undefined) el.style.opacity = o; if (tf !== undefined) el.style.transform = tf; }
/** Keyframes [[t, value], …] with easing between them; values may be arrays. */
function keys(t, ks, ease = eio) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) {
    const [t0, v0] = ks[i - 1], [t1, v1] = ks[i], x = ease((t - t0) / (t1 - t0));
    return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], x)) : lerp(v0, v1, x);
  }
  return ks[ks.length - 1][1];
}
const blinkAt = (t, times) => times.some(b => t > b && t < b + .14) ? .1 : 1;

// ---------- Sam ----------
const SKIN = "#e3a87c", SKIN_D = "#c98a5f", HAIR = "#3a2216", HOODIE = "#ff7a59", HOODIE_D = "#e3603f", SLEEVE = "#f26a48", SLEEVE_LINE = "#c4492b";
/** A head at (cx, cy), radius r; parts get ids prefixed with `k` (kHead, kHair, kEyes, kPupils, kBrowL/R, kMouth, kGlasses). */
function head(k, cx, cy, r) {
  const curls = [];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI * (1.02 + i * .96 / 12);
    curls.push(`<circle cx="${cx + Math.cos(a) * r * .9}" cy="${cy + Math.sin(a) * r * .86 - r * .06}" r="${r * .3}"/>`);
  }
  return `<g id="${k}Head">
    <rect x="${cx - r * .28}" y="${cy + r * .7}" width="${r * .56}" height="${r * .55}" rx="${r * .2}" fill="${SKIN_D}"/>
    <circle cx="${cx - r * .98}" cy="${cy + r * .05}" r="${r * .2}" fill="${SKIN}"/><circle cx="${cx + r * .98}" cy="${cy + r * .05}" r="${r * .2}" fill="${SKIN}"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 1.02}" fill="${SKIN}"/>
    <g id="${k}Hair" fill="${HAIR}">${curls.join("")}
      <circle cx="${cx - r * .62}" cy="${cy - r * .5}" r="${r * .34}"/><circle cx="${cx + r * .55}" cy="${cy - r * .55}" r="${r * .36}"/></g>
    <ellipse cx="${cx - r * .55}" cy="${cy + r * .32}" rx="${r * .17}" ry="${r * .1}" fill="#ff8a80" opacity=".55"/>
    <ellipse cx="${cx + r * .55}" cy="${cy + r * .32}" rx="${r * .17}" ry="${r * .1}" fill="#ff8a80" opacity=".55"/>
    <path class="noorigin" id="${k}BrowL" d="M${cx - r * .52} ${cy - r * .27} q${r * .17} ${-r * .12} ${r * .34} 0" stroke="${HAIR}" stroke-width="${r * .08}" fill="none" stroke-linecap="round"/>
    <path class="noorigin" id="${k}BrowR" d="M${cx + r * .18} ${cy - r * .27} q${r * .17} ${-r * .12} ${r * .34} 0" stroke="${HAIR}" stroke-width="${r * .08}" fill="none" stroke-linecap="round"/>
    <g id="${k}Eyes">
      <ellipse cx="${cx - r * .35}" cy="${cy + r * .02}" rx="${r * .17}" ry="${r * .21}" fill="#fff"/>
      <ellipse cx="${cx + r * .35}" cy="${cy + r * .02}" rx="${r * .17}" ry="${r * .21}" fill="#fff"/>
      <g id="${k}Pupils" class="noorigin"><circle cx="${cx - r * .35}" cy="${cy + r * .04}" r="${r * .1}" fill="#1b1b2f"/><circle cx="${cx + r * .35}" cy="${cy + r * .04}" r="${r * .1}" fill="#1b1b2f"/>
        <circle cx="${cx - r * .31}" cy="${cy}" r="${r * .035}" fill="#fff"/><circle cx="${cx + r * .39}" cy="${cy}" r="${r * .035}" fill="#fff"/></g>
    </g>
    <g id="${k}Glasses" opacity="0" fill="none" stroke="#1b1b2f" stroke-width="${r * .05}">
      <circle cx="${cx - r * .35}" cy="${cy + r * .02}" r="${r * .25}"/><circle cx="${cx + r * .35}" cy="${cy + r * .02}" r="${r * .25}"/><path d="M${cx - r * .1} ${cy} h${r * .2}"/></g>
    <path id="${k}Mouth" d="" stroke="#7a2e1f" stroke-width="${r * .07}" fill="#7a2e1f" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}
/** Mouth shapes: "smile" (amt 0 → 1 = flat → grin), "o", or "frown". */
function mouth(cx, cy, r, kind, amt = 1) {
  const y = cy + r * .5, w = r * .3;
  if (kind === "o") return `M${cx} ${y - r * .08} a${r * .09 * amt} ${r * .12 * amt} 0 1 0 0.1 0 z`;
  if (kind === "frown") return `M${cx - w * .8} ${y + r * .06} Q${cx} ${y - r * .12} ${cx + w * .8} ${y + r * .06}`;
  const d = r * (.06 + .2 * amt);
  return `M${cx - w} ${y - r * .04} Q${cx} ${y + d} ${cx + w} ${y - r * .04} Q${cx} ${y + d * .35} ${cx - w} ${y - r * .04} z`;
}
/** Mix two #rrggbb colours. */
function mix(a, b, x) {
  const ca = a.match(/\w\w/g).map(h => parseInt(h, 16)), cb = b.match(/\w\w/g).map(h => parseInt(h, 16));
  return "#" + ca.map((v, i) => Math.round(lerp(v, cb[i], x)).toString(16).padStart(2, "0")).join("");
}
function armPath(sx, sy, ex, ey, hx, hy) { return `M${sx} ${sy} L${ex} ${ey} L${hx} ${hy}`; }
/** Sam's hoodie torso seated at a desk/sofa, head at (cx, cy) radius r (the room cartoon's proportions). */
function torso(cx, cy, r) {
  const s = r / 112, X = v => cx + (v - 540) * s, Y = v => cy + (v - 900) * s;
  return `<ellipse cx="${X(540)}" cy="${Y(1052)}" rx="${118 * s}" ry="${34 * s}" fill="${HOODIE_D}"/>
    <path d="M${X(392)} ${Y(1130)} Q${X(398)} ${Y(1068)} ${X(486)} ${Y(1046)} Q${X(540)} ${Y(1074)} ${X(594)} ${Y(1046)} Q${X(682)} ${Y(1068)} ${X(688)} ${Y(1130)} L${X(694)} ${Y(1330)} L${X(386)} ${Y(1330)} Z" fill="${HOODIE}"/>
    <path d="M${X(488)} ${Y(1046)} Q${X(540)} ${Y(1082)} ${X(592)} ${Y(1046)}" stroke="${HOODIE_D}" stroke-width="${14 * s}" fill="none" stroke-linecap="round"/>
    <path d="M${X(522)} ${Y(1074)} L${X(518)} ${Y(1150)} M${X(558)} ${Y(1074)} L${X(562)} ${Y(1150)}" stroke="#fff" stroke-width="${6 * s}" stroke-linecap="round" opacity=".8"/>`;
}
function dogArt(id, x, y, s = 1) {
  return `<g id="${id}" class="noorigin" transform="translate(${x} ${y}) scale(${s})"><g id="${id}Body">
    <path id="${id}Tail" class="noorigin" d="M60 -20 q40 -30 40 -70" stroke="#c98a5f" stroke-width="16" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="0" rx="80" ry="46" fill="#e0b07c"/>
    <rect x="-60" y="10" width="22" height="58" rx="10" fill="#e0b07c"/><rect x="30" y="10" width="22" height="58" rx="10" fill="#e0b07c"/>
    <circle cx="-70" cy="-60" r="46" fill="#e0b07c"/><ellipse cx="-98" cy="-70" rx="18" ry="34" fill="#a8744a" transform="rotate(20 -98 -70)" class="noorigin"/>
    <circle cx="-60" cy="-70" r="7" fill="#1b1b2f"/><circle cx="-104" cy="-45" r="9" fill="#1b1b2f"/>
    <path d="M-90 -30 q14 16 26 2" stroke="#7a2e1f" stroke-width="5" fill="none" stroke-linecap="round"/></g></g>`;
}
function keysArt(id) {
  return `<g id="${id}" class="noorigin"><circle cx="0" cy="0" r="16" fill="none" stroke="#ffcf5a" stroke-width="7"/><rect x="-6" y="12" width="12" height="46" rx="4" fill="#ffcf5a"/>
    <rect x="2" y="44" width="16" height="8" fill="#ffcf5a"/><rect x="2" y="30" width="12" height="8" fill="#ffcf5a"/></g>`;
}
function piggyArt(id, cx, cy, s = 1) {
  return `<g id="${id}" class="noorigin" transform="translate(${cx} ${cy}) scale(${s})">
    <ellipse cx="0" cy="0" rx="120" ry="92" fill="#ff9ec4"/>
    <circle cx="96" cy="-20" r="46" fill="#ff9ec4"/><ellipse cx="132" cy="-14" rx="24" ry="20" fill="#ff7fb0"/>
    <circle cx="126" cy="-16" r="5" fill="#b0436f"/><circle cx="140" cy="-12" r="5" fill="#b0436f"/>
    <circle cx="100" cy="-44" r="7" fill="#1b1b2f"/><path d="M70 -70 l14 -34 l18 30 z" fill="#ff7fb0"/>
    <rect x="-70" y="70" width="26" height="40" rx="10" fill="#ff7fb0"/><rect x="40" y="70" width="26" height="40" rx="10" fill="#ff7fb0"/>
    <path d="M-120 -10 q-30 -10 -24 -36" stroke="#ff7fb0" stroke-width="10" fill="none" stroke-linecap="round"/>
    <rect x="-36" y="-96" width="72" height="12" rx="6" fill="#b0436f"/></g>`;
}

// ---------- captions ----------
let CAPS = [];
let lastCap = null;
function renderCaps(t) {
  const c = CAPS.find(([a, b]) => t >= a && t < b);
  if (c !== lastCap) { $("capText").innerHTML = c ? c[2] : ""; lastCap = c; }
  $("cap").style.opacity = c ? win(t, c[0], c[1], .25) : 0;
  $("cap").style.transform = c ? `translateY(${(1 - eo(p(t, c[0], c[0] + .3))) * 24}px)` : "";
  $("capText").style.display = c ? "" : "none";
}

// ---------- boot ----------
/** Call once the page has built its scenes: plays in a browser, or waits for render.mjs (?capture). */
function boot(render, duration) {
  window.render = render; window.DURATION = duration;
  const fitEl = $("fit");
  const q = new URLSearchParams(location.search);
  if (q.has("capture")) { fitEl.style.left = "0"; fitEl.style.top = "0"; render(0); return; }
  const fit = () => { const s = Math.min(innerWidth / 1080, innerHeight / 1920); fitEl.style.transform = `scale(${s}) translate(-50%, -50%)`; };
  addEventListener("resize", fit); fit();
  if (q.has("t")) { render(+q.get("t")); return; }
  let start = performance.now();
  addEventListener("click", () => start = performance.now());
  const loop = now => { render(((now - start) / 1000) % (duration + 1)); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
