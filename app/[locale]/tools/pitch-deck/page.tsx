"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import PitchChat from "./PitchChat";

// ── Types ────────────────────────────────────────────────────────────────────

type PitchData = {
  company: string;
  tagline: string;
  industry: string;
  currency: string;
  deckDate: string;
  logo: string | null; // base64 data URL
  problems: Array<{ label: string; desc: string }>;
  solNarrative: string;
  differentiators: string[];
  tamVal: number;
  samVal: number;
  somVal: number;
  mktNarrative: string;
  revStreams: string;
  pricing: string;
  kpis: Array<{ label: string; value: string }>;
  milestones: string;
  revVals: number[];
  profVals: number[];
  team: Array<{ name: string; role: string; bio: string }>;
  fundingAmt: number;
  fundingType: string;
  useOfFunds: Array<{ label: string; pct: number }>;
  achieveText: string;
};

const DEFAULT: PitchData = {
  company: "My Company",
  tagline: "Transforming X with Y",
  industry: "SaaS",
  currency: "USD ($)",
  deckDate: new Date().toISOString().slice(0, 10),
  logo: null,
  problems: [
    { label: "Inefficiency", desc: "Manual processes waste time and money." },
    { label: "High Cost", desc: "Existing solutions are expensive and hard to implement." },
    { label: "", desc: "" },
  ],
  solNarrative:
    "We provide an easy-to-use platform that automates X, reduces costs by Y, and delivers Z.",
  differentiators: ["10× faster", "50% cheaper", ""],
  tamVal: 10,
  samVal: 2,
  somVal: 50,
  mktNarrative: "",
  revStreams: "SaaS subscription (monthly / annual)\nProfessional services\nMarketplace transaction fees",
  pricing: "Starter: $49/mo\nGrowth: $199/mo\nEnterprise: custom",
  kpis: [
    { label: "MRR", value: "$25K" },
    { label: "Customers", value: "120" },
    { label: "MoM Growth", value: "18%" },
    { label: "", value: "" },
  ],
  milestones:
    "Launched MVP — Jan 2024\nFirst 100 paying customers — Apr 2024\nSeed round closed — Jul 2024",
  revVals: [200000, 400000, 700000, 1100000, 1600000],
  profVals: [10000, 40000, 105000, 220000, 400000],
  team: [
    { name: "John Smith", role: "CEO & Co-Founder", bio: "10 years in B2B SaaS. Previously VP at Acme Corp." },
    { name: "Jane Doe",   role: "CTO & Co-Founder", bio: "Ex-Google engineer. 8 years in ML infrastructure." },
    { name: "", role: "", bio: "" },
    { name: "", role: "", bio: "" },
  ],
  fundingAmt: 1500000,
  fundingType: "Seed",
  useOfFunds: [
    { label: "Product & Engineering", pct: 40 },
    { label: "Sales & Marketing",     pct: 35 },
    { label: "Operations",            pct: 25 },
    { label: "",                       pct: 0  },
  ],
  achieveText: "18-month runway\nReach $1M ARR\nExpand to 3 new markets",
};

// ── PPTX GENERATOR ───────────────────────────────────────────────────────────

const C = {
  PRIMARY: "003F88",
  ACCENT:  "0066CC",
  LIGHT:   "F7F9FC",
  BORDER:  "E8EDF4",
  DARK:    "222222",
  GREY:    "888888",
  WHITE:   "FFFFFF",
  GREEN:   "1A936F",
  RED:     "C0392B",
};

function fmtMoney(sym: string, val: number) {
  return `${sym}${val.toLocaleString("en-US")}`;
}

