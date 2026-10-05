// The pitch deck's content model and the checks an investor would run on it,
// kept out of the page so they can be tested.
//
// The deck follows the conventions of top-tier consulting and private-equity
// decks: an executive summary up front; one message per slide, stated as a
// full-sentence "action title" (read the titles alone and you have the story);
// a source under every figure that came from somewhere; and the numbers
// investors check first — market size built bottom-up, unit economics
// (LTV/CAC, payback), EBITDA rather than net profit, and runway on the ask.

export const SLIDES = [
  "cover", "summary", "problem", "solution", "whyNow", "market", "competition",
  "model", "traction", "unitEconomics", "financials", "team", "ask", "closing",
] as const;
export type SlideKey = (typeof SLIDES)[number];

/** Slide names as shown in the builder's tabs and the deck's section tracker. */
export const SLIDE_NAMES: Record<SlideKey, string> = {
  cover: "Cover",
  summary: "Executive summary",
  problem: "Problem",
  solution: "Solution",
  whyNow: "Why now",
  market: "Market",
  competition: "Competition",
  model: "Business model",
  traction: "Traction",
  unitEconomics: "Unit economics",
  financials: "Financials",
  team: "Team",
  ask: "The ask",
  closing: "Contact",
};

export const COMPETITORS = 4;
export const CRITERIA = 4;

export type PitchData = {
  company: string;
  tagline: string;
  industry: string;
  deckDate: string;
  logo: string | null; // base64 data URL
  /** One per line; blank = generated from the rest of the deck. */
  highlights: string;
  problems: Array<{ label: string; desc: string }>;
  solNarrative: string;
  differentiators: string[];
  /** One trend per line: what changed that makes this possible now. */
  whyNow: string;
  tamVal: number; // billions
  samVal: number; // billions
  somVal: number; // millions
  mktNarrative: string;
  mktSource: string;
  /** What customers compare you on, and who else they could choose. */
  criteria: string[];
  usHas: boolean[];
  competitors: Array<{ name: string; has: boolean[] }>;
  revStreams: string;
  pricing: string;
  kpis: Array<{ label: string; value: string }>;
  milestones: string;
  /** Average revenue per customer per month, gross margin %, monthly churn %, cost to acquire a customer. */
  arpa: number;
  grossMarginPct: number;
  churnPct: number;
  cac: number;
  revVals: number[];
  /** EBITDA by year (negative for a loss). Named profVals for older saved decks. */
  profVals: number[];
  assumptions: string;
  team: Array<{ name: string; role: string; bio: string }>;
  fundingAmt: number;
  fundingType: string;
  /** 0 = not shown. */
  preMoney: number;
  runwayMonths: number;
  useOfFunds: Array<{ label: string; pct: number }>;
  achieveText: string;
  contactName: string;
  contactEmail: string;
  website: string;
  /** The visitor's own action titles; a missing or blank one uses the generated title. */
  headlines: Partial<Record<SlideKey, string>>;
};

