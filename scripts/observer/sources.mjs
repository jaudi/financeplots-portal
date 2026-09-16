/**
 * Free data sources for The Observer agent. Only FRED needs a (free) key, and
 * only on cloud runners. Also: Eurostat, Yahoo Finance, SEC EDGAR, Google News RSS, GDELT, Reddit,
 * ApeWisdom and CNN Fear & Greed.
 *
 * Every function returns plain data or throws. The caller decides what a
 * failure means — one dead feed must not stop the weekly edition.
 */
import yahooFinance from "yahoo-finance2";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

async function get(url, { headers = {}, timeoutMs = 20000 } = {}) {
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA, ...headers },
    signal: AbortSignal.timeout(timeoutMs),
  });
  // Errors end up in the published edition's metadata: never include a key.
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url.replace(/api_key=[^&]+/, "api_key=***")}`);
  return res;
}

const round = (n, dp = 2) => (n == null || Number.isNaN(n) ? null : Number(n.toFixed(dp)));

// ── FRED ─────────────────────────────────────────────────────────────────────

/**
 * transform: "level" reports the value as published; "yoy" turns an index into
 * a year-on-year % change. `stale` flags readings older than the series' cadence
 * allows, so the writer never presents an old number as current.
 */
export const MACRO_SERIES = {
  US: [
    { id: "GDPC1",           label: "Real GDP growth, YoY",           transform: "yoy", freq: "q" },
    { id: "CPIAUCSL",        label: "CPI inflation, YoY",             transform: "yoy", freq: "m" },
    { id: "CPILFESL",        label: "Core CPI inflation, YoY",        transform: "yoy", freq: "m" },
    { id: "UNRATE",          label: "Unemployment rate",              transform: "level", unit: "%", freq: "m" },
    { id: "FEDFUNDS",        label: "Fed funds rate",                 transform: "level", unit: "%", freq: "m" },
    { id: "DGS2",            label: "2-year Treasury yield",          transform: "level", unit: "%", freq: "d" },
    { id: "DGS10",           label: "10-year Treasury yield",         transform: "level", unit: "%", freq: "d" },
    { id: "T10Y2Y",          label: "10y minus 2y Treasury spread",   transform: "level", unit: "pp", freq: "d" },
    { id: "BAMLH0A0HYM2",    label: "High-yield credit spread",       transform: "level", unit: "pp", freq: "d" },
    { id: "GFDEGDQ188S",     label: "Federal debt, % of GDP",         transform: "level", unit: "%", freq: "q" },
    { id: "FYFSGDA188S",     label: "Federal surplus/deficit, % of GDP", transform: "level", unit: "%", freq: "a" },
  ],
  Euro: [
    { id: "CLVMNACSCAB1GQEA19", label: "Euro area real GDP growth, YoY", transform: "yoy", freq: "q" },
    { id: "CP0000EZ19M086NEST", label: "Euro area HICP inflation, YoY",  transform: "yoy", freq: "m" },
    { id: "ECBDFR",             label: "ECB deposit facility rate",      transform: "level", unit: "%", freq: "d" },
    { id: "IRLTLT01DEM156N",    label: "Germany 10-year yield",          transform: "level", unit: "%", freq: "m" },
    { id: "IRLTLT01ITM156N",    label: "Italy 10-year yield",            transform: "level", unit: "%", freq: "m" },
    { id: "IRLTLT01FRM156N",    label: "France 10-year yield",           transform: "level", unit: "%", freq: "m" },
  ],
  Asia: [
    { id: "IRLTLT01JPM156N",  label: "Japan 10-year yield",             transform: "level", unit: "%", freq: "m" },
    { id: "IR3TIB01CNM156N",  label: "China 3-month interbank rate",    transform: "level", unit: "%", freq: "m" },
    { id: "GGGDTAJPA188N",    label: "Japan government debt, % of GDP (IMF)", transform: "level", unit: "%", freq: "a" },
    { id: "GGGDTACNA188N",    label: "China government debt, % of GDP (IMF)", transform: "level", unit: "%", freq: "a" },
    // FRED stopped carrying timely CPI for Japan, China and India (the OECD
    // feeds ended). The agent finds those prints through news search instead.
  ],
};

// Publication lags included: quarterly debt lands ~6 months late, IMF annual ~2 years.
const MAX_AGE_DAYS = { d: 14, m: 120, q: 300, a: 1000 };

/** Raw observations, oldest first. */
async function fredObservations(id, start) {
  // Trimmed: a key pasted into a secrets form easily picks up a newline or quotes.
  const apiKey = process.env.FRED_API_KEY?.trim().replace(/^["']|["']$/g, "");
  let pairs;
  if (apiKey) {
    // The official API. The public CSV download times out from cloud runners
    // (GitHub Actions), so the workflow always sets FRED_API_KEY.
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${encodeURIComponent(id)}&api_key=${apiKey}&file_type=json&observation_start=${start}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const json = await res.json().catch(() => ({}));
    // FRED explains a 400 (bad key, unknown series) in error_message.
    if (!res.ok) throw new Error(`${res.status}: ${json.error_message ?? res.statusText}`);
    pairs = (json.observations ?? []).map((o) => [o.date, o.value]);
  } else {
    // Keyless fallback for local runs.
    const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(id)}&cosd=${start}`;
    const text = await (await get(url)).text();
    pairs = text.trim().split("\n").slice(1).map((line) => line.split(","));
  }
  return pairs
    .filter(([, v]) => v !== "" && v !== "." && !Number.isNaN(Number(v)))
    .map(([date, v]) => ({ date, value: Number(v) }));
}