async function generatePptx(d: PitchData) {
  // Dynamic import — pptxgenjs is client-only
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33" × 7.5"

  const sym = d.currency.split("(")[1]?.replace(")", "") ?? "$";

  // ── Helpers ──────────────────────────────────────────────────────────────

  function rect(slide: ReturnType<typeof pptx.addSlide>, l: number, t: number, w: number, h: number, fill: string) {
    slide.addShape((pptx as any).ShapeType.rect, {
      x: l, y: t, w, h,
      fill: { color: fill },
      line: { color: fill, pt: 0 },
    });
  }

  function tb(
    slide: ReturnType<typeof pptx.addSlide>,
    text: string,
    l: number, t: number, w: number, h: number,
    opts: {
      size?: number; bold?: boolean; italic?: boolean;
      color?: string; align?: "left" | "center" | "right";
    } = {}
  ) {
    slide.addText(text, {
      x: l, y: t, w, h,
      fontSize: opts.size ?? 12,
      bold: opts.bold ?? false,
      italic: opts.italic ?? false,
      color: opts.color ?? C.DARK,
      align: opts.align ?? "left",
      valign: "top",
      wrap: true,
    });
  }

  function bar(slide: ReturnType<typeof pptx.addSlide>) {
    rect(slide, 0, 0, 0.09, 7.5, C.PRIMARY);
  }

  function header(slide: ReturnType<typeof pptx.addSlide>, title: string, sub?: string) {
    rect(slide, 0.09, 0, 13.24, 1.35, C.LIGHT);
    tb(slide, title, 0.3, 0.13, 12.5, 0.85, { size: 26, bold: true, color: C.PRIMARY });
    if (sub) tb(slide, sub, 0.3, 0.95, 12.5, 0.35, { size: 10, italic: true, color: C.GREY });
  }

  function footer(slide: ReturnType<typeof pptx.addSlide>) {
    rect(slide, 0.09, 7.2, 13.24, 0.3, C.LIGHT);
    tb(slide, `${d.company}  ·  Confidential`, 0.3, 7.22, 9.0, 0.25, { size: 8, color: C.GREY });
    tb(slide, "financeplots.com", 9.5, 7.22, 3.6, 0.25, { size: 8, color: C.GREY, align: "right" });
  }

  // ── SLIDE 1: COVER ─────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    rect(s, 0, 0, 13.33, 7.5, C.WHITE);
    rect(s, 0, 0, 0.22, 7.5, C.PRIMARY);
    rect(s, 0.22, 6.3, 13.11, 1.2, C.LIGHT);

    if (d.logo) {
      try {
        s.addImage({ data: d.logo, x: 10.8, y: 0.3, w: 1.5, h: 0.9 });
      } catch (_) {}
    }

    const dateStr = new Date(d.deckDate).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    tb(s, d.company, 0.45, 2.15, 11.5, 1.3, { size: 44, bold: true, color: C.PRIMARY });
    rect(s, 0.45, 3.55, 2.8, 0.06, C.ACCENT);
    tb(s, d.tagline, 0.45, 3.7, 11.5, 0.75, { size: 20, color: C.ACCENT });
    tb(s, `${d.industry}  ·  ${dateStr}`, 0.45, 6.4, 10.5, 0.4, { size: 11, color: C.GREY });
    tb(s, "Strictly Confidential — Not for Distribution", 0.45, 6.85, 10.5, 0.35, { size: 9, italic: true, color: C.GREY });
  }

  // ── SLIDE 2: PROBLEM ───────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    bar(s); header(s, "The Problem", "Pain points your company solves"); footer(s);
    const probs = d.problems.filter(p => p.label);
    if (probs.length) {
      const bw = (12.5 - 0.15 * (probs.length - 1)) / probs.length;
      probs.forEach((p, i) => {
        const lx = 0.3 + i * (bw + 0.15);
        rect(s, lx, 1.5, bw, 5.55, C.LIGHT);
        rect(s, lx, 1.5, bw, 0.5, C.PRIMARY);
        tb(s, String(i + 1), lx + 0.12, 1.55, bw - 0.24, 0.4, { size: 16, bold: true, color: C.WHITE });
        tb(s, p.label, lx + 0.15, 2.1, bw - 0.3, 0.55, { size: 14, bold: true, color: C.PRIMARY });
        rect(s, lx + 0.15, 2.7, bw - 0.3, 0.04, C.ACCENT);
        tb(s, p.desc, lx + 0.15, 2.82, bw - 0.3, 4.1, { size: 12, color: C.DARK });
      });
    }
  }

  // ── SLIDE 3: SOLUTION ──────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    bar(s); header(s, "Our Solution", "How we uniquely solve the problem"); footer(s);
    rect(s, 0.3, 1.5, 12.5, 2.05, C.LIGHT);
    rect(s, 0.3, 1.5, 0.06, 2.05, C.ACCENT);
    tb(s, d.solNarrative, 0.55, 1.65, 12.1, 1.75, { size: 14, color: C.DARK });
    const diffs = d.differentiators.filter(Boolean);
    if (diffs.length) {
      tb(s, "Key Differentiators", 0.3, 3.68, 12.5, 0.4, { size: 11, bold: true, color: C.GREY });
      const dw = (12.5 - 0.15 * (diffs.length - 1)) / diffs.length;
      diffs.forEach((diff, i) => {
        const dx = 0.3 + i * (dw + 0.15);
        rect(s, dx, 4.18, dw, 2.6, C.LIGHT);
        rect(s, dx, 4.18, dw, 0.07, C.ACCENT);
        tb(s, diff, dx + 0.15, 4.38, dw - 0.3, 2.27, { size: 13, bold: true, color: C.PRIMARY });
      });
    }
  }

  // ── SLIDE 4: MARKET ────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    bar(s); header(s, "Market Opportunity", "TAM · SAM · SOM"); footer(s);
    const mw = (12.5 - 0.3) / 3;
    const markets = [
      { lbl: "TAM", val: `${sym}${d.tamVal.toFixed(1)}B`, desc: "Total Addressable Market",      clr: C.PRIMARY },
      { lbl: "SAM", val: `${sym}${d.samVal.toFixed(1)}B`, desc: "Serviceable Addressable Market", clr: C.ACCENT  },
      { lbl: "SOM", val: `${sym}${d.somVal.toFixed(0)}M`, desc: "Serviceable Obtainable Market",  clr: C.GREEN   },
    ];
    markets.forEach(({ lbl, val, desc, clr }, i) => {
      const mx = 0.3 + i * (mw + 0.15);
      rect(s, mx, 1.5, mw, 4.6, C.LIGHT);
      rect(s, mx, 1.5, mw, 0.07, clr);
      tb(s, lbl,  mx + 0.2, 1.72, mw - 0.4, 0.5,  { size: 13, bold: true, color: clr });
      tb(s, val,  mx + 0.2, 2.28, mw - 0.4, 1.05, { size: 30, bold: true, color: C.PRIMARY });
      tb(s, desc, mx + 0.2, 3.4,  mw - 0.4, 0.55, { size: 10, color: C.GREY });
    });
    if (d.mktNarrative) tb(s, d.mktNarrative, 0.3, 6.25, 12.5, 0.8, { size: 11, color: C.GREY });
  }

  // ── SLIDE 5: BUSINESS MODEL ────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    bar(s); header(s, "Business Model", "How we make money"); footer(s);
    [["Revenue Streams", d.revStreams], ["Pricing", d.pricing]].forEach(([title, body], xi) => {
      const lx = 0.3 + xi * 6.55;
      rect(s, lx, 1.5, 6.2, 5.55, C.LIGHT);
      tb(s, title, lx + 0.2, 1.65, 5.8, 0.5, { size: 13, bold: true, color: C.PRIMARY });
      rect(s, lx + 0.2, 2.2, 5.8, 0.04, C.ACCENT);
      body.split("\n").filter(Boolean).slice(0, 9).forEach((line, j) => {
        tb(s, `•  ${line}`, lx + 0.2, 2.35 + j * 0.5, 5.8, 0.45, { size: 11, color: C.DARK });
      });
    });
  }

  // ── SLIDE 6: TRACTION ──────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    bar(s); header(s, "Traction & Milestones", "Proof this is working"); footer(s);
    const kpis = d.kpis.filter(k => k.label);
    if (kpis.length) {
      const kw = (12.5 - 0.15 * (kpis.length - 1)) / kpis.length;
      kpis.forEach(({ label, value }, i) => {
        const kx = 0.3 + i * (kw + 0.15);
        rect(s, kx, 1.5, kw, 2.1, C.LIGHT);
        rect(s, kx, 1.5, kw, 0.07, C.ACCENT);
        tb(s, value, kx + 0.15, 1.7,  kw - 0.3, 0.95, { size: 28, bold: true, color: C.PRIMARY });
        tb(s, label, kx + 0.15, 2.7,  kw - 0.3, 0.45, { size: 10, color: C.GREY });
      });
    }
    tb(s, "Key Milestones", 0.3, 3.75, 12.5, 0.45, { size: 12, bold: true, color: C.PRIMARY });
    rect(s, 0.3, 4.24, 12.5, 0.04, C.ACCENT);
    d.milestones.split("\n").filter(Boolean).slice(0, 6).forEach((m, j) => {
      tb(s, `✓  ${m}`, 0.3, 4.38 + j * 0.45, 12.5, 0.42, { size: 11, color: C.DARK });
    });
  }

  // ── SLIDE 7: FINANCIALS ────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    bar(s); header(s, "Financial Projections", `5-year forecast · ${sym}`); footer(s);

    const headers = ["", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];
    const revRow  = [{ label: `Revenue (${sym})`, vals: d.revVals,  bg: C.LIGHT }];
    const profRow = [{ label: `Net Profit (${sym})`, vals: d.profVals, bg: C.WHITE }];

    const rows = [
      headers.map(h => ({
        text: h,
        options: { bold: true, color: C.WHITE, fill: { color: C.PRIMARY }, align: "center" as const, fontSize: 11 },
      })),
      ...[ ...revRow, ...profRow ].map(({ label, vals, bg }) => [
        { text: label, options: { bold: true, color: C.PRIMARY, fill: { color: bg }, align: "left" as const, fontSize: 11 } },
        ...vals.map(val => ({
          text: fmtMoney(sym, val),
          options: {
            color: val >= 0 ? C.GREEN : C.RED,
            fill: { color: bg },
            align: "center" as const,
            fontSize: 11,
          },
        })),
      ]),
    ];

    s.addTable(rows, {
      x: 0.3, y: 1.6, w: 12.5, h: 2.3,
      border: { pt: 0, color: C.BORDER },
      rowH: 0.5,
    });

    const growths: string[] = [];
    for (let i = 1; i < 5; i++) {
      if (d.revVals[i - 1] > 0) {
        const g = ((d.revVals[i] - d.revVals[i - 1]) / d.revVals[i - 1] * 100).toFixed(0);
        growths.push(`Y${i}→Y${i + 1}: +${g}%`);
      }
    }
    if (growths.length) {
      tb(s, `YoY Revenue Growth:  ${growths.join("  |  ")}`, 0.3, 4.1, 12.5, 0.38, { size: 10, color: C.GREY });
    }
    if (d.revVals[0] > 0) {
      const cagr = ((d.revVals[4] / d.revVals[0]) ** 0.25 - 1) * 100;
      tb(s, `5-Year Revenue CAGR:  ${cagr.toFixed(1)}%`, 0.3, 4.6, 6.5, 0.48, { size: 14, bold: true, color: C.ACCENT });
    }
  }

  // ── SLIDE 8: TEAM ──────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    bar(s); header(s, "The Team", "The people behind the mission"); footer(s);
    const team = d.team.filter(m => m.name).slice(0, 4);
    if (team.length) {
      const tw = (12.5 - 0.15 * (team.length - 1)) / team.length;
      team.forEach(({ name, role, bio }, i) => {
        const tx = 0.3 + i * (tw + 0.15);
        rect(s, tx, 1.5, tw, 5.55, C.LIGHT);
        rect(s, tx, 1.5, tw, 0.07, C.PRIMARY);
        rect(s, tx + tw / 2 - 0.5, 1.7, 1.0, 1.0, C.BORDER);
        const initials = name.split(" ").slice(0, 2).map((w: string) => w[0].toUpperCase()).join("");
        tb(s, initials, tx + tw / 2 - 0.45, 1.88, 0.9, 0.65, { size: 18, bold: true, color: C.PRIMARY, align: "center" });
        tb(s, name, tx + 0.15, 2.85, tw - 0.3, 0.5, { size: 13, bold: true, color: C.PRIMARY });
        tb(s, role, tx + 0.15, 3.38, tw - 0.3, 0.4, { size: 10, color: C.ACCENT });
        rect(s, tx + 0.15, 3.85, tw - 0.3, 0.04, C.BORDER);
        tb(s, bio, tx + 0.15, 3.97, tw - 0.3, 2.93, { size: 10, color: C.DARK });
      });
    }
  }

  // ── SLIDE 9: THE ASK ───────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    bar(s); header(s, "The Ask", `${d.fundingType} Round`); footer(s);

    tb(s, fmtMoney(sym, d.fundingAmt), 0.3, 1.55, 6.3, 1.2, { size: 42, bold: true, color: C.PRIMARY });
    tb(s, `${d.fundingType} Round`, 0.3, 2.78, 6.3, 0.5, { size: 16, color: C.ACCENT });
    rect(s, 0.3, 3.4, 6.2, 0.04, C.BORDER);
    tb(s, "Use of Funds", 0.3, 3.55, 6.2, 0.4, { size: 11, bold: true, color: C.PRIMARY });

    const uof = d.useOfFunds.filter(u => u.label);
    if (uof.length) {
      const uw = (6.2 - 0.15 * (uof.length - 1)) / uof.length;
      uof.forEach(({ label, pct }, i) => {
        const ux = 0.3 + i * (uw + 0.15);
        rect(s, ux, 4.05, uw, 2.1, C.LIGHT);
        rect(s, ux, 4.05, Math.max(0.05, uw * pct / 100), 0.12, C.ACCENT);
        tb(s, `${pct}%`, ux + 0.1, 4.28, uw - 0.2, 0.65, { size: 20, bold: true, color: C.PRIMARY });
        tb(s, label, ux + 0.1, 4.98, uw - 0.2, 0.65, { size: 9, color: C.GREY });
      });
    }

    rect(s, 6.75, 1.5, 6.25, 5.6, C.LIGHT);
    rect(s, 6.75, 1.5, 6.25, 0.07, C.GREEN);
    tb(s, "With this investment we will:", 6.95, 1.65, 5.85, 0.45, { size: 12, bold: true, color: C.PRIMARY });
    d.achieveText.split("\n").filter(Boolean).slice(0, 7).forEach((ach, j) => {
      tb(s, `→  ${ach}`, 6.95, 2.25 + j * 0.55, 5.85, 0.5, { size: 12, color: C.DARK });
    });
  }

  // ── Download ───────────────────────────────────────────────────────────────
  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${d.company.replace(/\s+/g, "_")}_Pitch_Deck.pptx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── FORM HELPERS ─────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">{children}</label>;
}