export const DEFAULT_PITCH: PitchData = {
  company: "My Company",
  tagline: "Transforming X with Y",
  industry: "SaaS",
  deckDate: new Date().toISOString().slice(0, 10),
  logo: null,
  highlights: "",
  problems: [
    { label: "Inefficiency", desc: "Manual processes waste time and money." },
    { label: "High cost", desc: "Existing solutions are expensive and hard to implement." },
    { label: "", desc: "" },
  ],
  solNarrative: "We provide an easy-to-use platform that automates X, reduces costs by Y, and delivers Z.",
  differentiators: ["10× faster", "50% cheaper", ""],
  whyNow: "Cloud adoption among mid-sized firms passed 70%\nNew regulation makes manual reporting costlier\nAI makes automation affordable at small scale",
  tamVal: 10,
  samVal: 2,
  somVal: 50,
  mktNarrative: "Bottom-up: 40,000 target companies × $2,500 average annual contract for SAM.",
  mktSource: "Company analysis; industry reports",
  criteria: ["Easy to set up", "Affordable for SMEs", "Automated reporting", "Integrations"],
  usHas: [true, true, true, true],
  competitors: [
    { name: "Legacy suite", has: [false, false, true, true] },
    { name: "Spreadsheets", has: [true, true, false, false] },
    { name: "Consultants", has: [false, false, true, false] },
    { name: "", has: [false, false, false, false] },
  ],
  revStreams: "SaaS subscription (monthly / annual)\nProfessional services\nMarketplace transaction fees",
  pricing: "Starter: $49/mo\nGrowth: $199/mo\nEnterprise: custom",
  kpis: [
    { label: "MRR", value: "$25K" },
    { label: "Customers", value: "120" },
    { label: "MoM growth", value: "18%" },
    { label: "", value: "" },
  ],
  milestones: "Launched MVP — Jan 2024\nFirst 100 paying customers — Apr 2024\nSeed round closed — Jul 2024",
  arpa: 210,
  grossMarginPct: 78,
  churnPct: 2,
  cac: 1800,
  revVals: [300000, 750000, 1600000, 3000000, 5000000],
  profVals: [-650000, -450000, -100000, 350000, 1000000],
  assumptions: "Customers grow 120 → 2,000 over five years\nPrice rises 5% a year\nSales team of 2 → 12",
  team: [
    { name: "John Smith", role: "CEO & Co-Founder", bio: "10 years in B2B SaaS. Previously VP at Acme Corp." },
    { name: "Jane Doe", role: "CTO & Co-Founder", bio: "Ex-Google engineer. 8 years in ML infrastructure." },
    { name: "", role: "", bio: "" },
    { name: "", role: "", bio: "" },
  ],
  fundingAmt: 1500000,
  fundingType: "Seed",
  preMoney: 0,
  runwayMonths: 18,
  useOfFunds: [
    { label: "Product & Engineering", pct: 40 },
    { label: "Sales & Marketing", pct: 35 },
    { label: "Operations", pct: 25 },
    { label: "", pct: 0 },
  ],
  achieveText: "Reach $1M ARR\nExpand to 3 new markets\nBe Series A-ready in 18 months",
  contactName: "",
  contactEmail: "",
  website: "",
  headlines: {},
};

// ── Formatting ───────────────────────────────────────────────────────────────

/** $1.5M, $750K, $2.3B, −$650K. */
export function compact(sym: string, v: number): string {
  const a = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  const fix = (x: number) => (x >= 100 || Number.isInteger(x) ? x.toFixed(0) : x.toFixed(1)).replace(/\.0$/, "");
  if (a >= 1e9) return `${sign}${sym}${fix(a / 1e9)}B`;
  if (a >= 1e6) return `${sign}${sym}${fix(a / 1e6)}M`;
  if (a >= 1e3) return `${sign}${sym}${fix(a / 1e3)}K`;
  return `${sign}${sym}${Math.round(a)}`;
}

/** Lines of a one-per-line field. */
export const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

