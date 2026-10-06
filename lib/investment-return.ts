// The "real return" calculator: dated money in and out of an investment plus
// what it is worth now → the annual return (XIRR), and the same deposits and
// withdrawals replayed in an index or fund the visitor picks. Shared by
// /tools/investment-return and the MCP tool investment_return, so both give
// the same figure for the same inputs. No React, no formatting, no network.
//
// Sign convention for visitors (DatedFlow): positive = money put in,
// negative = money taken out. xirr() itself takes Excel's convention
// (money leaving your pocket negative), so it can be checked against Excel.

export interface DatedFlow {
  /** YYYY-MM-DD */
  date: string;
  /** Positive: money put in. Negative: money taken out. */
  amount: number;
}

export interface ClosePoint {
  date: string;
  close: number;
}

const DAY_MS = 86_400_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real calendar date written YYYY-MM-DD (rejects 2026-02-30). */
export function isIsoDate(s: string): boolean {
  const m = ISO_DATE.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

const dayNumber = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
};

/** Whole days from `a` to `b` (both YYYY-MM-DD). */
export const daysBetween = (a: string, b: string) => dayNumber(b) - dayNumber(a);

// ── XIRR ────────────────────────────────────────────────────────────────────

/**
 * The annual rate r (a fraction) at which Σ cᵢ / (1 + r)^(dᵢ / 365) = 0, where
 * dᵢ is days from the earliest flow — Excel's XIRR, 365-day years included.
 * Flows use Excel's signs: money you pay in is negative, money you get back
 * (and the value today) positive. Null without at least one of each sign, or
 * when no rate solves it.
 *
 * Newton's method from 10% (Excel's default guess) finds the same root Excel
 * reports when flows change sign more than once; if it fails to converge,
 * bisection on the first sign change of a grid of rates takes over.
 */
export function xirr(flows: DatedFlow[], guess = 0.1): number | null {
  const cf = flows.filter((f) => f.amount !== 0 && Number.isFinite(f.amount));
  if (!cf.some((f) => f.amount < 0) || !cf.some((f) => f.amount > 0)) return null;
  const d0 = Math.min(...cf.map((f) => dayNumber(f.date)));
  const t = cf.map((f) => (dayNumber(f.date) - d0) / 365);
  const npv = (r: number) => cf.reduce((s, f, i) => s + f.amount / Math.pow(1 + r, t[i]), 0);
  const dnpv = (r: number) => cf.reduce((s, f, i) => s - (t[i] * f.amount) / Math.pow(1 + r, t[i] + 1), 0);
  const scale = cf.reduce((s, f) => s + Math.abs(f.amount), 0);

  let r = guess;
  for (let i = 0; i < 100; i++) {
    const v = npv(r);
    const dv = dnpv(r);
    if (!Number.isFinite(v) || !Number.isFinite(dv) || dv === 0) break;
    let next = r - v / dv;
    if (next <= -1) next = (r - 1) / 2; // stay above −100%
    if (Math.abs(next - r) < 1e-12) {
      r = next;
      break;
    }
    r = next;
  }
  if (Number.isFinite(r) && r > -1 && Math.abs(npv(r)) < 1e-7 * scale) return r;

  const grid = [-0.9999, -0.99, -0.9, -0.75, -0.5, -0.25, 0, 0.1, 0.25, 0.5, 1, 2, 5, 10, 100, 1000, 1e5];
  for (let i = 0; i < grid.length - 1; i++) {
    let lo = grid[i];
    let hi = grid[i + 1];
    let flo = npv(lo);
    if (!Number.isFinite(flo) || !Number.isFinite(npv(hi)) || Math.sign(flo) === Math.sign(npv(hi))) continue;
    for (let k = 0; k < 300 && hi - lo > 1e-13; k++) {
      const mid = (lo + hi) / 2;
      const fm = npv(mid);
      if (Math.sign(fm) === Math.sign(flo)) {
        lo = mid;
        flo = fm;
      } else hi = mid;
    }
    return (lo + hi) / 2;
  }
  return null;
}

// ── The visitor's return ────────────────────────────────────────────────────

export type FlowProblem = "no_flows" | "bad_date" | "bad_amount" | "after_value_date" | "no_money_in" | "bad_value";

/** The first thing wrong with the inputs, or null. Dates must be on or before the value date. */
export function checkFlows(flows: DatedFlow[], value: number, valueDate: string): FlowProblem | null {
  if (flows.length === 0) return "no_flows";
  if (!isIsoDate(valueDate) || flows.some((f) => !isIsoDate(f.date))) return "bad_date";
  if (flows.some((f) => !Number.isFinite(f.amount))) return "bad_amount";
  if (!Number.isFinite(value) || value < 0) return "bad_value";
  if (flows.some((f) => f.date > valueDate)) return "after_value_date";
  if (!flows.some((f) => f.amount > 0)) return "no_money_in";
  return null;
}

