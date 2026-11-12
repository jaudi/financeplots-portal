// Cap Table & Dilution (/tools/cap-table). The share maths — SAFE conversion,
// the round's price per share, the option-pool refresh and legal rounding —
// is @1984vc/cap-table (MIT, 1984 Ventures), which solves the terms together
// and reconciles share counts exactly. This file turns the page's boxes into
// the library's input, checks the inputs in words a founder can act on, and
// lines up "today" against "after" row by row.

import {
  buildEstimatedPreRoundCapTable,
  buildExistingShareholderCapTable,
  buildPricedRoundCapTable,
  CalculationError,
  CapTableRowType,
  CommonRowType,
  fitConversion,
  type CommonStockholder,
  type SAFENote,
  type SeriesInvestor,
} from "@1984vc/cap-table";

/** How a SAFE converts. "mfn" is an uncapped SAFE that takes the best terms of
 *  a later SAFE (most-favoured nation); "yc7p" is YC's standard 7% deal. */
export type SafeKind = "post" | "pre" | "mfn" | "yc7p";
export const SAFE_KINDS: SafeKind[] = ["post", "pre", "mfn", "yc7p"];

export interface Holder { name: string; shares: number }
export interface SafeInput { name: string; investment: number; cap: number; discountPct: number; kind: SafeKind }
export interface Investor { name: string; investment: number }

export interface Scenario {
  /** Founders, employees, angels with shares, and options already granted. */
  holders: Holder[];
  /** Options set aside for future hires and not yet granted. */
  unusedPool: number;
  /** In the order they were signed — it matters for MFN elections. */
  safes: SafeInput[];
  roundOn: boolean;
  preMoney: number;
  investors: Investor[];
  /** The unused pool after the round, as a % of all shares (10 = 10%). */
  targetPoolPct: number;
}

export type RowKind = "holder" | "safe" | "series" | "pool";

export interface Row {
  kind: RowKind;
  /** Position in its own list (holders, safes, investors), for names and colours. */
  index: number;
  name: string;
  sharesBefore: number;
  pctBefore: number;
  /** Undefined when it can't be known yet (an uncapped SAFE before a priced round). */
  sharesAfter?: number;
  pctAfter?: number;
  invested?: number;
  /** Price per share this row paid or converted at. */
  pps?: number;
  /** "tbd": can't be worked out until a priced round; "caveat": an estimate. */
  note?: "tbd" | "caveat";
}

export type CapTableError =
  | { key: "noHolders" }
  | { key: "safeAmount"; name: string }
  | { key: "safeCap"; name: string }
  | { key: "safesTooBig" }
  | { key: "roundIncomplete" }
  | { key: "poolTooBig" }
  | { key: "failed"; detail: string };

export type CapTableResult =
  | {
      ok: true;
      /** "round": a priced round entered; "estimate": SAFEs only, no round yet; "today": shares only. */
      mode: "round" | "estimate" | "today";
      rows: Row[];
      totalBefore: number;
      totalAfter?: number;
      /** The round's price per share. */
      pps?: number;
      postMoney?: number;
      seriesInvestment?: number;
      safeInvestment: number;
      newShares?: number;
      additionalOptions?: number;
      /** Today's shareholders together (everyone but the unused pool), before and after. */
      holdersBefore: number;
      holdersAfter?: number;
    }
  | { ok: false; error: CapTableError };

const label = (name: string, fallback: string) => name.trim() || fallback;

function toSafe(s: SafeInput, i: number): SAFENote {
  const base = { id: `s${i}`, name: label(s.name, `SAFE ${i + 1}`), investment: s.investment, type: CapTableRowType.Safe as const };
  switch (s.kind) {
    case "yc7p":
      return { ...base, cap: 0, discount: 0, conversionType: "yc7p" };
    case "mfn":
      return { ...base, cap: 0, discount: 0, conversionType: "post", sideLetters: ["mfn"] };
    default:
      return { ...base, cap: Math.max(0, s.cap), discount: Math.min(0.99, Math.max(0, s.discountPct / 100)), conversionType: s.kind };
  }
}

