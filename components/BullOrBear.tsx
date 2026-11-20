"use client";

// Bull or Bear? — the game on /tools/bull-or-bear. Rounds, events and the
// maths are in lib/bull-or-bear.ts; this file is the screen: a chart with the
// dates hidden, two buttons, an animated reveal and a final score.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";
import {
  SP500, ROUNDS, makeGame, eventsIn, monthAt, monthIndex, rankKey, upShare, type Round,
} from "@/lib/bull-or-bear";

const BEST_KEY = "financeplots:bull-or-bear:best";
const REVEAL_MS = 1600;

type Phase = "intro" | "guess" | "reveal" | "done";

// The visitor's best score, kept in localStorage (and in memory when storage
// is blocked), read through useSyncExternalStore.
let memBest: number | null = null;
const bestListeners = new Set<() => void>();

function readBest(): number | null {
  try {
    const v = localStorage.getItem(BEST_KEY);
    return v === null ? memBest : Number(v);
  } catch {
    return memBest;
  }
}

function saveBest(n: number) {
  memBest = n;
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {
    // Private mode: remembered for this visit only.
  }
  bestListeners.forEach((l) => l());
}

function subscribeBest(l: () => void) {
  bestListeners.add(l);
  return () => { bestListeners.delete(l); };
}

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const pct = (x: number) => `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(1)}%`;

function useMonthLabel() {
  const locale = useLocale();
  return useCallback(
    (i: number, withMonth = true) => {
      const [y, m] = monthAt(i).split("-").map(Number);
      return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
        month: withMonth ? "short" : undefined, year: "numeric", timeZone: "UTC",
      });
    },
    [locale],
  );
}

// ── Chart ────────────────────────────────────────────────────────────────────

const W = 640;
const H = 300;
const PAD = { l: 14, r: 64, t: 22, b: 34 };

function Chart({ round, progress, revealed }: { round: Round; progress: number; revealed: boolean }) {
  const t = useTranslations("bullOrBear");
  const label = useMonthLabel();
  const locale = useLocale();
  const closes = SP500.closes;
  const base = closes[round.guess];
  const norm = (i: number) => (closes[i] / base) * 100;

  const shownIdx = useMemo(() => {
    const a: number[] = [];
    for (let i = round.from; i <= round.guess; i++) a.push(i);
    return a;
  }, [round]);
  const aheadIdx = useMemo(() => {
    const a: number[] = [];
    for (let i = round.guess; i <= round.to; i++) a.push(i);
    return a;
  }, [round]);

  // The y-range shown while guessing comes from the shown months only, so the
  // empty space can't give the answer away; the reveal eases it out to fit the
  // year after.
  const range = (idx: number[]) => {
    const v = idx.map(norm);
    const lo = Math.min(...v);
    const hi = Math.max(...v);
    const pad = (hi - lo) * 0.12 || 5;
    return [lo - pad, hi + pad];
  };
  const [lo0, hi0] = range(shownIdx);
  const [lo1, hi1] = range([...shownIdx, ...aheadIdx]);
  const k = ease(progress * 1.6);
  const lo = lo0 + (lo1 - lo0) * k;
  const hi = hi0 + (hi1 - hi0) * k;

  const span = round.to - round.from;
  const x = (i: number) => PAD.l + ((i - round.from) / span) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const path = (idx: number[]) => idx.map((i, n) => `${n ? "L" : "M"}${x(i).toFixed(1)},${y(norm(i)).toFixed(1)}`).join("");

  // The year after is drawn month by month once the scale has settled a little.
  const drawn = Math.max(0, Math.min(1, (progress - 0.25) / 0.75));
  const aheadCount = Math.floor(drawn * (aheadIdx.length - 1)) + 1;
  const aheadShown = aheadIdx.slice(0, aheadCount);
  const tip = aheadShown[aheadShown.length - 1];
  const finished = revealed && progress >= 1;

  const gx = x(round.guess);
  const events = finished ? eventsIn(round) : [];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label={t("chartLabel")}>
      {/* The year ahead */}
      <rect x={gx} y={PAD.t - 8} width={W - PAD.r - gx + 8} height={H - PAD.t - PAD.b + 16} rx={10} fill="#1e293b" opacity={revealed ? 0.35 : 0.6} />
      {!revealed && (
        <>
          <text x={(gx + W - PAD.r) / 2} y={H / 2 + 4} textAnchor="middle" fontSize={64} fontWeight={800} fill="#475569">?</text>
          <text x={(gx + W - PAD.r) / 2} y={H / 2 + 34} textAnchor="middle" fontSize={16} fill="#64748b">{t("nextYear")}</text>
        </>
      )}
      <line x1={gx} x2={gx} y1={PAD.t - 8} y2={H - PAD.b + 8} stroke="#64748b" strokeDasharray="4 4" />

      {/* What was shown */}
      <path d={path(shownIdx)} fill="none" stroke="#60a5fa" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={gx} cy={y(100)} r={5} fill="#60a5fa" stroke="#0a0f1e" strokeWidth={2} />

      {/* What happened next */}
      {revealed && aheadShown.length > 1 && (
        <>
          <path d={path(aheadShown)} fill="none" stroke="#f59e0b" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={x(tip)} cy={y(norm(tip))} r={5} fill="#f59e0b" stroke="#0a0f1e" strokeWidth={2} />
          <text x={x(tip) + 9} y={y(norm(tip)) + 4} fontSize={15} fontWeight={800} fill="#f59e0b">
            {norm(tip) >= 100 ? "▲" : "▼"} {Math.abs(norm(tip) - 100).toFixed(0)}%
          </text>
        </>
      )}

      {/* Events in the window */}
      {events.map((e) => {
        const i = monthIndex(e.month);
        return (
          <g key={e.month}>
            <circle cx={x(i)} cy={y(norm(i))} r={7} fill="none" stroke="#e2e8f0" strokeWidth={1.5} />
            <circle cx={x(i)} cy={y(norm(i))} r={2.5} fill="#e2e8f0" />
          </g>
        );
      })}

      {/* Dates, only once the answer is in */}
      {finished ? (
        <g fontSize={16} fill="#94a3b8">
          <text x={PAD.l} y={H - 10}>{label(round.from)}</text>
          <text x={gx} y={H - 10} textAnchor="middle" fill="#cbd5e1" fontWeight={700}>{label(round.guess)}</text>
          <text x={W - PAD.r + 8} y={H - 10} textAnchor="end">{label(round.to)}</text>
        </g>
      ) : (
        <g fontSize={16} fill="#64748b">
          <text x={PAD.l} y={H - 10}>{t("yearsAgo", { n: Math.round((round.guess - round.from) / 12) })}</text>
          <text x={gx} y={H - 10} textAnchor="middle" fill="#cbd5e1" fontWeight={700}>{t("youAreHere")}</text>
        </g>
      )}
      <title>{locale === "es" ? "Gráfico del S&P 500" : "S&P 500 chart"}</title>
    </svg>
  );
}

