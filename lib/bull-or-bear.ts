// Bull or Bear? — a guessing game on the S&P 500's history (/tools/bull-or-bear).
//
// Each round shows a stretch of the index with the dates hidden and asks
// whether it was higher or lower 12 months later; the reveal draws the next
// year and names the period. Half the rounds sit just before a famous event,
// half are picked at random.
//
// UK MAR (CLAUDE.md): an index, past data only, nothing about what it will do
// next. The game's lesson is that a year ahead is hard to call — it never
// tells the player what to buy, sell or hold.

import data from "@/data/sp500-monthly.json";

export const SP500 = data as { source: string; start: string; closes: number[] };

/** Months of history shown before the guess (fewer only for the earliest rounds). */
export const SHOW_MONTHS = 36;
export const MIN_SHOW_MONTHS = 18;
/** The guess is about this many months after the last month shown. */
export const AHEAD_MONTHS = 12;
export const ROUNDS = 10;
/** Two rounds' guess points are at least this many months apart. */
const MIN_GAP_MONTHS = 24;

export interface MarketEvent {
  /** Month it happened, "YYYY-MM". */
  month: string;
  en: string;
  es: string;
}

export const EVENTS: MarketEvent[] = [
  { month: "1929-10", en: "The Wall Street Crash", es: "El crac de Wall Street" },
  { month: "1932-07", en: "The bottom of the Great Depression", es: "El fondo de la Gran Depresión" },
  { month: "1937-08", en: "The recession of 1937", es: "La recesión de 1937" },
  { month: "1941-12", en: "Pearl Harbor", es: "Pearl Harbor" },
  { month: "1945-08", en: "The end of the Second World War", es: "El fin de la Segunda Guerra Mundial" },
  { month: "1962-10", en: "The Cuban Missile Crisis", es: "La crisis de los misiles de Cuba" },
  { month: "1973-10", en: "The oil embargo", es: "El embargo del petróleo" },
  { month: "1979-10", en: "Volcker's interest-rate shock", es: "El shock de tipos de Volcker" },
  { month: "1982-08", en: "The start of the 1980s bull market", es: "El inicio del mercado alcista de los 80" },
  { month: "1987-10", en: "Black Monday", es: "El Lunes Negro" },
  { month: "1990-08", en: "Iraq invades Kuwait", es: "Irak invade Kuwait" },
  { month: "1998-08", en: "Russia defaults and LTCM collapses", es: "Rusia suspende pagos y cae LTCM" },
  { month: "2000-03", en: "The dot-com peak", es: "El pico de las puntocom" },
  { month: "2001-09", en: "The 9/11 attacks", es: "Los atentados del 11-S" },
  { month: "2003-03", en: "The Iraq War begins", es: "Empieza la guerra de Irak" },
  { month: "2008-09", en: "Lehman Brothers collapses", es: "Quiebra Lehman Brothers" },
  { month: "2009-03", en: "The bottom of the financial crisis", es: "El fondo de la crisis financiera" },
  { month: "2011-08", en: "The US loses its AAA rating", es: "EE. UU. pierde la AAA" },
  { month: "2016-06", en: "The Brexit vote", es: "El referéndum del Brexit" },
  { month: "2020-03", en: "The Covid-19 crash", es: "El crac del Covid-19" },
  { month: "2022-03", en: "The Fed starts raising rates against inflation", es: "La Fed empieza a subir tipos contra la inflación" },
  { month: "2022-11", en: "ChatGPT is launched", es: "Se lanza ChatGPT" },
  { month: "2025-04", en: "The US \"Liberation Day\" tariffs", es: "Los aranceles del \"Día de la Liberación\" de EE. UU." },
];

/** "1987-10" → its index in `closes` (month 0 is `start`). */
export function monthIndex(month: string, start = SP500.start): number {
  const [y, m] = month.split("-").map(Number);
  const [y0, m0] = start.split("-").map(Number);
  return (y - y0) * 12 + (m - m0);
}

/** Index in `closes` → "YYYY-MM". */
export function monthAt(i: number, start = SP500.start): string {
  const [y0, m0] = start.split("-").map(Number);
  const t = y0 * 12 + (m0 - 1) + i;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
}

export interface Round {
  /** First month shown. */
  from: number;
  /** Last month shown — the moment of the guess. */
  guess: number;
  /** The month the answer is read from: guess + AHEAD_MONTHS. */
  to: number;
  /** Change from `guess` to `to`, as a fraction (0.12 = +12%). */
  change: number;
  up: boolean;
  /** The famous event this round was built around, if any. */
  event: MarketEvent | null;
}

export function makeRound(closes: number[], guess: number, event: MarketEvent | null = null): Round {
  const from = Math.max(0, guess - (SHOW_MONTHS - 1));
  const to = guess + AHEAD_MONTHS;
  const change = closes[to] / closes[guess] - 1;
  return { from, guess, to, change, up: change >= 0, event };
}

/** Events that fall inside a round's whole window (shown months and the year after). */
export function eventsIn(round: Round, start = SP500.start): MarketEvent[] {
  return EVENTS.filter((e) => {
    const i = monthIndex(e.month, start);
    return i > round.from && i <= round.to;
  });
}

/**
 * A new game: half the rounds sit 1–6 months before a famous event (in a
 * random order of events), the rest at random months, no two guesses closer
 * than MIN_GAP_MONTHS. `rand` is injectable so tests can seed it.
 */
export function makeGame(closes: number[] = SP500.closes, rand: () => number = Math.random, rounds = ROUNDS, start = SP500.start): Round[] {
  const lastGuess = closes.length - 1 - AHEAD_MONTHS;
  const firstGuess = MIN_SHOW_MONTHS - 1;
  const taken: number[] = [];
  const free = (g: number) => g >= firstGuess && g <= lastGuess && taken.every((t) => Math.abs(t - g) >= MIN_GAP_MONTHS);
  const out: Round[] = [];

  const events = [...EVENTS].sort(() => rand() - 0.5);
  for (const e of events) {
    if (out.length >= Math.ceil(rounds / 2)) break;
    const g = monthIndex(e.month, start) - (1 + Math.floor(rand() * 6));
    if (!free(g)) continue;
    taken.push(g);
    out.push(makeRound(closes, g, e));
  }

  // Random months; the latest rounds use SHOW_MONTHS of history.
  for (let tries = 0; out.length < rounds && tries < 5000; tries++) {
    const g = SHOW_MONTHS - 1 + Math.floor(rand() * (lastGuess - SHOW_MONTHS + 2));
    if (!free(g)) continue;
    taken.push(g);
    out.push(makeRound(closes, g));
  }

  // Shuffle so famous and random rounds mix.
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Share of all months since the start after which the index was higher AHEAD_MONTHS later. */
export function upShare(closes: number[] = SP500.closes): number {
  let up = 0;
  const n = closes.length - AHEAD_MONTHS;
  for (let i = 0; i < n; i++) if (closes[i + AHEAD_MONTHS] >= closes[i]) up++;
  return up / n;
}

/** The title for a final score out of ROUNDS. */
export function rankKey(score: number, rounds = ROUNDS): "wizard" | "sharp" | "coin" | "contrarian" {
  const r = score / rounds;
  if (r >= 0.9) return "wizard";
  if (r >= 0.7) return "sharp";
  if (r >= 0.4) return "coin";
  return "contrarian";
}