/** Plain-words checks before the library's own, so the page can say what to fix. */
export function checkScenario(sc: Scenario): CapTableError | null {
  if (!sc.holders.some((h) => h.shares > 0)) return { key: "noHolders" };
  let postOwnership = 0;
  for (const [i, s] of sc.safes.entries()) {
    const name = label(s.name, `SAFE ${i + 1}`);
    if (!(s.investment > 0)) return { key: "safeAmount", name };
    if ((s.kind === "post" || s.kind === "pre") && s.cap > 0 && s.investment >= s.cap) return { key: "safeCap", name };
    if (s.kind === "yc7p") postOwnership += 0.07;
    else if (s.kind === "post" && s.cap > 0) postOwnership += s.investment / s.cap;
  }
  if (postOwnership >= 1) return { key: "safesTooBig" };
  if (sc.roundOn) {
    if (!(sc.preMoney > 0) || !sc.investors.some((v) => v.investment > 0)) return { key: "roundIncomplete" };
    if (sc.targetPoolPct < 0 || sc.targetPoolPct >= 50) return { key: "poolTooBig" };
  }
  return null;
}

export function capTable(sc: Scenario): CapTableResult {
  const problem = checkScenario(sc);
  if (problem) return { ok: false, error: problem };

  // Rows with no shares or no money are left out: the library rejects them,
  // and an empty line on the page means "not used".
  const holders = sc.holders.map((h, i) => ({ h, i })).filter(({ h }) => h.shares > 0);
  const common: CommonStockholder[] = holders.map(({ h, i }) => ({
    id: `h${i}`,
    name: label(h.name, `Shareholder ${i + 1}`),
    shares: Math.floor(h.shares),
    type: CapTableRowType.Common,
    commonType: CommonRowType.Shareholder,
  }));
  const unused = Math.max(0, Math.floor(sc.unusedPool));
  const pool: CommonStockholder[] = unused > 0
    ? [{ id: "pool", name: "Options Pool", shares: unused, type: CapTableRowType.Common, commonType: CommonRowType.UnusedOptions }]
    : [];
  const safes = sc.safes.map(toSafe);
  const investors = sc.investors.map((v, i) => ({ v, i })).filter(({ v }) => v.investment > 0);
  const series: SeriesInvestor[] = investors.map(({ v, i }) => ({
    id: `v${i}`,
    name: label(v.name, `Investor ${i + 1}`),
    investment: v.investment,
    type: CapTableRowType.Series,
  }));

  try {
    const today = buildExistingShareholderCapTable([...common, ...pool]);
    const totalBefore = today.total.shares;
    // The library drops ids and lists the pool apart from `common`, keeping
    // the shareholders in the order given, so rows are matched by position.
    const rows: Row[] = holders.map(({ h, i }, k) => {
      const r = today.common[k];
      return { kind: "holder", index: i, name: label(h.name, `Shareholder ${i + 1}`), sharesBefore: r?.shares ?? 0, pctBefore: r?.ownershipPct ?? 0 };
    });
    const poolRow: Row = { kind: "pool", index: 0, name: "", sharesBefore: unused, pctBefore: totalBefore > 0 ? unused / totalBefore : 0 };
    const safeInvestment = safes.reduce((a, s) => a + s.investment, 0);
    const holdersBefore = rows.reduce((a, r) => a + r.pctBefore, 0);

    if (!sc.roundOn && safes.length === 0) {
      return { ok: true, mode: "today", rows: [...rows, poolRow], totalBefore, safeInvestment, holdersBefore };
    }

    if (!sc.roundOn) {
      const est = buildEstimatedPreRoundCapTable([...common, ...pool, ...safes]);
      for (const [k, r] of rows.entries()) {
        const a = est.common[k];
        r.sharesAfter = a?.shares;
        r.pctAfter = a?.ownershipPct;
      }
      const tbd = est.safes.some((s) => s.ownershipError?.type === "tbd");
      const safeRows: Row[] = est.safes.map((s, i) => ({
        kind: "safe",
        index: i,
        name: safes[i].name ?? "",
        sharesBefore: 0,
        pctBefore: 0,
        sharesAfter: s.ownershipError?.type === "tbd" ? undefined : s.shares,
        pctAfter: s.ownershipError?.type === "tbd" ? undefined : s.ownershipPct,
        invested: s.investment,
        pps: s.pps,
        note: s.ownershipError?.type,
      }));
      // With an uncapped SAFE outstanding nobody's final share is known.
      if (tbd) for (const r of rows) { r.sharesAfter = undefined; r.pctAfter = undefined; r.note = "tbd"; }
      const pa = est.optionsPool;
      const poolAfter: Row = { ...poolRow, sharesAfter: tbd ? undefined : pa.shares, pctAfter: tbd ? undefined : pa.ownershipPct };
      const allRows = [...rows, ...safeRows, poolAfter];
      return {
        ok: true,
        mode: "estimate",
        rows: allRows,
        totalBefore,
        totalAfter: tbd ? undefined : est.total.shares,
        safeInvestment,
        holdersBefore,
        holdersAfter: tbd ? undefined : rows.reduce((a, r) => a + (r.pctAfter ?? 0), 0),
      };
    }

    const commonShares = common.reduce((a, c) => a + c.shares, 0);
    const conversion = fitConversion(
      sc.preMoney,
      commonShares,
      safes,
      unused,
      sc.targetPoolPct / 100,
      series.map((s) => s.investment),
    );
    const table = buildPricedRoundCapTable(conversion, [...common, ...pool, ...safes, ...series]);
    for (const [k, r] of rows.entries()) {
      const a = table.common[k];
      r.sharesAfter = a?.shares ?? r.sharesBefore;
      r.pctAfter = a?.ownershipPct ?? 0;
    }
    const safeRows: Row[] = table.safes.map((s, i) => ({
      kind: "safe",
      index: i,
      name: safes[i].name ?? "",
      sharesBefore: 0,
      pctBefore: 0,
      sharesAfter: s.shares ?? 0,
      pctAfter: s.ownershipPct ?? 0,
      invested: s.investment,
      pps: s.pps,
    }));
    const seriesRows: Row[] = table.series.map((s, i) => ({
      kind: "series",
      index: investors[i].i,
      name: series[i].name ?? "",
      sharesBefore: 0,
      pctBefore: 0,
      sharesAfter: s.shares,
      pctAfter: s.ownershipPct,
      invested: s.investment,
      pps: s.pps,
    }));
    const poolAfter: Row = { ...poolRow, sharesAfter: table.optionsPool.shares, pctAfter: table.optionsPool.ownershipPct ?? 0 };
    const totalAfter = table.total.shares;
    return {
      ok: true,
      mode: "round",
      rows: [...rows, ...safeRows, ...seriesRows, poolAfter],
      totalBefore,
      totalAfter,
      pps: conversion.pps,
      postMoney: conversion.pps * totalAfter,
      seriesInvestment: conversion.totalSeriesInvestment,
      safeInvestment,
      newShares: totalAfter - totalBefore,
      additionalOptions: conversion.additionalOptions,
      holdersBefore,
      holdersAfter: rows.reduce((a, r) => a + (r.pctAfter ?? 0), 0),
    };
  } catch (e) {
    if (e instanceof CalculationError) return { ok: false, error: { key: "failed", detail: e.message } };
    return { ok: false, error: { key: "failed", detail: e instanceof Error ? e.message : String(e) } };
  }
}

export interface ExampleNames { founder1: string; founder2: string; granted: string; preSeed: string; angel: string; lead: string }
const EXAMPLE_NAMES: ExampleNames = {
  founder1: "Founder 1", founder2: "Founder 2", granted: "Options granted", preSeed: "Pre-seed SAFE", angel: "Angel SAFE", lead: "Lead investor",
};

/** What the page opens on: amounts only, generic names (the page passes them in its own language). */
export function exampleScenario(n: ExampleNames = EXAMPLE_NAMES): Scenario {
  return {
    holders: [
      { name: n.founder1, shares: 4_500_000 },
      { name: n.founder2, shares: 4_500_000 },
      { name: n.granted, shares: 250_000 },
    ],
    unusedPool: 750_000,
    safes: [
      { name: n.preSeed, investment: 750_000, cap: 10_000_000, discountPct: 0, kind: "post" },
      { name: n.angel, investment: 500_000, cap: 13_000_000, discountPct: 0, kind: "post" },
    ],
    roundOn: true,
    preMoney: 25_000_000,
    investors: [{ name: n.lead, investment: 4_000_000 }],
    targetPoolPct: 10,
  };
}