export async function fredSeries(id, { transform = "level", freq = "m", label = id, unit } = {}) {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 3);
  const rows = await fredObservations(id, start.toISOString().slice(0, 10));
  if (rows.length === 0) throw new Error(`FRED ${id}: no observations`);

  let points = rows;
  if (transform === "yoy") {
    const lag = { m: 12, q: 4, a: 1, d: 252 }[freq];
    points = rows.slice(lag).map((r, i) => ({ date: r.date, value: (r.value / rows[i].value - 1) * 100 }));
    if (points.length === 0) throw new Error(`FRED ${id}: not enough history for YoY`);
  }

  const latest = points.at(-1);
  const prior = points.at(-2) ?? null;
  const ageDays = (Date.now() - new Date(latest.date).getTime()) / 86400000;

  return {
    id,
    label,
    unit: transform === "yoy" ? "%" : unit ?? "",
    date: latest.date,
    value: round(latest.value),
    prior: prior ? { date: prior.date, value: round(prior.value) } : null,
    stale: ageDays > MAX_AGE_DAYS[freq],
  };
}

// ── Eurostat (euro-area data FRED lacks or carries late) ─────────────────────

// EA21: the euro area including Bulgaria, which joined in January 2026.
const EUROSTAT_SERIES = [
  { dataset: "une_rt_m",       query: "geo=EA21&s_adj=SA&age=TOTAL&sex=T&unit=PC_ACT", label: "Euro area unemployment rate",         unit: "%" },
  { dataset: "gov_10q_ggdebt", query: "geo=EA21&unit=PC_GDP&sector=S13&na_item=GD",    label: "Euro area government debt, % of GDP", unit: "%" },
];