function Input({ value, onChange, placeholder = "" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
    />
  );
}

function TextArea({ value, onChange, rows = 4, placeholder = "" }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition resize-none"
    />
  );
}

function NumInput({ value, onChange, min = 0, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; step?: number }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      step={step}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-6 space-y-5">
      {children}
    </div>
  );
}

function Grid({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
  return (
    <div className={`grid grid-cols-1 ${cols === 2 ? "md:grid-cols-2" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4"} gap-4`}>
      {children}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

const TABS = [
  "1 · Cover", "2 · Problem", "3 · Solution", "4 · Market",
  "5 · Business Model", "6 · Traction", "7 · Financials", "8 · Team", "9 · The Ask",
];

export default function PitchDeckPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState<PitchData>(DEFAULT);
  const [generating, setGenerating] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  function upd<K extends keyof PitchData>(key: K, value: PitchData[K]) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  function updArr<T>(key: keyof PitchData, index: number, field: keyof T, value: unknown) {
    setData(prev => {
      const arr = [...(prev[key] as T[])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [key]: arr };
    });
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generatePptx(data);
    } finally {
      setGenerating(false);
    }
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => upd("logo", (ev.target?.result as string) ?? null);
    reader.readAsDataURL(file);
  }

  const sym = data.currency.split("(")[1]?.replace(")", "") ?? "$";

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <Link href="/tools/business" className="text-blue-400 text-sm hover:underline mb-4 inline-block">← Tools for companies</Link>
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Fundraising</p>
          <h1 className="text-4xl font-extrabold mb-3">🎯 Pitch Deck Builder</h1>
          <p className="text-gray-400 max-w-2xl">
            Build a professional 9-slide investor pitch deck. Fill in each section, then download
            your fully editable <strong className="text-white">.pptx</strong> — open in PowerPoint or Google Slides.
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex overflow-x-auto gap-1.5 mb-8 pb-1" style={{ scrollbarWidth: "none" }}>
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === i
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "bg-[#0d1426] border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ──────────────────────────────────────────────────── */}

        {/* 1. Cover */}
        {activeTab === 0 && (
          <SectionCard>
            <h2 className="text-lg font-bold text-white">Cover Slide</h2>
            <Grid>
              <div>
                <Label>Company Name *</Label>
                <Input value={data.company} onChange={v => upd("company", v)} placeholder="My Company" />
              </div>
              <div>
                <Label>Tagline / One-liner *</Label>
                <Input value={data.tagline} onChange={v => upd("tagline", v)} placeholder="Transforming X with Y" />
              </div>
              <div>
                <Label>Industry</Label>
                <Input value={data.industry} onChange={v => upd("industry", v)} placeholder="SaaS" />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={data.currency} onChange={v => upd("currency", v)}
                  options={["USD ($)", "EUR (€)", "GBP (£)"]} />
              </div>
              <div>
                <Label>Deck Date</Label>
                <input type="date" value={data.deckDate}
                  onChange={e => upd("deckDate", e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <Label>Company Logo (optional)</Label>
                <button onClick={() => logoRef.current?.click()}
                  className="w-full bg-[#111827] border border-dashed border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-400 hover:border-blue-500 hover:text-white transition text-left">
                  {data.logo ? "✓ Logo uploaded" : "Click to upload PNG / JPG"}
                </button>
                <input ref={logoRef} type="file" accept="image/png,image/jpeg" onChange={handleLogo} className="hidden" />
              </div>
            </Grid>
          </SectionCard>
        )}

        {/* 2. Problem */}
        {activeTab === 1 && (
          <SectionCard>
            <h2 className="text-lg font-bold text-white">The Problem</h2>
            <p className="text-gray-500 text-sm">Up to 3 pain points your company solves.</p>
            <Grid cols={3}>
              {data.problems.map((p, i) => (
                <div key={i} className="space-y-3">
                  <div>
                    <Label>Problem {i + 1} Label{i < 2 ? " *" : " (optional)"}</Label>
                    <Input value={p.label} onChange={v => updArr<typeof p>("problems", i, "label", v)} placeholder={i === 0 ? "Inefficiency" : i === 1 ? "High Cost" : ""} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <TextArea value={p.desc} onChange={v => updArr<typeof p>("problems", i, "desc", v)} rows={4} />
                  </div>
                </div>
              ))}
            </Grid>
          </SectionCard>
        )}

        {/* 3. Solution */}
        {activeTab === 2 && (
          <SectionCard>
            <h2 className="text-lg font-bold text-white">Our Solution</h2>
            <div>
              <Label>Solution Narrative *</Label>
              <TextArea value={data.solNarrative} onChange={v => upd("solNarrative", v)} rows={5} />
            </div>
            <div>
              <Label>Key Differentiators (up to 3 — shown as highlight cards)</Label>
              <Grid cols={3}>
                {data.differentiators.map((d_, i) => (
                  <Input key={i} value={d_}
                    onChange={v => {
                      const arr = [...data.differentiators];
                      arr[i] = v;
                      upd("differentiators", arr);
                    }}
                    placeholder={i === 0 ? "10× faster" : i === 1 ? "50% cheaper" : "Optional"} />
                ))}
              </Grid>
            </div>
          </SectionCard>
        )}

        {/* 4. Market */}
        {activeTab === 3 && (
          <SectionCard>
            <h2 className="text-lg font-bold text-white">Market Opportunity</h2>
            <Grid cols={3}>
              <div>
                <Label>TAM — Total Addressable Market ({sym}B)</Label>
                <NumInput value={data.tamVal} onChange={v => upd("tamVal", v)} min={0} step={0.5} />
              </div>
              <div>
                <Label>SAM — Serviceable Addressable ({sym}B)</Label>
                <NumInput value={data.samVal} onChange={v => upd("samVal", v)} min={0} step={0.1} />
              </div>
              <div>
                <Label>SOM — Serviceable Obtainable ({sym}M)</Label>
                <NumInput value={data.somVal} onChange={v => upd("somVal", v)} min={0} step={5} />
              </div>
            </Grid>
            <div>
              <Label>Market Narrative (optional)</Label>
              <TextArea value={data.mktNarrative} onChange={v => upd("mktNarrative", v)} rows={3} />
            </div>
          </SectionCard>
        )}

        {/* 5. Business Model */}
        {activeTab === 4 && (
          <SectionCard>
            <h2 className="text-lg font-bold text-white">Business Model</h2>
            <Grid>
              <div>
                <Label>Revenue Streams (one per line)</Label>
                <TextArea value={data.revStreams} onChange={v => upd("revStreams", v)} rows={7} />
              </div>
              <div>
                <Label>Pricing Tiers (one per line)</Label>
                <TextArea value={data.pricing} onChange={v => upd("pricing", v)} rows={7} />
              </div>
            </Grid>
          </SectionCard>
        )}

        {/* 6. Traction */}
        {activeTab === 5 && (
          <SectionCard>
            <h2 className="text-lg font-bold text-white">Traction &amp; Milestones</h2>
            <div>
              <Label>Key Metrics (up to 4)</Label>
              <Grid cols={4}>
                {data.kpis.map((k, i) => (
                  <div key={i} className="space-y-2">
                    <Input value={k.label} onChange={v => updArr<typeof k>("kpis", i, "label", v)} placeholder={["MRR", "Customers", "MoM Growth", "NPS"][i] ?? "Label"} />
                    <Input value={k.value} onChange={v => updArr<typeof k>("kpis", i, "value", v)} placeholder={["$25K", "120", "18%", ""][i] ?? "Value"} />
                  </div>
                ))}
              </Grid>
            </div>
            <div>
              <Label>Key Milestones (one per line)</Label>
              <TextArea value={data.milestones} onChange={v => upd("milestones", v)} rows={5} />
            </div>
          </SectionCard>
        )}

        {/* 7. Financials */}
        {activeTab === 6 && (
          <SectionCard>
            <h2 className="text-lg font-bold text-white">Financial Projections (5 Years)</h2>
            <p className="text-gray-500 text-sm">Annual figures in {sym}.</p>
            <div className="grid grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-3">
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-wide text-center">Year {i + 1}</p>
                  <div>
                    <Label>Revenue</Label>
                    <NumInput
                      value={data.revVals[i]}
                      step={10000}
                      onChange={v => {
                        const arr = [...data.revVals]; arr[i] = v; upd("revVals", arr);
                      }} />
                  </div>
                  <div>
                    <Label>Net Profit</Label>
                    <NumInput
                      value={data.profVals[i]}
                      step={5000}
                      onChange={v => {
                        const arr = [...data.profVals]; arr[i] = v; upd("profVals", arr);
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* 8. Team */}
        {activeTab === 7 && (
          <SectionCard>
            <h2 className="text-lg font-bold text-white">The Team</h2>
            <p className="text-gray-500 text-sm">Up to 4 members.</p>
            <Grid>
              {data.team.map((m, i) => (
                <div key={i} className="space-y-3 bg-[#0a0f1e] rounded-xl p-4 border border-gray-800">
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-wide">Member {i + 1}</p>
                  <div>
                    <Label>Name</Label>
                    <Input value={m.name} onChange={v => updArr<typeof m>("team", i, "name", v)} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input value={m.role} onChange={v => updArr<typeof m>("team", i, "role", v)} placeholder="CEO & Co-Founder" />
                  </div>
                  <div>
                    <Label>Bio (1-2 lines)</Label>
                    <TextArea value={m.bio} onChange={v => updArr<typeof m>("team", i, "bio", v)} rows={3} />
                  </div>
                </div>
              ))}
            </Grid>
          </SectionCard>
        )}

        {/* 9. The Ask */}
        {activeTab === 8 && (
          <SectionCard>
            <h2 className="text-lg font-bold text-white">The Ask</h2>
            <Grid>
              <div className="space-y-4">
                <div>
                  <Label>Funding Amount ({sym})</Label>
                  <NumInput value={data.fundingAmt} onChange={v => upd("fundingAmt", v)} min={0} step={50000} />
                </div>
                <div>
                  <Label>Round Type</Label>
                  <Select value={data.fundingType} onChange={v => upd("fundingType", v)}
                    options={["Pre-seed", "Seed", "Series A", "Series B", "Bridge / Convertible"]} />
                </div>
                <div>
                  <Label>What You&apos;ll Achieve (one per line)</Label>
                  <TextArea value={data.achieveText} onChange={v => upd("achieveText", v)} rows={5} />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Use of Funds — Label + % each (should total 100)</Label>
                {data.useOfFunds.map((u, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input value={u.label}
                        onChange={v => updArr<typeof u>("useOfFunds", i, "label", v)}
                        placeholder={["Product & Engineering", "Sales & Marketing", "Operations", ""][i] ?? "Label"} />
                    </div>
                    <div className="w-20">
                      <input type="number" value={u.pct} min={0} max={100}
                        onChange={e => updArr<typeof u>("useOfFunds", i, "pct", Number(e.target.value))}
                        className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                ))}
              </div>
            </Grid>
          </SectionCard>
        )}

        {/* Navigation + Generate */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab(t => Math.max(0, t - 1))}
              disabled={activeTab === 0}
              className="px-5 py-2.5 bg-[#0d1426] border border-gray-700 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveTab(t => Math.min(TABS.length - 1, t + 1))}
              disabled={activeTab === TABS.length - 1}
              className="px-5 py-2.5 bg-[#0d1426] border border-gray-700 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !data.company || !data.tagline}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-white transition shadow-lg shadow-blue-900/40"
          >
            {generating ? "Building deck…" : "🎯 Download Pitch Deck (.pptx)"}
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Exported as editable .pptx · Open in PowerPoint or Google Slides · Built by{" "}
          <span className="text-gray-500">FinancePlots</span>
        </p>
      </div>

      <PitchChat
        data={data}
        set={patch => setData(prev => ({ ...prev, ...patch }))}
        setSlide={setActiveTab}
        sym={sym}
        download={handleGenerate}
      />
    </main>
  );
}
