#!/usr/bin/env node
/**
 * Builds data/hq-locations.json — ticker → headquarters city, country and
 * coordinates — for every company in the screener universe (data/universe/).
 * The company map (/tools/company-map) places one dot per company with it.
 *
 * Free sources only, tried in this order:
 *   1. Wikidata, by ticker: the company's listing (P414) on its exchange with
 *      the ticker (P249) as qualifier → headquarters location (P159) →
 *      coordinates (P625, on the statement or on the place).
 *   2. Wikidata, by name: the search API, then the same HQ lookup, accepted
 *      only when the names agree and the item looks like a company.
 *   3. US listings only: SEC EDGAR's submissions API (business address city
 *      and state), placed on that city's Wikidata coordinates.
 *
 * A company none of these place is left out of the file and listed under
 * "missing" — never guessed. Re-run when the indices change:
 *
 *   node scripts/hq-locations.mjs
 *
 * SEC asks for a contact in the User-Agent; set SEC_USER_AGENT to override.
 */
import { readFile, writeFile } from "node:fs/promises";
import { displayName } from "../lib/company-names.ts";

const UA = "FinancePlots hq-locations script (https://www.financeplots.com)";
const SEC_UA = process.env.SEC_USER_AGENT ?? UA;
const OUT = new URL("../data/hq-locations.json", import.meta.url);

// Which exchange each index lists on, as Wikidata items.
const SCREENS = { sp500: "us", nasdaq100: "us", ftse100: "lse", ibex35: "bme" };
const EXCHANGES = {
  us: ["Q13677", "Q82059"], // New York Stock Exchange, Nasdaq
  lse: ["Q171240"], // London Stock Exchange
  bme: ["Q617426"], // Madrid Stock Exchange
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const round = (n) => Math.round(n * 1000) / 1000;

/** fetch, retried when the connection drops (the network, not an HTTP error). */
async function get(url, init) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      if (attempt >= 3) throw err;
      await sleep(3000 * (attempt + 1));
    }
  }
}

async function sparql(query) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await get("https://query.wikidata.org/sparql", {
      method: "POST",
      headers: {
        "User-Agent": UA,
        Accept: "application/sparql-results+json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ query }),
    });
    if (res.ok) return (await res.json()).results.bindings;
    if (res.status !== 429 && res.status < 500) throw new Error(`Wikidata ${res.status}: ${await res.text()}`);
    await sleep(5000 * (attempt + 1));
  }
  throw new Error("Wikidata kept failing");
}

const v = (b, k) => b[k]?.value;
const qid = (uri) => uri?.split("/").pop();
function point(wkt) {
  const m = wkt && /Point\(([-\d.eE]+) ([-\d.eE]+)\)/.exec(wkt);
  return m ? { lon: Number(m[1]), lat: Number(m[2]) } : null;
}

// ── Names ────────────────────────────────────────────────────────────────────

const STOP = new Set([
  "inc", "incorporated", "corp", "corporation", "co", "company", "companies", "plc", "ltd", "limited", "sa", "s", "a",
  "ag", "nv", "se", "spa", "holdings", "holding", "group", "the", "class", "and", "de", "of", "international", "intl",
  "shares", "common", "stock", "trust", "lp", "llc", "sociedad", "anonima", "y", "el", "la",
]);

/** Words that identify a company, without legal suffixes or share-class notes. */
function nameTokens(name) {
  const cleaned = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b(ord|ords|ordinary)\b.*$/, "") // FTSE listing names: "ANGLO AMERICAN PLC ORD USD0.623"
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ");
  return cleaned.split(/\s+/).filter((w) => w && !STOP.has(w));
}

/** Shared words over the shorter name's word count, 0–1 ("Telefónica" is
 *  fully inside "Telefónica Germany"); `exact` divides by all the words
 *  instead, to tell those two apart. */