async function eurostatSeries({ dataset, query, label, unit }) {
  const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset}?${query}&lastTimePeriod=3`;
  const json = await (await get(url)).json();
  // One series per query, so value keys are positions on the time axis. The
  // newest period is often listed before its figure exists — skip empty ones.
  const points = Object.entries(json.dimension?.time?.category?.index ?? {})
    .sort((a, b) => a[1] - b[1])
    .filter(([, i]) => json.value?.[i] != null)
    .map(([date, i]) => ({ date, value: json.value[i] }));
  if (points.length === 0) throw new Error(`Eurostat ${dataset}: no observations`);

  const latest = points.at(-1);
  const prior = points.at(-2) ?? null;
  return { id: `eurostat:${dataset}`, label, unit, date: latest.date, value: round(latest.value), prior, stale: false };
}

export async function macroSnapshot() {
  const out = {};
  const errors = [];
  for (const [region, defs] of Object.entries(MACRO_SERIES)) {
    out[region] = [];
    // Sequential per region: FRED throttles bursts.
    for (const def of defs) {
      try {
        out[region].push(await fredSeries(def.id, def));
      } catch (e) {
        errors.push(`FRED ${def.id}: ${e.message}`);
      }
    }
  }
  for (const def of EUROSTAT_SERIES) {
    try {
      out.Euro.push(await eurostatSeries(def));
    } catch (e) {
      errors.push(`Eurostat ${def.dataset}: ${e.message}`);
    }
  }
  return { data: out, errors };
}

// ── Markets (Yahoo Finance) ──────────────────────────────────────────────────

export const MARKET_SYMBOLS = [
  { symbol: "^GSPC",     label: "S&P 500",             region: "US" },
  { symbol: "^IXIC",     label: "Nasdaq Composite",    region: "US" },
  { symbol: "^RUT",      label: "Russell 2000",        region: "US" },
  { symbol: "^VIX",      label: "VIX (S&P 500 implied volatility)", region: "US" },
  { symbol: "^TNX",      label: "US 10-year yield",    region: "US" },
  { symbol: "DX-Y.NYB",  label: "US Dollar Index",     region: "US" },
  { symbol: "^STOXX50E", label: "Euro Stoxx 50",       region: "Euro" },
  { symbol: "^GDAXI",    label: "DAX",                 region: "Euro" },
  { symbol: "^FCHI",     label: "CAC 40",              region: "Euro" },
  { symbol: "^IBEX",     label: "IBEX 35",             region: "Euro" },
  { symbol: "^FTSE",     label: "FTSE 100",            region: "Euro" },
  { symbol: "EURUSD=X",  label: "EUR/USD",             region: "Euro" },
  { symbol: "^N225",     label: "Nikkei 225",          region: "Asia" },
  { symbol: "^HSI",      label: "Hang Seng",           region: "Asia" },
  { symbol: "000001.SS", label: "Shanghai Composite",  region: "Asia" },
  { symbol: "^BSESN",    label: "BSE Sensex",          region: "Asia" },
  { symbol: "^KS11",     label: "KOSPI",               region: "Asia" },
  { symbol: "JPY=X",     label: "USD/JPY",             region: "Asia" },
  { symbol: "CNY=X",     label: "USD/CNY",             region: "Asia" },
  { symbol: "CL=F",      label: "WTI crude oil",       region: "Global" },
  { symbol: "BZ=F",      label: "Brent crude oil",     region: "Global" },
  { symbol: "GC=F",      label: "Gold",                region: "Global" },
  { symbol: "HG=F",      label: "Copper",              region: "Global" },
  { symbol: "BTC-USD",   label: "Bitcoin",             region: "Global" },
];

// yahoo-finance2 v3: the default export is the class.
const yf = new yahooFinance({ suppressNotices: ["yahooSurvey"] });

async function marketSeries({ symbol, label, region }) {
  const period1 = new Date(Date.now() - 45 * 86400000);
  const chart = await yf.chart(symbol, { period1, interval: "1d" }, { validateResult: false });
  const closes = (chart.quotes ?? []).filter((q) => q.close != null);
  if (closes.length < 6) throw new Error(`${symbol}: not enough prices`);

  const last = closes.at(-1);
  const weekAgo = closes.at(-6);
  const monthAgo = closes.find((q) => new Date(q.date) >= new Date(Date.now() - 31 * 86400000)) ?? closes[0];
  const pct = (a, b) => round((a / b - 1) * 100);

  return {
    symbol,
    label,
    region,
    date: new Date(last.date).toISOString().slice(0, 10),
    close: round(last.close, 2),
    change1w: pct(last.close, weekAgo.close),
    change1m: pct(last.close, monthAgo.close),
  };
}

export async function marketSnapshot() {
  const results = await Promise.allSettled(MARKET_SYMBOLS.map(marketSeries));
  const data = [];
  const errors = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") data.push(r.value);
    else errors.push(`Yahoo ${MARKET_SYMBOLS[i].symbol}: ${r.reason?.message ?? r.reason}`);
  });
  return { data, errors };
}

// ── News (Google News RSS) ───────────────────────────────────────────────────

function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/<[^>]+>/g, "")
    .trim();
}

function parseRss(xml, limit) {
  const items = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const tag = (name) => {
      const hit = m[1].match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
      return hit ? decodeEntities(hit[1]) : "";
    };
    items.push({
      title: tag("title"),
      source: tag("source"),
      published: tag("pubDate"),
      url: tag("link"),
    });
    if (items.length >= limit) break;
  }
  return items;
}

const GOOGLE_NEWS = "hl=en-US&gl=US&ceid=US:en";

export async function newsSearch(query, limit = 12, site) {
  const q = encodeURIComponent(`${query}${site ? ` site:${site}` : ""} when:7d`);
  const xml = await (await get(`https://news.google.com/rss/search?q=${q}&${GOOGLE_NEWS}`)).text();
  return parseRss(xml, limit);
}