const lowerFirst = (s: string) => (s && !/^[A-Z]{2}/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const joinAnd = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

// ── Metrics ──────────────────────────────────────────────────────────────────

export interface UnitEconomics {
  /** Gross profit per customer per month. */
  monthlyGrossProfit: number;
  /** Expected customer lifetime in months (1 ÷ monthly churn). Null without churn. */
  lifetimeMonths: number | null;
  /** ARPA × gross margin ÷ monthly churn. */
  ltv: number | null;
  ltvToCac: number | null;
  /** Months of gross profit to earn back the CAC. */
  paybackMonths: number | null;
}

export function unitEconomics(d: Pick<PitchData, "arpa" | "grossMarginPct" | "churnPct" | "cac">): UnitEconomics {
  const monthlyGrossProfit = Math.max(0, d.arpa) * Math.max(0, d.grossMarginPct) / 100;
  const churn = d.churnPct / 100;
  const ltv = churn > 0 ? monthlyGrossProfit / churn : null;
  return {
    monthlyGrossProfit,
    lifetimeMonths: churn > 0 ? 1 / churn : null,
    ltv,
    ltvToCac: ltv !== null && d.cac > 0 ? ltv / d.cac : null,
    paybackMonths: monthlyGrossProfit > 0 && d.cac > 0 ? d.cac / monthlyGrossProfit : null,
  };
}

export interface Financials {
  /** Year-on-year revenue growth, % (null where the prior year is 0). */
  growth: (number | null)[];
  cagr: number | null;
  margins: (number | null)[];
  /** First year (1-based) with positive EBITDA, or null. */
  breakEvenYear: number | null;
}

export function financials(d: Pick<PitchData, "revVals" | "profVals">): Financials {
  const r = d.revVals;
  const growth = r.map((v, i) => (i === 0 || r[i - 1] <= 0 ? null : ((v - r[i - 1]) / r[i - 1]) * 100));
  const n = r.length - 1;
  const cagr = n > 0 && r[0] > 0 && r[n] > 0 ? (Math.pow(r[n] / r[0], 1 / n) - 1) * 100 : null;
  const margins = r.map((v, i) => (v > 0 ? (d.profVals[i] / v) * 100 : null));
  const idx = d.profVals.findIndex((p) => p > 0);
  return { growth, cagr, margins, breakEvenYear: idx < 0 ? null : idx + 1 };
}

/** Investor's share after the round, % — needs a pre-money valuation. */
export function dilutionPct(d: Pick<PitchData, "fundingAmt" | "preMoney">): number | null {
  return d.preMoney > 0 && d.fundingAmt > 0 ? (d.fundingAmt / (d.preMoney + d.fundingAmt)) * 100 : null;
}

// ── Action titles ────────────────────────────────────────────────────────────

/** Where we win: criteria only we meet, or else two that only we combine. */
export function edge(d: Pick<PitchData, "criteria" | "usHas" | "competitors">): { kind: "only" | "combines"; items: string[] } | null {
  const rivals = d.competitors.filter((c) => c.name.trim());
  const ours = d.criteria.map((c, i) => ({ c: c.trim(), i })).filter(({ c, i }) => c && d.usHas[i]);
  const only = ours.filter(({ i }) => !rivals.some((r) => r.has[i]));
  if (only.length) return { kind: "only", items: only.slice(0, 2).map(({ c }) => c) };
  for (let a = 0; a < ours.length; a++) {
    for (let b = a + 1; b < ours.length; b++) {
      if (!rivals.some((r) => r.has[ours[a].i] && r.has[ours[b].i])) return { kind: "combines", items: [ours[a].c, ours[b].c] };
    }
  }
  return null;
}

/** A full-sentence title for every slide, from the deck's own figures. */
export function generatedHeadlines(d: PitchData, sym: string): Record<SlideKey, string> {
  const probs = d.problems.map((p) => p.label.trim()).filter(Boolean);
  const diffs = d.differentiators.map((x) => x.trim()).filter(Boolean);
  const trends = lines(d.whyNow);
  const kpis = d.kpis.filter((k) => k.label.trim() && k.value.trim());
  const streams = lines(d.revStreams);
  const team = d.team.filter((m) => m.name.trim());
  const ue = unitEconomics(d);
  const fin = financials(d);
  const last = d.revVals.length - 1;
  const win = edge(d);
  const rivals = d.competitors.filter((c) => c.name.trim()).length;
  const goal = lines(d.achieveText)[0];

  let financialsTitle = `Revenue reaches ${compact(sym, d.revVals[last])} in year ${last + 1}`;
  if (d.revVals[0] > 0) financialsTitle = `Revenue grows from ${compact(sym, d.revVals[0])} in year 1 to ${compact(sym, d.revVals[last])} in year ${last + 1}`;
  if (fin.cagr !== null) financialsTitle += ` (${fin.cagr.toFixed(0)}% a year)`;
  if (fin.breakEvenYear === 1) financialsTitle += `, profitable from year 1`;
  else if (fin.breakEvenYear) financialsTitle += `, EBITDA-positive from year ${fin.breakEvenYear}`;

  return {
    cover: d.tagline,
    summary: `${d.company} in one page`,
    problem: probs.length ? `Customers today struggle with ${joinAnd(probs.map(lowerFirst))}` : "The problem we solve",
    solution: diffs.length ? `${d.company} removes these pain points: ${joinAnd(diffs.map(lowerFirst))}` : `How ${d.company} solves it`,
    whyNow: trends.length ? `Why now: ${lowerFirst(trends[0])}` : "Why this is the right moment",
    market: `A ${compact(sym, d.tamVal * 1e9)} market, ${compact(sym, d.samVal * 1e9)} of it serviceable — we target ${compact(sym, d.somVal * 1e6)}`,
    competition: win
      ? `Only ${d.company} ${win.kind === "only" ? "offers" : "combines"} ${joinAnd(win.items.map(lowerFirst))}`
      : rivals ? `How ${d.company} compares with ${rivals} alternative${rivals > 1 ? "s" : ""}` : "The alternatives customers have today",
    model: streams.length ? `${streams.length} revenue stream${streams.length > 1 ? "s" : ""}, led by ${lowerFirst(streams[0])}` : "How we make money",
    traction: kpis.length >= 2
      ? `${kpis[0].value} ${kpis[0].label} and ${kpis[1].value} ${kpis[1].label} to date`
      : kpis.length ? `${kpis[0].value} ${kpis[0].label} to date` : "Progress to date",
    unitEconomics: ue.ltvToCac !== null && ue.paybackMonths !== null
      ? `Each customer returns ${ue.ltvToCac.toFixed(1)}× its acquisition cost, which is earned back in ${Math.round(ue.paybackMonths)} months`
      : "What each customer is worth",
    financials: financialsTitle,
    team: team.length
      ? `Led by ${joinAnd(team.slice(0, 2).map((m) => (m.role.trim() ? `${m.name.trim()} (${m.role.trim()})` : m.name.trim())))}`
      : "The team",
    ask: `Raising ${compact(sym, d.fundingAmt)} ${d.fundingType}${d.runwayMonths > 0 ? ` for ${d.runwayMonths} months of runway` : ""}${goal ? ` to ${lowerFirst(goal)}` : ""}`,
    closing: "Thank you",
  };
}

export function headlineFor(d: PitchData, sym: string, slide: SlideKey): string {
  return d.headlines[slide]?.trim() || generatedHeadlines(d, sym)[slide];
}

/** The executive summary's points: the visitor's own, or one per proof point. */
export function summaryPoints(d: PitchData, sym: string): string[] {
  const own = lines(d.highlights);
  if (own.length) return own.slice(0, 6);
  const out: string[] = [];
  const probs = d.problems.map((p) => p.label.trim()).filter(Boolean);
  if (probs.length) out.push(`Problem: ${joinAnd(probs.map(lowerFirst))} — ${d.company}: ${d.tagline}`);
  out.push(`Market: ${compact(sym, d.tamVal * 1e9)} total, ${compact(sym, d.samVal * 1e9)} serviceable`);
  const kpis = d.kpis.filter((k) => k.label.trim() && k.value.trim());
  if (kpis.length) out.push(`Traction: ${kpis.slice(0, 3).map((k) => `${k.value} ${k.label}`).join(", ")}`);
  const ue = unitEconomics(d);
  if (ue.ltvToCac !== null && ue.paybackMonths !== null) {
    out.push(`Unit economics: LTV/CAC ${ue.ltvToCac.toFixed(1)}×, CAC payback ${Math.round(ue.paybackMonths)} months`);
  }
  const fin = financials(d);
  const last = d.revVals.length - 1;
  out.push(`Plan: ${compact(sym, d.revVals[last])} revenue in year ${last + 1}${fin.breakEvenYear ? `, EBITDA-positive from year ${fin.breakEvenYear}` : ""}`);
  const lead = d.team.find((m) => m.name.trim());
  if (lead) out.push(`Team: led by ${lead.name.trim()}${lead.role.trim() ? `, ${lead.role.trim()}` : ""}`);
  out.push(`Ask: ${compact(sym, d.fundingAmt)} ${d.fundingType}${d.runwayMonths > 0 ? `, ${d.runwayMonths} months of runway` : ""}`);
  return out.slice(0, 6);
}

// ── Investor review ──────────────────────────────────────────────────────────

export interface Finding {
  /** `fix`: an investor would stop at it. `check`: it will draw a question. */
  level: "fix" | "check";
  slide: SlideKey;
  message: string;
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** What an investor's first read would flag, worst first. */
export function reviewDeck(d: PitchData): Finding[] {
  const f: Finding[] = [];
  const ue = unitEconomics(d);
  const fin = financials(d);
  const funds = d.useOfFunds.filter((u) => u.label.trim());
  const fundsTotal = funds.reduce((s, u) => s + u.pct, 0);
  const rivals = d.competitors.filter((c) => c.name.trim());
  const dil = dilutionPct(d);

  if (!d.company.trim() || !d.tagline.trim()) f.push({ level: "fix", slide: "cover", message: "Add the company name and a one-line description." });
  if (d.samVal > d.tamVal) f.push({ level: "fix", slide: "market", message: "SAM is larger than TAM — the serviceable market is part of the total." });
  if (d.somVal / 1000 > d.samVal) f.push({ level: "fix", slide: "market", message: "SOM is larger than SAM — what you can win is part of what you can serve." });
  if (funds.length && fundsTotal !== 100) f.push({ level: "fix", slide: "ask", message: `Use of funds adds up to ${fundsTotal}%, not 100%.` });
  if (d.fundingAmt <= 0) f.push({ level: "fix", slide: "ask", message: "State how much you are raising." });
  if (!d.team.some((m) => m.name.trim())) f.push({ level: "fix", slide: "team", message: "Investors back people first: add the team." });

  if (!rivals.length) f.push({ level: "check", slide: "competition", message: "“No competitors” reads as “no market” or “didn't look”. Name the alternatives customers use today, even spreadsheets." });
  if (!d.mktSource.trim()) f.push({ level: "check", slide: "market", message: "Give a source for the market figures, and build SAM bottom-up (customers × price)." });
  if (ue.ltvToCac !== null && ue.ltvToCac < 3) f.push({ level: "check", slide: "unitEconomics", message: `LTV/CAC is ${ue.ltvToCac.toFixed(1)}×. Investors look for 3× or more — explain how it improves.` });
  if (ue.paybackMonths !== null && ue.paybackMonths > 18) f.push({ level: "check", slide: "unitEconomics", message: `CAC payback is ${Math.round(ue.paybackMonths)} months; under 12–18 is the usual bar.` });
  if (ue.ltv === null) f.push({ level: "check", slide: "unitEconomics", message: "Add monthly churn so the deck can show customer lifetime value." });
  if (d.runwayMonths > 0 && d.runwayMonths < 18) f.push({ level: "check", slide: "ask", message: `${d.runwayMonths} months of runway leaves little time to hit the next round's milestones; 18–24 is typical.` });
  fin.growth.forEach((g, i) => {
    if (g !== null && i >= 2 && g > 300) f.push({ level: "check", slide: "financials", message: `Revenue grows ${g.toFixed(0)}% in year ${i + 1}. A hockey stick needs the assumptions behind it on the slide.` });
  });
  if (!fin.breakEvenYear) f.push({ level: "check", slide: "financials", message: "EBITDA stays negative for all five years: show the path to profitability or when funding runs out." });
  if (!lines(d.assumptions).length) f.push({ level: "check", slide: "financials", message: "List the two or three assumptions that drive the projections." });
  if (!lines(d.whyNow).length) f.push({ level: "check", slide: "whyNow", message: "Say what changed that makes this possible now — investors always ask “why now?”." });
  if (d.kpis.filter((k) => k.label.trim() && k.value.trim()).length < 3) f.push({ level: "check", slide: "traction", message: "Show at least three numbers that prove progress (revenue, customers, growth, retention)." });
  d.problems.forEach((p, i) => {
    if (p.label.trim() && !p.desc.trim()) f.push({ level: "check", slide: "problem", message: `Problem ${i + 1} has no description: quantify the pain (hours, cost, risk).` });
  });
  if (words(d.tagline) > 12) f.push({ level: "check", slide: "cover", message: "Keep the one-liner under 12 words." });
  if (dil !== null && dil > 30) f.push({ level: "check", slide: "ask", message: `The round sells ${dil.toFixed(0)}% of the company; 15–25% per round is typical.` });
  for (const s of SLIDES) {
    const own = d.headlines[s]?.trim();
    if (own && words(own) > 18) f.push({ level: "check", slide: s, message: `The ${SLIDE_NAMES[s]} title runs to ${words(own)} words; keep titles to two lines (about 15 words).` });
  }
  return f;
}
