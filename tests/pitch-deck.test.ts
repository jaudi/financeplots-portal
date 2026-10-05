import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import {
  DEFAULT_PITCH, SLIDES, compact, dilutionPct, financials, generatedHeadlines, headlineFor, reviewDeck, summaryPoints, edge, unitEconomics,
  type PitchData,
} from "@/lib/pitch-deck";
import { buildPptx } from "@/app/[locale]/tools/pitch-deck/pptx";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

const deck = (patch: Partial<PitchData> = {}): PitchData => ({ ...DEFAULT_PITCH, ...patch });

describe("pitch deck numbers", () => {
  it("formats money compactly", () => {
    expect(compact("$", 1_500_000)).toBe("$1.5M");
    expect(compact("€", 750_000)).toBe("€750K");
    expect(compact("£", 10e9)).toBe("£10B");
    expect(compact("$", -650_000)).toBe("−$650K");
    expect(compact("$", 999)).toBe("$999");
  });

  it("works out unit economics", () => {
    const u = unitEconomics({ arpa: 200, grossMarginPct: 75, churnPct: 2.5, cac: 1500 });
    expect(u.monthlyGrossProfit).toBe(150);
    expect(u.lifetimeMonths).toBe(40);
    expect(u.ltv).toBe(6000);
    expect(u.ltvToCac).toBe(4);
    expect(u.paybackMonths).toBe(10);
    expect(unitEconomics({ arpa: 200, grossMarginPct: 75, churnPct: 0, cac: 1500 }).ltv).toBeNull();
  });

  it("works out growth, CAGR, margins and the first profitable year", () => {
    const f = financials({ revVals: [100, 200, 400, 800, 1600], profVals: [-50, -20, 0, 80, 400] });
    expect(f.growth).toEqual([null, 100, 100, 100, 100]);
    expect(f.cagr).toBeCloseTo(100, 6);
    expect(f.margins[4]).toBe(25);
    expect(f.breakEvenYear).toBe(4);
    expect(dilutionPct({ fundingAmt: 2e6, preMoney: 8e6 })).toBe(20);
    expect(dilutionPct({ fundingAmt: 2e6, preMoney: 0 })).toBeNull();
  });
});

describe("action titles", () => {
  it("states each slide's message from the deck's own figures", () => {
    const h = generatedHeadlines(deck(), "$");
    expect(h.market).toBe("A $10B market, $2B of it serviceable — we target $50M");
    expect(h.financials).toBe("Revenue grows from $300K in year 1 to $5M in year 5 (102% a year), EBITDA-positive from year 4");
    expect(h.unitEconomics).toMatch(/^Each customer returns 4\.5× its acquisition cost, which is earned back in 11 months$/);
    expect(h.ask).toBe("Raising $1.5M Seed for 18 months of runway to reach $1M ARR");
    expect(h.competition).toBe("Only My Company combines easy to set up and automated reporting");
    for (const k of SLIDES) expect(h[k]).toBeTruthy();
  });

  it("keeps the visitor's own title when there is one", () => {
    const d = deck({ headlines: { market: "Our own title", problem: "   " } });
    expect(headlineFor(d, "$", "market")).toBe("Our own title");
    expect(headlineFor(d, "$", "problem")).toBe(generatedHeadlines(d, "$").problem);
  });

  it("finds where we win: alone on a criterion, or else a pair only we combine", () => {
    expect(edge(deck())).toEqual({ kind: "combines", items: ["Easy to set up", "Automated reporting"] });
    const solo = deck({ competitors: DEFAULT_PITCH.competitors.map(c => ({ ...c, has: [false, false, false, true] })) });
    expect(edge(solo)).toEqual({ kind: "only", items: ["Easy to set up", "Affordable for SMEs"] });
    expect(edge(deck({ usHas: [false, false, false, false] }))).toBeNull();
  });

  it("builds the executive summary unless the visitor wrote one", () => {
    expect(summaryPoints(deck(), "$").length).toBeGreaterThanOrEqual(5);
    expect(summaryPoints(deck({ highlights: "One\nTwo" }), "$")).toEqual(["One", "Two"]);
  });
});

describe("investor review", () => {
  it("has nothing to fix in the example deck", () => {
    expect(reviewDeck(deck()).filter(f => f.level === "fix")).toEqual([]);
  });

  it("flags inconsistent market sizes and funds that don't add up", () => {
    const f = reviewDeck(deck({ tamVal: 1, samVal: 2, useOfFunds: [{ label: "A", pct: 50 }, { label: "B", pct: 30 }] }));
    expect(f.some(x => x.level === "fix" && x.slide === "market" && /SAM is larger than TAM/.test(x.message))).toBe(true);
    expect(f.some(x => x.level === "fix" && x.slide === "ask" && /80%/.test(x.message))).toBe(true);
  });

  it("questions weak unit economics, short runway, no competitors and heavy dilution", () => {
    const f = reviewDeck(deck({
      cac: 20000, runwayMonths: 9, preMoney: 2e6,
      competitors: DEFAULT_PITCH.competitors.map(c => ({ ...c, name: "" })),
    }));
    const slides = f.map(x => x.slide);
    expect(slides).toContain("unitEconomics");
    expect(slides).toContain("competition");
    expect(f.some(x => /runway/.test(x.message))).toBe(true);
    expect(f.some(x => /sells 43%/.test(x.message))).toBe(true);
  });
});

describe("the .pptx", () => {
  it("builds 14 slides with native charts", async () => {
    const pptx = await buildPptx(deck(), "€");
    const buf = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
    const zip = await JSZip.loadAsync(buf);
    const slides = Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n));
    expect(slides).toHaveLength(SLIDES.length);
    const charts = Object.keys(zip.files).filter(n => /^ppt\/charts\/chart\d+\.xml$/.test(n));
    expect(charts.length).toBe(2); // financials bar chart, use-of-funds doughnut
    const market = await zip.file("ppt/slides/slide6.xml")!.async("string");
    expect(market).toContain("€10B");
    expect(market).toContain("Source: Company analysis");
  });
});

describe("pitch chat copy", () => {
  it("has a section name for every slide the chat asks about", () => {
    for (const k of ["cover", "problem", "solution", "whyNow", "market", "competition", "model", "traction", "unitEconomics", "financials", "team", "ask", "closing"] as const) {
      expect(en.pitchChat.section[k]).toBeTruthy();
      expect(es.pitchChat.section[k]).toBeTruthy();
    }
  });
});