export async function topHeadlines(limit = 15) {
  const topics = { world: "WORLD", business: "BUSINESS" };
  const out = {};
  for (const [key, topic] of Object.entries(topics)) {
    const xml = await (
      await get(`https://news.google.com/rss/headlines/section/topic/${topic}?${GOOGLE_NEWS}`)
    ).text();
    out[key] = parseRss(xml, limit);
  }
  return out;
}

// ── SEC EDGAR (company results, official filings) ────────────────────────────

// The SEC asks automated clients to identify themselves in the User-Agent.
const SEC_HEADERS = { "User-Agent": "FinancePlots Observer (https://www.financeplots.com)" };

function stripHtml(html) {
  return decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<\/(p|div|tr|li|h\d)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n"),
  )
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

/**
 * Companies that filed earnings results with the SEC in the last `days` days:
 * 8-K filings carrying Item 2.02 ("Results of Operations and Financial Condition").
 */
export async function secEarningsFilings(days = 7, query = "") {
  const end = new Date();
  const start = new Date(Date.now() - days * 86400000);
  const q = encodeURIComponent(`"Item 2.02"${query ? ` ${query}` : ""}`);
  const url = `https://efts.sec.gov/LATEST/search-index?q=${q}&forms=8-K&dateRange=custom&startdt=${start.toISOString().slice(0, 10)}&enddt=${end.toISOString().slice(0, 10)}`;
  const json = await (await get(url, { headers: SEC_HEADERS })).json();

  const seen = new Set();
  const filings = [];
  for (const hit of json.hits?.hits ?? []) {
    const [adsh, file] = hit._id.split(":");
    if (seen.has(adsh) || !hit._source.items?.includes("2.02")) continue;
    seen.add(adsh);
    const cik = String(parseInt(hit._source.ciks[0], 10));
    filings.push({
      company: hit._source.display_names?.[0] ?? "",
      filed: hit._source.file_date,
      filingId: `${cik}/${adsh}`,
      url: `https://www.sec.gov/Archives/edgar/data/${cik}/${adsh.replace(/-/g, "")}/${file}`,
    });
  }
  return { total: json.hits?.total?.value ?? filings.length, filings };
}

/**
 * The earnings press release (exhibit 99.1) attached to an 8-K, as plain text.
 * `filingId` is "<cik>/<accession number>" as returned by secEarningsFilings.
 */
