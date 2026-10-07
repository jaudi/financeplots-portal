import type PptxGenJS from "pptxgenjs";
import {
  SLIDES, SLIDE_NAMES, compact, dilutionPct, financials, headlineFor, lines, summaryPoints, unitEconomics,
  type PitchData, type SlideKey,
} from "@/lib/pitch-deck";
import { trackEvent } from "@/lib/analytics";

// Builds the .pptx in the browser. Layout follows consulting-house style:
// a section tracker over a full-sentence action title, one message per slide,
// a thin rule, the evidence below, and a source line at the foot. Charts are
// native PowerPoint charts, so the founder can edit the numbers in place.

const C = {
  NAVY: "0B2545",
  ACCENT: "1F6FEB",
  TEAL: "13A89E",
  LIGHT: "F4F6FA",
  RULE: "D9DEE7",
  DARK: "1F2937",
  GREY: "6B7280",
  WHITE: "FFFFFF",
  NEG: "B42318",
};
const FONT = "Arial";
const W = 13.33;
const L = 0.55; // left margin
const CW = W - 2 * L; // content width

type Slide = ReturnType<PptxGenJS["addSlide"]>;

/** The deck as a PptxGenJS presentation (no browser needed — the tests build it in Node). */
export async function buildPptx(d: PitchData, sym: string): Promise<PptxGenJS> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33" × 7.5"
  pptx.title = `${d.company} — ${d.fundingType} pitch deck`;
  pptx.company = d.company;

  const money = (v: number) => compact(sym, v);
  const title = (k: SlideKey) => headlineFor(d, sym, k);

  function rect(s: Slide, x: number, y: number, w: number, h: number, fill: string, line?: string) {
    s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: fill }, line: { color: line ?? fill, width: line ? 0.75 : 0 } });
  }
  function text(s: Slide, t: string, x: number, y: number, w: number, h: number,
    o: { size?: number; bold?: boolean; italic?: boolean; color?: string; align?: "left" | "center" | "right"; valign?: "top" | "middle" | "bottom" } = {}) {
    s.addText(t, {
      x, y, w, h, fontFace: FONT, fontSize: o.size ?? 12, bold: o.bold ?? false, italic: o.italic ?? false,
      color: o.color ?? C.DARK, align: o.align ?? "left", valign: o.valign ?? "top", wrap: true, margin: 0,
    });
  }
  function bullets(s: Slide, items: string[], x: number, y: number, w: number, h: number, size = 13) {
    if (!items.length) return;
    s.addText(items.map((t) => ({ text: t, options: { bullet: { indent: 14 }, paraSpaceAfter: 8 } })), {
      x, y, w, h, fontFace: FONT, fontSize: size, color: C.DARK, valign: "top", margin: 0,
    });
  }

  let page = 0;
  /** A content slide: section tracker, action title, rule, footer with page number and optional source. */
  function contentSlide(k: SlideKey, source?: string): Slide {
    const s = pptx.addSlide();
    page++;
    text(s, SLIDE_NAMES[k].toUpperCase(), L, 0.32, CW, 0.25, { size: 9, bold: true, color: C.ACCENT });
    text(s, title(k), L, 0.58, CW, 0.95, { size: 22, bold: true, color: C.NAVY });
    rect(s, L, 1.58, CW, 0.02, C.RULE);
    if (source) text(s, `Source: ${source}`, L, 6.78, CW - 1.5, 0.25, { size: 8, italic: true, color: C.GREY });
    rect(s, L, 7.05, CW, 0.01, C.RULE);
    text(s, `${d.company}  ·  Strictly confidential`, L, 7.1, 8, 0.25, { size: 8, color: C.GREY });
    text(s, String(page + 1), W - L - 1, 7.1, 1, 0.25, { size: 8, color: C.GREY, align: "right" });
    return s;
  }
  /** Equal-width cards across the content area. */
  function cards(s: Slide, n: number, y: number, h: number, draw: (x: number, w: number, i: number) => void, gap = 0.2) {
    const w = (CW - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) draw(L + i * (w + gap), w, i);
  }

  const fin = financials(d);
  const ue = unitEconomics(d);

  for (const k of SLIDES) {
    switch (k) {
      case "cover": {
        const s = pptx.addSlide();
        rect(s, 0, 0, W, 7.5, C.NAVY);
        rect(s, L, 3.55, 1.2, 0.05, C.TEAL);
        if (d.logo) {
          try { s.addImage({ data: d.logo, x: W - L - 1.8, y: 0.5, w: 1.8, h: 1.0, sizing: { type: "contain", w: 1.8, h: 1.0 } }); } catch { /* unreadable image: cover without logo */ }
        }
        text(s, d.company, L, 2.1, CW, 1.3, { size: 44, bold: true, color: C.WHITE, valign: "bottom" });
        text(s, title("cover"), L, 3.8, CW * 0.8, 0.9, { size: 20, color: "C9D6EA" });
        const dateStr = new Date(d.deckDate).toLocaleDateString("en-US", { month: "long", year: "numeric" });
        text(s, [d.industry, `${d.fundingType} round`, dateStr].filter(Boolean).join("  ·  "), L, 6.3, CW, 0.35, { size: 12, color: "C9D6EA" });
        text(s, "Strictly confidential — not for distribution", L, 6.7, CW, 0.3, { size: 9, italic: true, color: "8FA3C0" });
        break;
      }

      case "summary": {
        const s = contentSlide(k);
        const pts = summaryPoints(d, sym);
        pts.forEach((p, i) => {
          const y = 1.85 + i * 0.78;
          rect(s, L, y, 0.42, 0.42, C.NAVY);
          text(s, String(i + 1), L, y, 0.42, 0.42, { size: 13, bold: true, color: C.WHITE, align: "center", valign: "middle" });
          text(s, p, L + 0.6, y, 7.6, 0.7, { size: 13, valign: "middle" });
        });
        // Key figures panel
        const px = L + 8.5;
        const pw = CW - 8.5;
        rect(s, px, 1.85, pw, 4.75, C.LIGHT);
        text(s, "KEY FIGURES", px + 0.25, 2.0, pw - 0.5, 0.3, { size: 9, bold: true, color: C.ACCENT });
        const figs: [string, string][] = [
          [money(d.fundingAmt), `${d.fundingType} raise`],
          [money(d.samVal * 1e9), "Serviceable market"],
          [money(d.revVals[d.revVals.length - 1]), `Revenue, year ${d.revVals.length}`],
          ...(ue.ltvToCac !== null ? [[`${ue.ltvToCac.toFixed(1)}×`, "LTV / CAC"] as [string, string]] : []),
        ];
        figs.slice(0, 4).forEach(([v, l], i) => {
          const y = 2.4 + i * 1.03;
          text(s, v, px + 0.25, y, pw - 0.5, 0.55, { size: 26, bold: true, color: C.NAVY });
          text(s, l, px + 0.25, y + 0.55, pw - 0.5, 0.3, { size: 10, color: C.GREY });
        });
        break;
      }

      case "problem": {
        const s = contentSlide(k);
        const probs = d.problems.filter((p) => p.label.trim());
        if (probs.length) cards(s, probs.length, 1.9, 4.7, (x, w, i) => {
          rect(s, x, 1.9, w, 4.7, C.LIGHT);
          rect(s, x, 1.9, w, 0.06, C.NAVY);
          text(s, String(i + 1).padStart(2, "0"), x + 0.3, 2.15, 1, 0.5, { size: 22, bold: true, color: C.ACCENT });
          text(s, probs[i].label, x + 0.3, 2.8, w - 0.6, 0.6, { size: 16, bold: true, color: C.NAVY });
          text(s, probs[i].desc, x + 0.3, 3.5, w - 0.6, 2.9, { size: 13 });
        });
        break;
      }

      case "solution": {
        const s = contentSlide(k);
        rect(s, L, 1.9, CW, 1.7, C.LIGHT);
        rect(s, L, 1.9, 0.06, 1.7, C.TEAL);
        text(s, d.solNarrative, L + 0.35, 2.05, CW - 0.6, 1.4, { size: 15, valign: "middle" });
        const diffs = d.differentiators.filter((x) => x.trim());
        if (diffs.length) {
          text(s, "WHAT SETS US APART", L, 3.9, CW, 0.3, { size: 9, bold: true, color: C.ACCENT });
          cards(s, diffs.length, 4.3, 2.2, (x, w, i) => {
            rect(s, x, 4.3, w, 2.2, C.WHITE, C.RULE);
            rect(s, x, 4.3, w, 0.06, C.TEAL);
            text(s, diffs[i], x + 0.3, 4.55, w - 0.6, 1.8, { size: 18, bold: true, color: C.NAVY, valign: "middle" });
          });
        }
        break;
      }

      case "whyNow": {
        const s = contentSlide(k);
        const trends = lines(d.whyNow).slice(0, 3);
        if (trends.length) cards(s, trends.length, 1.9, 4.7, (x, w, i) => {
          rect(s, x, 1.9, w, 4.7, C.LIGHT);
          text(s, ["①", "②", "③"][i], x + 0.3, 2.1, 1, 0.6, { size: 26, color: C.TEAL });
          text(s, trends[i], x + 0.3, 2.9, w - 0.6, 3.4, { size: 17, bold: true, color: C.NAVY });
        });
        break;
      }

      case "market": {
        const s = contentSlide(k, d.mktSource.trim() || undefined);
        // Nested circles: TAM ⊃ SAM ⊃ SOM.
        const cx = L + 2.9;
        const base = 6.55;
        const circles: [number, string, string, string][] = [
          [4.6, C.LIGHT, "TAM", money(d.tamVal * 1e9)],
          [3.1, "C9D6EA", "SAM", money(d.samVal * 1e9)],
          [1.65, C.NAVY, "SOM", money(d.somVal * 1e6)],
        ];
        circles.forEach(([dia, fill, lbl, val], i) => {
          s.addShape(pptx.ShapeType.ellipse, { x: cx - dia / 2, y: base - dia, w: dia, h: dia, fill: { color: fill }, line: { color: C.WHITE, width: 1.5 } });
          const inner = i === 2;
          const ty = inner ? base - dia / 2 - 0.4 : base - dia + 0.15;
          text(s, lbl, cx - 1, ty, 2, 0.3, { size: 10, bold: true, color: inner ? C.WHITE : C.ACCENT, align: "center" });
          text(s, val, cx - 1.2, ty + 0.28, 2.4, 0.45, { size: inner ? 18 : 16, bold: true, color: inner ? C.WHITE : C.NAVY, align: "center" });
        });
        const rx = L + 6.3;
        const rw = CW - 6.3;
        const rows: [string, string, string][] = [
          ["TAM", money(d.tamVal * 1e9), "Total addressable market — everyone who could buy this kind of product"],
          ["SAM", money(d.samVal * 1e9), "Serviceable market — the segments and regions our product serves today"],
          ["SOM", money(d.somVal * 1e6), "Obtainable market — what we can realistically win in 3–5 years"],
        ];
        rows.forEach(([l, v, desc], i) => {
          const y = 1.95 + i * 1.05;
          text(s, l, rx, y, 0.8, 0.4, { size: 12, bold: true, color: C.ACCENT });
          text(s, v, rx + 0.8, y, 1.6, 0.4, { size: 16, bold: true, color: C.NAVY });
          text(s, desc, rx + 2.5, y + 0.03, rw - 2.5, 0.85, { size: 11, color: C.GREY });
          rect(s, rx, y + 0.9, rw, 0.01, C.RULE);
        });
        if (d.mktNarrative.trim()) {
          text(s, "HOW WE SIZED IT", rx, 5.25, rw, 0.3, { size: 9, bold: true, color: C.ACCENT });
          text(s, d.mktNarrative, rx, 5.55, rw, 1.1, { size: 12 });
        }
        break;
      }

      case "competition": {
        const s = contentSlide(k);
        const crit = d.criteria.map((c, i) => ({ c: c.trim(), i })).filter((x) => x.c);
        const rivals = d.competitors.filter((c) => c.name.trim());
        if (crit.length) {
          const head = [{ text: "", options: { fill: { color: C.WHITE } } },
            ...crit.map(({ c }) => ({ text: c, options: { bold: true, color: C.NAVY, fill: { color: C.WHITE }, align: "center" as const, fontSize: 12 } }))];
          const row = (name: string, has: boolean[], us: boolean) => [
            { text: name, options: { bold: true, color: us ? C.WHITE : C.NAVY, fill: { color: us ? C.NAVY : C.LIGHT }, fontSize: 13 } },
            ...crit.map(({ i }) => ({
              text: has[i] ? "●" : "○",
              options: { color: us ? C.WHITE : has[i] ? C.NAVY : "AAB4C3", fill: { color: us ? C.NAVY : C.LIGHT }, align: "center" as const, fontSize: 18 },
            })),
          ];
          const tableRows = [head, row(d.company, d.usHas, true), ...rivals.map((r) => row(r.name, r.has, false))];
          s.addTable(tableRows, {
            x: L, y: 1.95, w: CW, colW: [3.2, ...crit.map(() => (CW - 3.2) / crit.length)],
            rowH: 0.62, fontFace: FONT, valign: "middle", border: { type: "solid", pt: 2, color: C.WHITE },
          });
          text(s, "●  offers it      ○  does not", L, 6.45, CW, 0.3, { size: 9, color: C.GREY });
        }
        break;
      }

      case "model": {
        const s = contentSlide(k);
        ([["REVENUE STREAMS", lines(d.revStreams)], ["PRICING", lines(d.pricing)]] as [string, string[]][]).forEach(([h, items], i) => {
          const x = L + i * (CW / 2 + 0.1);
          const w = CW / 2 - 0.1;
          rect(s, x, 1.9, w, 4.7, C.LIGHT);
          text(s, h, x + 0.3, 2.1, w - 0.6, 0.3, { size: 9, bold: true, color: C.ACCENT });
          bullets(s, items.slice(0, 8), x + 0.3, 2.5, w - 0.6, 3.9, 14);
        });
        break;
      }

      case "traction": {
        const s = contentSlide(k);
        const kpis = d.kpis.filter((x) => x.label.trim());
        if (kpis.length) cards(s, kpis.length, 1.9, 1.9, (x, w, i) => {
          rect(s, x, 1.9, w, 1.9, C.LIGHT);
          rect(s, x, 1.9, w, 0.06, C.ACCENT);
          text(s, kpis[i].value, x + 0.3, 2.15, w - 0.6, 0.85, { size: 32, bold: true, color: C.NAVY });
          text(s, kpis[i].label, x + 0.3, 3.05, w - 0.6, 0.5, { size: 12, color: C.GREY });
        });
        // Milestone timeline
        const ms = lines(d.milestones).slice(0, 5);
        if (ms.length) {
          text(s, "MILESTONES", L, 4.2, CW, 0.3, { size: 9, bold: true, color: C.ACCENT });
          const y = 5.0;
          rect(s, L, y, CW, 0.03, C.RULE);
          const step = CW / ms.length;
          ms.forEach((m, i) => {
            const x = L + step * i + step / 2;
            s.addShape(pptx.ShapeType.ellipse, { x: x - 0.11, y: y - 0.1, w: 0.22, h: 0.22, fill: { color: C.TEAL }, line: { color: C.WHITE, width: 1.5 } });
            text(s, m, x - step / 2 + 0.1, y + 0.3, step - 0.2, 1.3, { size: 12, align: "center" });
          });
        }
        break;
      }

      case "unitEconomics": {
        const s = contentSlide(k, "Company data. LTV = monthly revenue per customer × gross margin ÷ monthly churn; payback = CAC ÷ monthly gross profit per customer.");
        const tiles: [string, string][] = [
          [money(d.arpa), "Revenue per customer / month"],
          [`${d.grossMarginPct}%`, "Gross margin"],
          [`${d.churnPct}%`, "Monthly churn"],
          [money(d.cac), "Cost to acquire a customer (CAC)"],
        ];
        text(s, "INPUTS", L, 1.85, CW, 0.3, { size: 9, bold: true, color: C.ACCENT });
        cards(s, 4, 2.2, 1.45, (x, w, i) => {
          rect(s, x, 2.2, w, 1.45, C.LIGHT);
          text(s, tiles[i][0], x + 0.3, 2.35, w - 0.6, 0.6, { size: 24, bold: true, color: C.NAVY });
          text(s, tiles[i][1], x + 0.3, 2.98, w - 0.6, 0.5, { size: 11, color: C.GREY });
        });
        const out: [string, string][] = [
          [ue.ltv !== null ? money(ue.ltv) : "n/a", "Lifetime value (LTV)"],
          [ue.ltvToCac !== null ? `${ue.ltvToCac.toFixed(1)}×` : "n/a", "LTV / CAC"],
          [ue.paybackMonths !== null ? `${Math.round(ue.paybackMonths)} months` : "n/a", "CAC payback"],
        ];
        text(s, "WHAT EACH CUSTOMER IS WORTH", L, 4.0, CW, 0.3, { size: 9, bold: true, color: C.ACCENT });
        cards(s, 3, 4.35, 2.2, (x, w, i) => {
          rect(s, x, 4.35, w, 2.2, C.NAVY);
          text(s, out[i][0], x + 0.3, 4.65, w - 0.6, 0.9, { size: 36, bold: true, color: C.WHITE });
          text(s, out[i][1], x + 0.3, 5.6, w - 0.6, 0.5, { size: 13, color: "C9D6EA" });
        });
        break;
      }

      case "financials": {
        const s = contentSlide(k, "Management projections; illustrative, not a forecast of results.");
        const years = d.revVals.map((_, i) => `Year ${i + 1}`);
        s.addChart(pptx.ChartType.bar, [
          { name: "Revenue", labels: years, values: d.revVals },
          { name: "EBITDA", labels: years, values: d.profVals },
        ], {
          x: L, y: 1.8, w: 7.9, h: 3.0, barGrouping: "clustered", chartColors: [C.NAVY, C.TEAL],
          showLegend: true, legendPos: "t", legendFontSize: 10, legendFontFace: FONT,
          catAxisLabelFontSize: 10, catAxisLabelFontFace: FONT, valAxisLabelFontSize: 9, valAxisLabelFontFace: FONT,
          valAxisLabelFormatCode: "#,##0", valGridLine: { color: "E5E7EB", size: 0.5 },
          showValue: false,
        });
        const cell = (t: string, o: Record<string, unknown> = {}) => ({ text: t, options: { fontSize: 10, align: "right" as const, ...o } });
        const head = [cell("", { align: "left" }), ...years.map((y) => cell(y, { bold: true, color: C.NAVY }))];
        const rowsT = [
          head,
          [cell(`Revenue (${sym})`, { align: "left", bold: true }), ...d.revVals.map((v) => cell(money(v)))],
          [cell("Growth", { align: "left", color: C.GREY }), ...fin.growth.map((g) => cell(g === null ? "–" : `${g.toFixed(0)}%`, { color: C.GREY }))],
          [cell(`EBITDA (${sym})`, { align: "left", bold: true }), ...d.profVals.map((v) => cell(money(v), { color: v < 0 ? C.NEG : C.DARK }))],
          [cell("EBITDA margin", { align: "left", color: C.GREY }), ...fin.margins.map((m) => cell(m === null ? "–" : `${m.toFixed(0)}%`, { color: C.GREY }))],
        ];
        s.addTable(rowsT, {
          x: L, y: 4.95, w: 7.9, colW: [1.9, ...years.map(() => 6.0 / years.length)], rowH: 0.3, fontFace: FONT,
          border: { type: "solid", pt: 0.5, color: C.RULE }, valign: "middle",
        });
        const rx = L + 8.3;
        const rw = CW - 8.3;
        rect(s, rx, 1.85, rw, 4.75, C.LIGHT);
        text(s, "KEY ASSUMPTIONS", rx + 0.25, 2.0, rw - 0.5, 0.3, { size: 9, bold: true, color: C.ACCENT });
        bullets(s, lines(d.assumptions).slice(0, 6), rx + 0.25, 2.4, rw - 0.5, 2.6, 12);
        if (fin.cagr !== null) {
          text(s, `${fin.cagr.toFixed(0)}%`, rx + 0.25, 5.15, rw - 0.5, 0.6, { size: 28, bold: true, color: C.NAVY });
          text(s, `Revenue growth a year (CAGR), years 1–${d.revVals.length}`, rx + 0.25, 5.8, rw - 0.5, 0.5, { size: 10, color: C.GREY });
        }
        break;
      }

      case "team": {
        const s = contentSlide(k);
        const team = d.team.filter((m) => m.name.trim()).slice(0, 4);
        if (team.length) cards(s, team.length, 1.9, 4.7, (x, w, i) => {
          const { name, role, bio } = team[i];
          rect(s, x, 1.9, w, 4.7, C.LIGHT);
          s.addShape(pptx.ShapeType.ellipse, { x: x + 0.3, y: 2.15, w: 1.0, h: 1.0, fill: { color: C.NAVY }, line: { color: C.NAVY, width: 0 } });
          const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
          text(s, initials, x + 0.3, 2.15, 1.0, 1.0, { size: 18, bold: true, color: C.WHITE, align: "center", valign: "middle" });
          text(s, name, x + 0.3, 3.35, w - 0.6, 0.45, { size: 15, bold: true, color: C.NAVY });
          text(s, role, x + 0.3, 3.8, w - 0.6, 0.4, { size: 11, bold: true, color: C.ACCENT });
          rect(s, x + 0.3, 4.3, w - 0.6, 0.01, C.RULE);
          text(s, bio, x + 0.3, 4.45, w - 0.6, 2.0, { size: 11 });
        });
        break;
      }

      case "ask": {
        const s = contentSlide(k);
        rect(s, L, 1.85, 4.2, 4.75, C.NAVY);
        text(s, money(d.fundingAmt), L + 0.3, 2.1, 3.6, 0.9, { size: 40, bold: true, color: C.WHITE });
        text(s, `${d.fundingType} round`, L + 0.3, 3.0, 3.6, 0.4, { size: 14, color: "C9D6EA" });
        const facts: [string, string][] = [];
        if (d.runwayMonths > 0) facts.push(["Runway", `${d.runwayMonths} months`]);
        if (d.preMoney > 0) {
          facts.push(["Pre-money valuation", money(d.preMoney)]);
          facts.push(["Post-money valuation", money(d.preMoney + d.fundingAmt)]);
          const dil = dilutionPct(d);
          if (dil !== null) facts.push(["Stake offered", `${dil.toFixed(0)}%`]);
        }
        facts.forEach(([l, v], i) => {
          const y = 3.7 + i * 0.65;
          rect(s, L + 0.3, y - 0.08, 3.6, 0.01, "3B5578");
          text(s, l, L + 0.3, y, 2.2, 0.4, { size: 11, color: "C9D6EA" });
          text(s, v, L + 2.4, y, 1.5, 0.4, { size: 13, bold: true, color: C.WHITE, align: "right" });
        });
        const funds = d.useOfFunds.filter((u) => u.label.trim() && u.pct > 0);
        if (funds.length) {
          text(s, "USE OF FUNDS", L + 4.5, 1.85, 4, 0.3, { size: 9, bold: true, color: C.ACCENT });
          s.addChart(pptx.ChartType.doughnut, [{ name: "Use of funds", labels: funds.map((u) => u.label), values: funds.map((u) => u.pct) }], {
            x: L + 4.4, y: 2.15, w: 4.0, h: 4.4, holeSize: 55, chartColors: [C.NAVY, C.ACCENT, C.TEAL, "9DB4D6"],
            showLegend: true, legendPos: "b", legendFontSize: 10, legendFontFace: FONT,
            showPercent: true, showValue: false, dataLabelColor: C.WHITE, dataLabelFontSize: 10,
          });
        }
        const gx = L + 8.7;
        const gw = CW - 8.7;
        rect(s, gx, 1.85, gw, 4.75, C.LIGHT);
        text(s, "WHAT THIS ROUND DELIVERS", gx + 0.25, 2.0, gw - 0.5, 0.3, { size: 9, bold: true, color: C.ACCENT });
        bullets(s, lines(d.achieveText).slice(0, 6), gx + 0.25, 2.4, gw - 0.5, 4.0, 13);
        break;
      }

      case "closing": {
        const s = pptx.addSlide();
        page++;
        rect(s, 0, 0, W, 7.5, C.NAVY);
        text(s, title("closing"), L, 2.3, CW, 1.0, { size: 40, bold: true, color: C.WHITE });
        rect(s, L, 3.4, 1.2, 0.05, C.TEAL);
        const contact = [d.contactName, d.contactEmail, d.website].map((x) => x.trim()).filter(Boolean);
        text(s, contact.join("\n") || d.company, L, 3.7, CW, 1.6, { size: 16, color: "C9D6EA" });
        text(s, "Built with FinancePlots · financeplots.com", L, 6.9, CW, 0.3, { size: 8, color: "8FA3C0" });
        break;
      }
    }
  }

  return pptx;
}

/** Builds the deck and downloads it. */
export async function generatePptx(d: PitchData, sym: string) {
  const pptx = await buildPptx(d, sym);
  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${d.company.replace(/\s+/g, "_")}_Pitch_Deck.pptx`;
  a.click();
  trackEvent("export", { format: "pptx" });
  URL.revokeObjectURL(url);
}