function similarity(a, b, exact = false) {
  const ta = new Set(nameTokens(a));
  const tb = new Set(nameTokens(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  for (const w of ta) if (tb.has(w)) shared++;
  return shared / (exact ? new Set([...ta, ...tb]).size : Math.min(ta.size, tb.size));
}

function searchName(name) {
  const tokens = name.replace(/\b(ORD|ORDS|ORDINARY)\b.*$/i, "").trim();
  return tokens.replace(/[,.]+$/, "");
}

// ── The universe ─────────────────────────────────────────────────────────────

async function loadCompanies() {
  const companies = new Map(); // ticker → { name, group }
  for (const [screen, group] of Object.entries(SCREENS)) {
    const raw = JSON.parse(await readFile(new URL(`../data/universe/universe-${screen}.json`, import.meta.url), "utf8"));
    for (const c of raw.companies) {
      if (!companies.has(c.ticker)) companies.set(c.ticker, { name: displayName(c.ticker, c.nombre), raw: c.nombre ?? "", group });
    }
  }
  return companies;
}

/** The ways Wikidata may write one of our tickers on its exchange. */
function tickerVariants(ticker, group) {
  const base = group === "us" ? ticker : ticker.replace(/\.(L|MC)$/, "");
  const parts = base.split(/[-.]/);
  const out = new Set([base]);
  if (parts.length > 1) for (const sep of [".", "-", " ", "/", ""]) out.add(parts.join(sep));
  if (group !== "us") out.add(ticker);
  return [...out];
}

// ── Wikidata HQ lookup ───────────────────────────────────────────────────────

const HQ_FIELDS = `
  OPTIONAL { ?c wdt:P17 ?ccountry. }
  OPTIONAL {
    ?c p:P159 ?hs. ?hs ps:P159 ?hq; wikibase:rank ?rank.
    FILTER(?rank != wikibase:DeprecatedRank)
    FILTER NOT EXISTS { ?hs pq:P582 [] }
    OPTIONAL { ?hs pq:P625 ?qcoord. }
    OPTIONAL { ?hq wdt:P625 ?hcoord. }
    OPTIONAL { ?hq wdt:P1082 ?hqpop. }
    OPTIONAL { ?hq wdt:P131 ?admin. OPTIONAL { ?admin wdt:P625 ?acoord. } }
    OPTIONAL { ?hq wdt:P17 ?country. }
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,mul". }`;

const HQ_SELECT = "?c ?cLabel ?hq ?hqLabel ?hqpop ?admin ?adminLabel ?country ?countryLabel ?ccountryLabel ?qcoord ?hcoord ?acoord ?rank";

/** Rows of one item → its location, or null when Wikidata has no placeable HQ.
 *  A preferred-rank HQ wins over a normal one. */
function locationFrom(rows) {
  const withHq = rows.filter((r) => v(r, "hq"));
  if (withHq.length === 0) return null;
  const preferred = withHq.filter((r) => v(r, "rank")?.endsWith("PreferredRank"));
  const pool = preferred.length ? preferred : withHq;
  // Several different current HQs (normal rank) — ambiguous; prefer one with
  // its own coordinates, and the first such in Wikidata's order.
  for (const r of pool) {
    // Coordinates on the HQ statement are usually the building; when they are
    // far from the place the statement names (Accenture: "Dublin" at a point
    // in Germany), the place wins.
    const q = point(v(r, "qcoord"));
    const h = point(v(r, "hcoord"));
    const own = q && h && km(q, h) > 50 ? h : (q ?? h);
    const isPlace = Boolean(v(r, "hqpop")) || Boolean(v(r, "hcoord") && !v(r, "admin"));
    // An HQ that is a building or a street address: name the town it is in.
    const city = isPlace || !v(r, "adminLabel") ? v(r, "hqLabel") : v(r, "adminLabel");
    const at = own ?? point(v(r, "acoord"));
    if (!at || /^Q\d+$/.test(city ?? "")) continue;
    return {
      city: tidyCity(city),
      country: v(r, "countryLabel") ?? v(r, "ccountryLabel") ?? null,
      lat: round(at.lat),
      lon: round(at.lon),
    };
  }
  return null;
}

function km(a, b) {
  const rad = Math.PI / 180;
  const x = (b.lon - a.lon) * rad * Math.cos(((a.lat + b.lat) / 2) * rad);
  const y = (b.lat - a.lat) * rad;
  return Math.hypot(x, y) * 6371;
}

/** London's boroughs and the City are London on a map of cities. */
function tidyCity(city) {
  if (/^(London Borough of |Royal Borough of )|^City of (London|Westminster)$/.test(city)) return "London";
  return city;
}

function groupBy(rows, key) {
  const m = new Map();
  for (const r of rows) {
    const k = v(r, key);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return m;
}

async function byTicker(companies) {
  const found = new Map();
  const review = [];
  for (const [group, exchanges] of Object.entries(EXCHANGES)) {
    const variantToTicker = new Map();
    for (const [ticker, c] of companies) {
      if (c.group !== group) continue;
      for (const variant of tickerVariants(ticker, group)) variantToTicker.set(variant, ticker);
    }
    const values = [...variantToTicker.keys()].map((t) => JSON.stringify(t)).join(" ");
    const rows = await sparql(`
      SELECT ?t ${HQ_SELECT} WHERE {
        VALUES ?ex { ${exchanges.map((q) => `wd:${q}`).join(" ")} }
        VALUES ?t { ${values} }
        ?c p:P414 ?st. ?st ps:P414 ?ex; pq:P249 ?t.
        FILTER NOT EXISTS { ?st pq:P582 [] }
        FILTER NOT EXISTS { ?c wdt:P576 [] }
        ${HQ_FIELDS}
      }`);

    // ticker → candidate items
    const candidates = new Map();
    for (const r of rows) {
      const ticker = variantToTicker.get(v(r, "t"));
      if (!candidates.has(ticker)) candidates.set(ticker, new Map());
      const items = candidates.get(ticker);
      const id = v(r, "c");
      if (!items.has(id)) items.set(id, []);
      items.get(id).push(r);
    }

    for (const [ticker, items] of candidates) {
      const name = companies.get(ticker).name;
      // Several items can carry a ticker (a parent and an old subsidiary): the
      // one whose name agrees with ours wins. A lone item with a different name
      // is still taken when it is the only listing — but listed for review.
      const ranked = [...items.entries()]
        .map(([id, rs]) => {
          const label = v(rs[0], "cLabel") ?? "";
          return { id, rows: rs, label, sim: similarity(name, label), exact: similarity(name, label, true) };
        })
        .sort((a, b) => b.sim - a.sim || b.exact - a.exact);
      const best = ranked[0];
      if (best.sim === 0 && ranked.length > 1) continue;
      const loc = locationFrom(best.rows);
      if (!loc) continue;
      if (best.sim === 0) review.push(`${ticker}: "${name}" ↔ Wikidata "${best.label}" (${qid(best.id)})`);
      found.set(ticker, { ...loc, source: `wikidata:${qid(best.id)}` });
    }
  }
  return { found, review };
}

async function wikidataSearch(name) {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.search = new URLSearchParams({ action: "wbsearchentities", search: name, language: "en", type: "item", limit: "7", format: "json" }).toString();
  const res = await get(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return [];
  return ((await res.json()).search ?? []).map((s) => s.id);
}

async function byName(companies, missing) {
  const found = new Map();
  for (const ticker of missing) {
    const { name, raw } = companies.get(ticker);
    // The name we show, then the listing's own name (IAG.MC is shown as "IAG"
    // but listed as "International Consolidated Airlines Group").
    // Wikidata's search is literal: "RELX PLC" finds nothing, "RELX" does.
    const names = [...new Set([searchName(name), searchName(raw), nameTokens(raw).join(" ")].filter(Boolean))];
    const ids = [];
    for (const n of names) {
      for (const id of await wikidataSearch(n)) if (!ids.includes(id)) ids.push(id);
      await sleep(300);
    }
    if (ids.length === 0) continue;
    // Only items that look like companies: an industry, a listing or an ISIN.
    const rows = await sparql(`
      SELECT ${HQ_SELECT} WHERE {
        VALUES ?c { ${ids.map((id) => `wd:${id}`).join(" ")} }
        FILTER(EXISTS { ?c wdt:P452 [] } || EXISTS { ?c wdt:P414 [] } || EXISTS { ?c wdt:P946 [] })
        FILTER NOT EXISTS { ?c wdt:P576 [] }
        ${HQ_FIELDS}
      }`);
    const items = groupBy(rows, "c");
    for (const id of ids) {
      const rs = items.get(`http://www.wikidata.org/entity/${id}`);
      const label = v(rs?.[0] ?? {}, "cLabel") ?? "";
      if (!rs || Math.max(...names.map((n) => similarity(n, label))) < 0.6) continue;
      const loc = locationFrom(rs);
      if (loc) {
        found.set(ticker, { ...loc, source: `wikidata:${id}` });
        break;
      }
    }
  }
  return found;
}

// ── SEC EDGAR (US listings) ──────────────────────────────────────────────────

const US_STATES = new Set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" "));

const titleCase = (s) => s.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase()).replace(/\bMc([a-z])/g, (_, c) => `Mc${c.toUpperCase()}`);

/** US city + state → its Wikidata place, many at a time. Labels can be
 *  English or language-neutral ("mul"), and a city sits in its state directly
 *  or through its county — a bounded path, since an open-ended one times out. */
async function usCities(pairs) {
  const out = new Map();
  for (let i = 0; i < pairs.length; i += 40) {
    const chunk = pairs.slice(i, i + 40);
    const values = chunk
      .flatMap(([city, state]) => {
        const label = JSON.stringify(titleCase(city));
        return [`(${label}@en "US-${state}")`, `(${label}@mul "US-${state}")`];
      })
      .join(" ");
    const rows = await sparql(`
      SELECT ?name ?code ?city ?cityLabel ?coord ?pop WHERE {
        VALUES (?name ?code) { ${values} }
        ?state wdt:P300 ?code.
        ?city rdfs:label|skos:altLabel ?name; wdt:P131/wdt:P131? ?state; wdt:P625 ?coord.
        OPTIONAL { ?city wdt:P1082 ?pop. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en,mul". }
      }`);
    // Several places can share a name in one state: the most populous wins.
    const best = new Map();
    for (const r of rows) {
      const key = `${v(r, "name").toLowerCase()}|${v(r, "code").slice(3)}`;
      const pop = Number(v(r, "pop") ?? 0);
      const at = point(v(r, "coord"));
      if (at && (!best.has(key) || pop > best.get(key).pop)) best.set(key, { pop, city: v(r, "cityLabel"), lat: round(at.lat), lon: round(at.lon) });
    }
    for (const [key, { city, lat, lon }] of best) out.set(key, { city, lat, lon });
    process.stderr.write(`  cities ${Math.min(i + 40, pairs.length)}/${pairs.length}
`);
  }
  return out;
}

/** Business address the company files with the SEC, placed on its city — for
 *  US listings with a US address. ticker → location. */
async function secAddresses(companies) {
  const found = new Map();
  const us = [...companies.keys()].filter((t) => companies.get(t).group === "us").sort();
  const res = await get("https://www.sec.gov/files/company_tickers.json", { headers: { "User-Agent": SEC_UA } });
  if (!res.ok) {
    console.warn(`SEC ticker list: ${res.status}; skipping the SEC check`);
    return found;
  }
  const cik = new Map(Object.values(await res.json()).map((e) => [e.ticker, e.cik_str]));
  const addresses = new Map(); // ticker → { cik, city, state }
  for (const [n, ticker] of us.entries()) {
    const id = cik.get(ticker) ?? cik.get(ticker.replace(".", "-"));
    if (!id) continue;
    await sleep(120); // SEC allows 10 requests a second
    const sub = await get(`https://data.sec.gov/submissions/CIK${String(id).padStart(10, "0")}.json`, { headers: { "User-Agent": SEC_UA } });
    if (n % 100 === 99) process.stderr.write(`  SEC ${n + 1}/${us.length}
`);
    if (!sub.ok) continue;
    const addr = (await sub.json()).addresses?.business;
    if (addr?.city && US_STATES.has(addr.stateOrCountry)) addresses.set(ticker, { cik: id, city: addr.city.trim(), state: addr.stateOrCountry });
  }
  const pairs = [...new Map([...addresses.values()].map((a) => [`${a.city}|${a.state}`, [a.city, a.state]])).values()];
  const places = await usCities(pairs);
  for (const [ticker, a] of addresses) {
    const place = places.get(`${titleCase(a.city).toLowerCase()}|${a.state}`);
    if (place) found.set(ticker, { ...place, country: "United States", source: `sec:${a.cik}` });
  }
  return found;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const companies = await loadCompanies();
const tickers = [...companies.keys()].sort();

const { found: wdTicker, review } = await byTicker(companies);
console.log(`Wikidata by ticker: ${wdTicker.size}`);

let missing = tickers.filter((t) => !wdTicker.has(t));
const wdName = await byName(companies, missing);
console.log(`Wikidata by name:   ${wdName.size}`);

// US listings: the address filed with the SEC is current, where Wikidata can
// keep a predecessor's HQ under the same ticker (IR on Trane's old Irish
// office). It fills the gaps, and wins when Wikidata puts the company more
// than 150 km from it.
const sec = await secAddresses(companies);
const all = new Map([...wdTicker, ...wdName]);
const overridden = [];
let secFilled = 0;
for (const [ticker, place] of sec) {
  const wd = all.get(ticker);
  if (!wd) {
    all.set(ticker, place);
    secFilled++;
  } else if (km(wd, place) > 150) {
    overridden.push(`${ticker}: Wikidata ${wd.city}, ${wd.country} → SEC ${place.city}`);
    all.set(ticker, place);
  }
}
console.log(`SEC EDGAR:          ${secFilled} filled, ${overridden.length} corrected`);
missing = tickers.filter((t) => !all.has(t));

const locations = Object.fromEntries(
  tickers.filter((t) => all.has(t)).map((t) => {
    const { city, country, lat, lon, source } = all.get(t);
    return [t, { city, country, lat, lon, source }];
  }),
);

await writeFile(
  OUT,
  `${JSON.stringify(
    {
      generated_at: new Date().toISOString().slice(0, 10),
      sources: "Wikidata (CC0) headquarters location P159 / coordinates P625; SEC EDGAR business address for US listings where Wikidata has none or disagrees",
      count: Object.keys(locations).length,
      missing,
      locations,
    },
    null,
    1,
  )}\n`,
);

console.log(`\n${Object.keys(locations).length} of ${tickers.length} placed; ${missing.length} without a location:`);
for (const t of missing) console.log(`  ${t}  ${companies.get(t).name}`);
if (overridden.length) {
  console.log(`
Wikidata's HQ replaced by the SEC business address:`);
  for (const line of overridden) console.log(`  ${line}`);
}
if (review.length) {
  console.log(`\nMatched by ticker although the names differ — check these:`);
  for (const line of review) console.log(`  ${line}`);
}
