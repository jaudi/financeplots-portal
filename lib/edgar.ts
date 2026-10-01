// Yearly figures from US companies' annual reports (10-K), straight from SEC
// EDGAR's free XBRL API — official, no key, US filers only. Used by the
// company pages for the history Simply Wall St-style pages lean on.
//
// One small request per concept (2–4 KB), cached a week: annual reports
// change once a year, and the SEC asks for at most 10 requests a second.
// Facts are reported as filed — companies tag the same item differently and
// switch tags over time, so each series tries tags in order and anything not
// current is left out rather than shown stale.

const UA = process.env.SEC_USER_AGENT || "FinancePlots (https://www.financeplots.com)";
const WEEK = 60 * 60 * 24 * 7;

export interface SecFact {
  start?: string;
  end: string;
  val: number;
  form: string;
  fp?: string;
  filed: string;
}

export interface HistoryYear {
  /** Fiscal year end, YYYY-MM-DD. */
  end: string;
  revenue: number | null;
  netIncome: number | null;
  operatingCashFlow: number | null;
  capex: number | null;
  freeCashFlow: number | null;
  cash: number | null;
  debt: number | null;
}

export interface FinancialHistory {
  cik: string;
  /** Most recent last, at most `YEARS`. */
  years: HistoryYear[];
  /** Series with figures recent enough to show. */
  available: { revenue: boolean; netIncome: boolean; cashFlow: boolean; balance: boolean };
  source: string;
}

const YEARS = 10;
/** A series whose latest year is further behind than this is a tag the company stopped using. */
const MAX_LAG_YEARS = 2;

const TAGS = {
  revenue: [
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "Revenues",
    "SalesRevenueNet",
    "RevenueFromContractWithCustomerIncludingAssessedTax",
  ],
  netIncome: ["NetIncomeLoss", "ProfitLoss"],
  operatingCashFlow: ["NetCashProvidedByUsedInOperatingActivities"],
  capex: ["PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets"],
  cash: ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"],
  debt: ["LongTermDebt", "LongTermDebtNoncurrent"],
} as const;

type Field = keyof typeof TAGS;

// ── Pure parsing (tested without the network) ─────────────────────────────

const DAY = 86_400_000;
const isAnnualReport = (f: SecFact) => (f.form === "10-K" || f.form === "10-K/A") && (f.fp === undefined || f.fp === "FY");

/** One value per fiscal year end, the latest filing winning (restatements).
 *  Flows (with a start date) must span a year: 52/53-week years included. */
export function annualValues(facts: SecFact[], kind: "flow" | "instant"): Map<string, number> {
  const best = new Map<string, SecFact>();
  for (const f of facts) {
    if (!isAnnualReport(f) || !Number.isFinite(f.val)) continue;
    if (kind === "flow") {
      if (!f.start) continue;
      const days = (Date.parse(f.end) - Date.parse(f.start)) / DAY;
      if (days < 340 || days > 390) continue;
    } else if (f.start) continue;
    const prev = best.get(f.end);
    if (!prev || f.filed > prev.filed) best.set(f.end, f);
  }
  return new Map([...best].map(([end, f]) => [end, f.val]));
}

/** Tags in priority order: for each year end, the first tag that has it. */
export function mergeTags(perTag: Map<string, number>[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const m of perTag) for (const [end, v] of m) if (!out.has(end)) out.set(end, v);
  return out;
}

const year = (end: string) => Number(end.slice(0, 4));

/** Lines the series up by fiscal year end, keeps the last YEARS, and marks
 *  which series are current enough to show. */