export async function secEarningsRelease(filingId, maxChars = 9000) {
  const [cik, adsh] = filingId.split("/");
  if (!/^\d+$/.test(cik) || !/^[\d-]+$/.test(adsh)) throw new Error("filingId must look like 1234567/0001234567-26-000001");
  const folder = `https://www.sec.gov/Archives/edgar/data/${cik}/${adsh.replace(/-/g, "")}`;
  const index = await (await get(`${folder}/index.json`, { headers: SEC_HEADERS })).json();
  const exhibit = index.directory.item
    .map((i) => i.name)
    .find((n) => /\.htm$/i.test(n) && /(ex|x)[-_]?99[-_.]?1|dex991|991x/i.test(n));
  if (!exhibit) throw new Error("No exhibit 99.1 (earnings release) in this filing");

  const url = `${folder}/${exhibit}`;
  const text = stripHtml(await (await get(url, { headers: SEC_HEADERS })).text());
  return { url, text: text.length > maxChars ? `${text.slice(0, maxChars)}\n[…truncated]` : text };
}

// ── News tone (GDELT) ────────────────────────────────────────────────────────

/** Average tone of worldwide coverage per day over the last 7 days. Negative = more negative coverage. */
export async function newsTone(query) {
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=timelinetone&timespan=7d&format=json`;
  const text = await (await get(url, { timeoutMs: 30000 })).text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`GDELT: ${text.slice(0, 120)}`);
  }
  const points = json.timeline?.[0]?.data ?? [];
  if (points.length === 0) throw new Error("GDELT: no tone data");

  // GDELT returns 15-minute buckets; collapse to one average per day.
  const byDay = {};
  for (const p of points) {
    const day = `${p.date.slice(0, 4)}-${p.date.slice(4, 6)}-${p.date.slice(6, 8)}`;
    (byDay[day] ??= []).push(p.value);
  }
  const daily = Object.entries(byDay).map(([date, vals]) => ({
    date,
    tone: round(vals.reduce((a, b) => a + b, 0) / vals.length),
  }));
  const avg = round(daily.reduce((a, d) => a + d.tone, 0) / daily.length);
  return { query, weekAverageTone: avg, daily };
}

// ── Social sentiment (Reddit, CNN Fear & Greed) ─────────────────────────────

export const SUBREDDITS = ["wallstreetbets", "stocks", "investing", "economics", "europe", "china"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function redditTop(subreddit, limit = 12) {
  // The RSS feed is served to anonymous clients more reliably than .json, but
  // Reddit still rate-limits hard: one retry after a pause, then give up.
  const url = `https://www.reddit.com/r/${subreddit}/top/.rss?t=week&limit=${limit}`;
  let xml;
  try {
    xml = await (await get(url)).text();
  } catch {
    await sleep(8000);
    xml = await (await get(url)).text();
  }
  const posts = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const title = m[1].match(/<title>([\s\S]*?)<\/title>/);
    const link = m[1].match(/<link href="([^"]+)"/);
    const updated = m[1].match(/<updated>([^<]+)<\/updated>/);
    if (title) posts.push({ title: decodeEntities(title[1]), url: link?.[1] ?? "", date: updated?.[1]?.slice(0, 10) ?? "" });
    if (posts.length >= limit) break;
  }
  if (posts.length === 0) throw new Error(`Reddit r/${subreddit}: no posts`);
  return { subreddit, posts };
}

/**
 * Most-discussed tickers across Reddit's investing communities (ApeWisdom),
 * with mentions 24 hours earlier. A read on retail attention, nothing more.
 */
export async function redditMentions(limit = 20) {
  const json = await (await get("https://apewisdom.io/api/v1.0/filter/all-stocks/page/1")).json();
  return json.results.slice(0, limit).map((r) => ({
    ticker: r.ticker,
    name: decodeEntities(r.name),
    mentions: r.mentions,
    mentions24hAgo: r.mentions_24h_ago,
  }));
}

export async function fearAndGreed() {
  const json = await (
    await get("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
      headers: { Accept: "application/json", Referer: "https://edition.cnn.com/" },
    })
  ).json();
  const fg = json.fear_and_greed;
  return {
    score: round(fg.score, 0),
    rating: fg.rating,
    previousWeek: round(fg.previous_1_week, 0),
    previousMonth: round(fg.previous_1_month, 0),
    date: fg.timestamp?.slice(0, 10) ?? null,
  };
}