// ── Emoji burst on a right answer ────────────────────────────────────────────

function Burst({ emoji, seed }: { emoji: string; seed: number }) {
  const bits = useMemo(
    () => Array.from({ length: 14 }, (_, n) => ({
      left: 10 + ((n * 37 + seed * 13) % 80),
      delay: (n % 7) * 70,
      size: 20 + ((n * 11) % 18),
      drift: ((n * 29) % 60) - 30,
    })),
    [seed],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.map((b, n) => (
        <span
          key={`${seed}-${n}`}
          className="bob-float absolute bottom-0"
          style={{ left: `${b.left}%`, fontSize: b.size, animationDelay: `${b.delay}ms`, ["--drift" as string]: `${b.drift}px` }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

// ── The game ─────────────────────────────────────────────────────────────────

export default function BullOrBear() {
  const t = useTranslations("bullOrBear");
  const locale = useLocale();
  const label = useMonthLabel();
  const [phase, setPhase] = useState<Phase>("intro");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [n, setN] = useState(0);
  const [guesses, setGuesses] = useState<boolean[]>([]);
  const [progress, setProgress] = useState(0);
  const best = useSyncExternalStore(subscribeBest, readBest, () => null);
  const [copied, setCopied] = useState(false);
  const raf = useRef<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Each new round and the final score start at the top of the game, below the fixed bars.
  useEffect(() => {
    if (phase === "intro" || phase === "reveal") return;
    const el = box.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 120 || top > window.innerHeight * 0.4) {
      window.scrollTo({ top: Math.max(0, top + window.scrollY - 150), behavior: "smooth" });
    }
  }, [phase, n]);

  const round = rounds[n];
  const score = guesses.filter((g, i) => g === rounds[i]?.up).length;
  const streak = useMemo(() => {
    let s = 0;
    for (let i = guesses.length - 1; i >= 0 && guesses[i] === rounds[i]?.up; i--) s++;
    return s;
  }, [guesses, rounds]);

  const start = useCallback(() => {
    setRounds(makeGame());
    setN(0);
    setGuesses([]);
    setProgress(0);
    setPhase("guess");
  }, []);

  const guess = useCallback((up: boolean) => {
    if (phase !== "guess") return;
    setGuesses((g) => [...g, up]);
    setPhase("reveal");
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / REVEAL_MS);
      setProgress(p);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    // Browsers pause animation frames in a background tab; the answer still lands.
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (raf.current) cancelAnimationFrame(raf.current);
      setProgress(1);
    }, REVEAL_MS + 150);
  }, [phase]);

  const next = useCallback(() => {
    if (phase !== "reveal" || progress < 1) return;
    if (n + 1 < rounds.length) {
      setN(n + 1);
      setProgress(0);
      setPhase("guess");
      return;
    }
    const final = guesses.filter((g, i) => g === rounds[i].up).length;
    if (best === null || final > best) saveBest(final);
    trackEvent("game_done");
    setPhase("done");
  }, [phase, progress, n, rounds, guesses, best]);

  // Keyboard: ↑ bull, ↓ bear, Enter/Space for the next round.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (phase === "guess" && e.key === "ArrowUp") { e.preventDefault(); guess(true); }
      else if (phase === "guess" && e.key === "ArrowDown") { e.preventDefault(); guess(false); }
      else if (phase === "reveal" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); next(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, guess, next]);

  const pageUrl = `https://www.financeplots.com${locale === "es" ? "/es" : ""}/tools/bull-or-bear`;
  const shareText = t("shareText", { score, rounds: ROUNDS });
  const share = async () => {
    trackEvent("share_link");
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText, url: pageUrl });
        return;
      }
    } catch {
      return; // cancelled
    }
    try {
      await navigator.clipboard.writeText(`${shareText} ${pageUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard: the X link is still there.
    }
  };

  const allUp = rounds.filter((r) => r.up).length;
  const historyUp = Math.round(upShare() * 100);
  const firstYear = monthAt(1).slice(0, 4); // the data starts with Dec 1927, the game with 1928

  // ── Screens ──

  if (phase === "intro") {
    return (
      <div ref={box} className="relative bg-[#0d1426] border border-gray-800 rounded-2xl p-6 sm:p-10 text-center overflow-hidden">
        <div className="text-6xl sm:text-7xl mb-4" aria-hidden>🐂 <span className="text-gray-600 text-4xl align-middle">{t("or")}</span> 🐻</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t("introTitle")}</h2>
        <p className="text-gray-400 max-w-lg mx-auto mb-2">{t("introText", { rounds: ROUNDS })}</p>
        <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">{t("introSmall")}</p>
        <button onClick={start} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-10 py-4 rounded-xl transition shadow-lg shadow-blue-900/40">
          {t("play")}
        </button>
        {best !== null && <p className="text-gray-500 text-sm mt-4">{t("yourBest", { score: best, rounds: ROUNDS })}</p>}
      </div>
    );
  }

  if (phase === "done") {
    const rank = rankKey(score);
    return (
      <div ref={box} className="flex flex-col gap-6">
        <div className="relative bg-[#0d1426] border border-gray-800 rounded-2xl p-6 sm:p-10 text-center overflow-hidden">
          {score >= 7 && <Burst emoji="🐂" seed={99} />}
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">{t("finalLabel")}</p>
          <div className="text-6xl sm:text-7xl font-extrabold mb-2">{score}<span className="text-gray-600 text-4xl">/{ROUNDS}</span></div>
          <h2 className="text-2xl font-extrabold mb-2">{t(`rank.${rank}.title`)}</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">{t(`rank.${rank}.text`)}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={start} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition">{t("playAgain")}</button>
            <button onClick={share} className="bg-[#1e293b] hover:bg-[#334155] text-white font-bold px-6 py-3 rounded-xl transition">{copied ? t("copied") : t("share")}</button>
            <a
              href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => trackEvent("share_link", { via: "x" })}
              className="bg-[#1e293b] hover:bg-[#334155] text-white font-bold px-6 py-3 rounded-xl transition"
            >
              {t("postOnX")}
            </a>
          </div>
          {best !== null && <p className="text-gray-500 text-sm mt-4">{t("yourBest", { score: best, rounds: ROUNDS })}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
            <div className="text-3xl font-extrabold text-amber-400 mb-1">{allUp}/{ROUNDS}</div>
            <p className="text-gray-400 text-sm">{t("alwaysUp", { score: allUp, rounds: ROUNDS })}</p>
          </div>
          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
            <div className="text-3xl font-extrabold text-amber-400 mb-1">{historyUp}%</div>
            <p className="text-gray-400 text-sm">{t("historyUp", { pct: historyUp, year: firstYear })}</p>
          </div>
        </div>

        <div className="bg-[#0d1426] border border-gray-800 rounded-xl overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 px-5 pt-5 pb-3">{t("yourRounds")}</h3>
          <ul className="divide-y divide-gray-800">
            {rounds.map((r, i) => {
              const right = guesses[i] === r.up;
              const ev = r.event ?? eventsIn(r)[0];
              return (
                <li key={i} className="px-5 py-3 flex items-center gap-3 text-sm">
                  <span className="text-lg w-6 shrink-0" aria-label={right ? t("right") : t("wrong")}>{right ? "✅" : "❌"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold text-white">{label(r.guess)} → {label(r.to)}</span>
                    {ev && <span className="block text-gray-500 truncate">{ev[locale === "es" ? "es" : "en"]}</span>}
                  </span>
                  <span className="text-gray-500 shrink-0">{guesses[i] ? "🐂" : "🐻"}</span>
                  <span className="font-bold tabular-nums shrink-0 w-16 text-right">{r.up ? "▲" : "▼"} {pct(r.change).slice(1)}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 text-sm text-gray-400 leading-relaxed">
          <p className="mb-3">{t("lesson")}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/tools/compound-interest" className="text-blue-400 hover:text-blue-300 font-semibold">{t("linkCompound")} →</Link>
            <Link href="/blog/howard-marks-market-cycles" className="text-blue-400 hover:text-blue-300 font-semibold">{t("linkCycles")} →</Link>
          </div>
        </div>
      </div>
    );
  }

  // guess / reveal
  const lastRight = phase === "reveal" && guesses[n] === round.up;
  const finished = phase === "reveal" && progress >= 1;
  const shownYears = Math.round((round.guess - round.from) / 12);
  const mainEvent = round.event ?? eventsIn(round)[0] ?? null;
  const otherEvents = eventsIn(round).filter((e) => e !== mainEvent);

  return (
    <div ref={box} className="flex flex-col gap-4">
      {/* Score bar */}
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-1.5" aria-label={t("roundOf", { n: n + 1, rounds: ROUNDS })}>
          {rounds.map((r, i) => (
            <span
              key={i}
              className={`h-2.5 w-5 sm:w-7 rounded-full transition ${
                i < guesses.length ? (guesses[i] === r.up ? "bg-emerald-500" : "bg-rose-500") : i === n ? "bg-blue-500" : "bg-gray-700"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {streak >= 2 && <span className="text-amber-400 font-bold">🔥 {streak}</span>}
          <span className="font-bold">{score}<span className="text-gray-500">/{guesses.length}</span></span>
        </div>
      </div>

      <div className={`relative bg-[#0d1426] border rounded-2xl p-4 sm:p-6 overflow-hidden transition-colors ${
        finished ? (lastRight ? "border-emerald-500/60" : "border-rose-500/60") : "border-gray-800"
      }`}>
        {finished && lastRight && <Burst emoji={round.up ? "🐂" : "🐻"} seed={n} />}
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{t("roundOf", { n: n + 1, rounds: ROUNDS })}</p>
        <h2 className="text-lg sm:text-xl font-bold mb-3">
          {phase === "guess" ? t("question", { years: shownYears }) : finished ? (lastRight ? t("right") : t("wrong")) : t("revealing")}
        </h2>
        <Chart round={round} progress={phase === "reveal" ? progress : 0} revealed={phase === "reveal"} />

        {phase === "guess" ? (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button onClick={() => guess(true)} className="group bg-emerald-600/15 hover:bg-emerald-600/30 border border-emerald-600/50 rounded-xl py-4 transition">
              <div className="text-3xl mb-1 group-hover:scale-110 transition">🐂</div>
              <div className="font-bold text-emerald-300">{t("bull")}</div>
              <div className="text-xs text-gray-400">{t("bullHint")}</div>
            </button>
            <button onClick={() => guess(false)} className="group bg-rose-600/15 hover:bg-rose-600/30 border border-rose-600/50 rounded-xl py-4 transition">
              <div className="text-3xl mb-1 group-hover:scale-110 transition">🐻</div>
              <div className="font-bold text-rose-300">{t("bear")}</div>
              <div className="text-xs text-gray-400">{t("bearHint")}</div>
            </button>
          </div>
        ) : (
          <div className={`mt-4 transition-opacity duration-300 ${finished ? "opacity-100" : "opacity-0"}`}>
            <p className="text-gray-300">
              {t("result", { from: label(round.guess), to: label(round.to), change: pct(round.change) })}
            </p>
            {mainEvent && (
              <p className="mt-2 text-white font-semibold">
                📍 {mainEvent[locale === "es" ? "es" : "en"]} <span className="text-gray-500 font-normal">· {label(monthIndex(mainEvent.month))}</span>
              </p>
            )}
            {otherEvents.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {t("alsoInWindow")} {otherEvents.map((e) => `${e[locale === "es" ? "es" : "en"]} (${label(monthIndex(e.month), false)})`).join(" · ")}
              </p>
            )}
            <button onClick={next} disabled={!finished} className="mt-4 w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition">
              {n + 1 < rounds.length ? t("next") : t("seeScore")}
            </button>
          </div>
        )}
      </div>
      <p className="text-center text-xs text-gray-600 hidden sm:block">{t("keys")}</p>
    </div>
  );
}