export interface InvestmentReturn {
  firstDate: string;
  valueDate: string;
  /** Years from the first flow to the value date (365-day years, as XIRR). */
  years: number;
  totalIn: number;
  totalOut: number;
  value: number;
  /** value + money taken out − money put in */
  gain: number;
  /** gain ÷ money put in, percent — ignores when the money went in */
  simpleReturnPct: number;
  /** (value + money taken out) ÷ money put in */
  multiple: number;
  /** XIRR in percent; null when no rate solves it (e.g. everything lost and nothing taken out) */
  annualReturnPct: number | null;
  /** Under a year: an annual rate stretches the period to twelve months. */
  shortPeriod: boolean;
}

/** Call checkFlows first: this assumes valid inputs. */
export function investmentReturn(flows: DatedFlow[], value: number, valueDate: string): InvestmentReturn {
  const sorted = [...flows].sort((a, b) => a.date.localeCompare(b.date));
  const totalIn = sorted.reduce((s, f) => s + Math.max(0, f.amount), 0);
  const totalOut = sorted.reduce((s, f) => s + Math.max(0, -f.amount), 0);
  const gain = value + totalOut - totalIn;
  const firstDate = sorted[0].date;
  const years = daysBetween(firstDate, valueDate) / 365;
  const excel = [...sorted.map((f) => ({ date: f.date, amount: -f.amount })), { date: valueDate, amount: value }];
  // Everything lost and nothing taken out: no rate solves it, but the answer is −100%.
  const r = years <= 0 ? null : value === 0 && totalOut === 0 ? -1 : xirr(excel);
  return {
    firstDate,
    valueDate,
    years,
    totalIn,
    totalOut,
    value,
    gain,
    simpleReturnPct: (gain / totalIn) * 100,
    multiple: (value + totalOut) / totalIn,
    annualReturnPct: r === null ? null : r * 100,
    shortPeriod: years < 1,
  };
}

/** Money put in less money taken out, after each flow — a step line for the chart. */
export function netInvestedSteps(flows: DatedFlow[]): { date: string; netIn: number }[] {
  const sorted = [...flows].sort((a, b) => a.date.localeCompare(b.date));
  const out: { date: string; netIn: number }[] = [];
  let net = 0;
  for (const f of sorted) {
    net += f.amount;
    if (out.length && out[out.length - 1].date === f.date) out[out.length - 1].netIn = net;
    else out.push({ date: f.date, netIn: net });
  }
  return out;
}

// ── The same money in an index or fund ──────────────────────────────────────

export type ReplayProblem = "history_too_short" | "withdrawal_too_large";

export type Replay =
  | { ok: false; problem: ReplayProblem; date: string }
  | {
      ok: true;
      value: number;
      result: InvestmentReturn;
      /** Value of the replayed holding at each price date from the first flow to the value date. */
      path: { date: string; value: number }[];
    };

/**
 * Each deposit buys units at the close on or before its date, each withdrawal
 * sells them, and what is left is valued at the close on or before the value
 * date. `points` are closes in the visitor's currency, oldest first. Fails —
 * rather than inventing a figure — when the history starts after the first
 * flow, or a withdrawal is more than the replayed holding was worth that day.
 */
export function replayFlows(flows: DatedFlow[], points: ClosePoint[], valueDate: string): Replay {
  const sorted = [...flows].sort((a, b) => a.date.localeCompare(b.date));
  if (points.length === 0 || points[0].date > sorted[0].date) return { ok: false, problem: "history_too_short", date: points[0]?.date ?? sorted[0].date };

  let units = 0;
  let j = -1; // index of the last close on or before the current date
  const closeOn = (date: string) => {
    while (j + 1 < points.length && points[j + 1].date <= date) j++;
    return points[j].close;
  };
  for (const f of sorted) {
    const price = closeOn(f.date);
    const bought = f.amount / price;
    if (units + bought < -1e-9 * Math.max(1, units)) return { ok: false, problem: "withdrawal_too_large", date: f.date };
    units = Math.max(0, units + bought);
  }
  const finalValue = units * closeOn(valueDate);

  // The holding's value on each price date: flows apply from their own date,
  // bought or sold at the close on or before it.
  const path: { date: string; value: number }[] = [];
  let u = 0;
  let k = 0;
  for (const p of points) {
    if (p.date > valueDate) break;
    while (k < sorted.length && sorted[k].date <= p.date) {
      u = Math.max(0, u + sorted[k].amount / closeAtOrBefore(points, sorted[k].date));
      k++;
    }
    if (k > 0) path.push({ date: p.date, value: u * p.close });
  }

  return { ok: true, value: finalValue, result: investmentReturn(sorted, finalValue, valueDate), path };
}

function closeAtOrBefore(points: ClosePoint[], date: string): number {
  let lo = 0;
  let hi = points.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (points[mid].date <= date) lo = mid;
    else hi = mid - 1;
  }
  return points[lo].close;
}

/** The price range to fetch so the history reaches back to `firstDate` (from `today`). */
export function rangeFor(firstDate: string, today: string): "1y" | "5y" | "max" {
  const days = daysBetween(firstDate, today);
  if (days < 360) return "1y";
  if (days < 1820) return "5y";
  return "max";
}