export function buildHistory(cik: string, series: Record<Field, Map<string, number>>): FinancialHistory | null {
  // Fiscal years are anchored on the income statement.
  const ends = [...new Set([...series.revenue.keys(), ...series.netIncome.keys()])].sort().slice(-YEARS);
  if (ends.length < 2) return null;
  // Balance-sheet dates can differ from the income statement's by a few days
  // (52/53-week years); match within a week.
  const near = (m: Map<string, number>, end: string) => {
    if (m.has(end)) return m.get(end)!;
    for (const [d, v] of m) if (Math.abs(Date.parse(d) - Date.parse(end)) <= 7 * DAY) return v;
    return null;
  };
  const years: HistoryYear[] = ends.map((end) => {
    const ocf = near(series.operatingCashFlow, end);
    const capex = near(series.capex, end);
    return {
      end,
      revenue: series.revenue.get(end) ?? null,
      netIncome: series.netIncome.get(end) ?? null,
      operatingCashFlow: ocf,
      capex,
      freeCashFlow: ocf !== null && capex !== null ? ocf - capex : null,
      cash: near(series.cash, end),
      debt: near(series.debt, end),
    };
  });
  const latest = year(ends.at(-1)!);
  const current = (pick: (y: HistoryYear) => number | null) => {
    const withData = years.filter((y) => pick(y) !== null);
    return withData.length >= 2 && latest - year(withData.at(-1)!.end) <= MAX_LAG_YEARS;
  };
  return {
    cik,
    years,
    available: {
      revenue: current((y) => y.revenue),
      netIncome: current((y) => y.netIncome),
      cashFlow: current((y) => y.freeCashFlow),
      balance: current((y) => y.cash) && current((y) => y.debt),
    },
    source: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=10-K`,
  };
}

// ── Fetching ──────────────────────────────────────────────────────────────

/** Thrown when the SEC didn't answer (rate limit, outage) — as opposed to
 *  answering that there's nothing there, which is null. Next caches only
 *  200 responses, so the next request simply tries again. */
export class SecUnavailableError extends Error {}

async function secJson<T>(url: string): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, next: { revalidate: WEEK } });
  } catch (e) {
    throw new SecUnavailableError(String(e));
  }
  if (res.status === 404) return null; // the company doesn't report this concept
  if (!res.ok) throw new SecUnavailableError(`SEC ${res.status} for ${url}`);
  return (await res.json()) as T;
}

/** For pages: the history, null when there is none, or "unavailable" when the SEC didn't answer. */
export async function tryFinancialHistory(ticker: string): Promise<FinancialHistory | null | "unavailable"> {
  try {
    return await getFinancialHistory(ticker);
  } catch (e) {
    if (e instanceof SecUnavailableError) return "unavailable";
    throw e;
  }
}

/** SEC's central index key for a US ticker (Yahoo and the SEC both write BRK-B). */
export async function getCik(ticker: string): Promise<string | null> {
  if (ticker.includes(".") || ticker.startsWith("^")) return null; // not a US listing
  const map = await secJson<Record<string, { cik_str: number; ticker: string }>>("https://www.sec.gov/files/company_tickers.json");
  const hit = map && Object.values(map).find((c) => c.ticker === ticker);
  return hit ? String(hit.cik_str).padStart(10, "0") : null;
}

async function concept(cik: string, tag: string): Promise<SecFact[]> {
  const data = await secJson<{ units?: { USD?: SecFact[] } }>(`https://data.sec.gov/api/xbrl/companyconcept/CIK${cik}/us-gaap/${tag}.json`);
  return data?.units?.USD ?? [];
}

export async function getFinancialHistory(ticker: string): Promise<FinancialHistory | null> {
  const cik = await getCik(ticker);
  if (!cik) return null;
  const kind: Record<Field, "flow" | "instant"> = {
    revenue: "flow", netIncome: "flow", operatingCashFlow: "flow", capex: "flow", cash: "instant", debt: "instant",
  };
  const fields = Object.keys(TAGS) as Field[];
  // Sequential per field, parallel within: at most ~4 requests in flight.
  const series = {} as Record<Field, Map<string, number>>;
  for (const field of fields) {
    const perTag = await Promise.all(TAGS[field].map(async (tag) => annualValues(await concept(cik, tag), kind[field])));
    series[field] = mergeTags(perTag);
  }
  return buildHistory(cik, series);
}