// ── Text in and out ─────────────────────────────────────────────────────────

/** Excel serial day 0 is 1899-12-30 (the 1900 leap-year bug folded in). */
const EXCEL_EPOCH = Date.UTC(1899, 11, 30) / DAY_MS;

/** YYYY-MM-DD, DD/MM/YYYY (also with - or .), DD/MM/YY, or an Excel serial date. Day first: never US month-first. */
export function parseDate(raw: string): string | null {
  const s = raw.trim().replace(/^"|"$/g, "");
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(s);
  if (m) return toIso(+m[1], +m[2], +m[3]);
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/.exec(s);
  if (m) {
    const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    return toIso(y, +m[2], +m[1]);
  }
  if (/^\d{5}$/.test(s)) {
    const n = +s;
    if (n > 20000 && n < 80000) return new Date((EXCEL_EPOCH + n) * DAY_MS).toISOString().slice(0, 10);
  }
  return null;
}

function toIso(y: number, mo: number, d: number): string | null {
  const iso = `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return isIsoDate(iso) ? iso : null;
}

/**
 * An amount as typed or pasted: currency signs and spaces ignored, a leading
 * minus or brackets make it negative. With both "," and "." the last one is
 * the decimal point; with only one kind, `decimal` (the visitor's locale)
 * says which it is — except that a lone separator followed by exactly three
 * digits and repeated (1,234,567) is always a thousands separator.
 */
export function parseAmount(raw: string, decimal: "." | "," = "."): number | null {
  let s = raw.trim().replace(/^"|"$/g, "").replace(/[\s£$€ ]/g, "").replace(/(GBP|USD|EUR)/gi, "");
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (/^[-−]/.test(s)) {
    negative = true;
    s = s.slice(1);
  }
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null;
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  let dec: string | null;
  if (lastDot >= 0 && lastComma >= 0) dec = lastDot > lastComma ? "." : ",";
  else if (lastDot < 0 && lastComma < 0) dec = null;
  else {
    const sep = lastDot >= 0 ? "." : ",";
    const groups = s.split(sep);
    const thousandsShape = groups.length > 2 && groups.slice(1).every((g) => g.length === 3);
    dec = thousandsShape ? null : sep === decimal ? sep : groups.length === 2 && groups[1].length !== 3 ? sep : null;
  }
  const thousands = dec === "." ? "," : dec === "," ? "." : null;
  let clean = s;
  if (thousands) clean = clean.split(thousands).join("");
  if (dec === null) clean = clean.replace(/[.,]/g, "");
  else if (dec === ",") clean = clean.replace(",", ".");
  if ((clean.match(/\./g) ?? []).length > 1) return null;
  const n = Number(clean);
  return Number.isFinite(n) ? (negative ? -n : n) : null;
}

/**
 * Rows pasted from a spreadsheet or bank export: per line, the first cell that
 * reads as a date and the first cell after it that reads as an amount. Lines
 * without both (headers, totals) are counted in `skipped`.
 */
export function parseFlowsText(text: string, decimal: "." | "," = "."): { flows: DatedFlow[]; skipped: number } {
  const flows: DatedFlow[] = [];
  let skipped = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    // Tabs (a copy from Excel) and semicolons split cells; then commas; a line
    // with neither splits on spaces ("2024-01-10 5000").
    const cells = /[\t;]/.test(line) ? line.split(/[\t;]/) : line.includes(",") ? splitCsv(line) : line.trim().split(/\s+/);
    const di = cells.findIndex((c) => parseDate(c) !== null);
    const date = di >= 0 ? parseDate(cells[di]) : null;
    let amount: number | null = null;
    if (di >= 0) {
      for (const c of cells.slice(di + 1)) {
        amount = parseAmount(c, decimal);
        if (amount !== null) break;
      }
    }
    if (date && amount !== null && amount !== 0) flows.push({ date, amount });
    else skipped++;
  }
  return { flows, skipped };
}

/** Comma-separated cells, with "quoted, cells" kept whole. */
function splitCsv(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      cells.push(cur);
      cur = "";
    } else cur += ch;
  }
  cells.push(cur);
  return cells;
}

/** `?f=` for shared links and the MCP tool's tool_page: 2022-01-10_5000~2025-03-15_-1500. */
export function encodeFlows(flows: DatedFlow[]): string {
  return flows.map((f) => `${f.date}_${Math.round(f.amount * 100) / 100}`).join("~");
}

export function decodeFlows(s: string | undefined, max = 200): DatedFlow[] {
  if (!s) return [];
  return s
    .split("~")
    .map((part) => {
      const [date, amt] = part.split("_");
      const amount = Number(amt);
      return date && isIsoDate(date) && Number.isFinite(amount) && amount !== 0 ? { date, amount } : null;
    })
    .filter((f): f is DatedFlow => f !== null)
    .slice(0, max);
}
