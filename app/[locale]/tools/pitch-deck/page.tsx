"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import PitchChat from "./PitchChat";
import CurrencyPicker, { useCurrency } from "@/components/CurrencyPicker";
import {
  COMPETITORS, CRITERIA, DEFAULT_PITCH, SLIDES, SLIDE_NAMES,
  compact, dilutionPct, financials, generatedHeadlines, lines, reviewDeck, summaryPoints, unitEconomics,
  type PitchData, type SlideKey,
} from "@/lib/pitch-deck";

// ── Form helpers ─────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">{children}</label>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500 leading-relaxed">{children}</p>;
}

function Input({ value, onChange, placeholder = "" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
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
      className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition resize-none"
    />
  );
}

function NumInput({ value, onChange, min, step = 1, prefix }: { value: number; onChange: (v: number) => void; min?: number; step?: number; prefix?: string }) {
  return (
    <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
      {prefix && <span className="text-gray-500 text-sm mr-1.5 shrink-0">{prefix}</span>}
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="bg-transparent w-full text-sm text-white outline-none min-w-0"
      />
    </div>
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

function Grid({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
  return (
    <div className={`grid grid-cols-1 ${cols === 2 ? "md:grid-cols-2" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4"} gap-4`}>
      {children}
    </div>
  );
}

function Stat({ label, value, tone = "plain" }: { label: string; value: string; tone?: "plain" | "good" | "warn" }) {
  const colour = tone === "good" ? "text-emerald-300" : tone === "warn" ? "text-amber-300" : "text-white";
  return (
    <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-3">
      <div className="text-[11px] text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-lg font-bold ${colour}`}>{value}</div>
    </div>
  );
}

/** What each slide must prove — the question an investor asks of it. */
const PURPOSE: Record<SlideKey, string> = {
  cover: "Who you are and what you do, in one line.",
  summary: "The whole investment case on one page — many investors read only this slide. Leave the points blank to build them from the deck.",
  problem: "A painful, specific, frequent problem. Quantify it: hours lost, cost, risk.",
  solution: "How you solve it, and why customers will switch.",
  whyNow: "What changed — technology, regulation, behaviour — that makes this possible now and not five years ago.",
  market: "Size it bottom-up (number of customers × price) and give a source. TAM ⊃ SAM ⊃ SOM.",
  competition: "Every customer has an alternative today, even if it's a spreadsheet. Show where you win.",
  model: "Who pays, how much, and how often.",
  traction: "Evidence the market wants it: revenue, customers, growth, retention.",
  unitEconomics: "Whether growth creates value: each customer should return 3× or more its acquisition cost, paid back within 12–18 months.",
  financials: "Revenue and EBITDA for five years, with the assumptions that drive them. Investors judge the assumptions, not the hockey stick.",
  team: "Why this team wins: relevant experience, past results, complementary skills.",
  ask: "How much, on what terms, what it buys, and the milestones it reaches before the next round.",
  closing: "How to reach you.",
};

// ── Main page ────────────────────────────────────────────────────────────────

export default function PitchDeckPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState<PitchData>(DEFAULT_PITCH);
  const [generating, setGenerating] = useState(false);
  const [sym] = useCurrency();
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
  const setHeadline = (k: SlideKey, v: string) => setData(prev => ({ ...prev, headlines: { ...prev.headlines, [k]: v } }));

  const auto = useMemo(() => generatedHeadlines(data, sym), [data, sym]);
  const findings = useMemo(() => reviewDeck(data), [data]);
  const ue = unitEconomics(data);
  const fin = financials(data);
  const slide = SLIDES[activeTab];
  const fixes = findings.filter(f => f.level === "fix").length;
  const dil = dilutionPct(data);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const { generatePptx } = await import("./pptx");
      await generatePptx(data, sym);
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

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/tools/business" className="text-blue-400 text-sm hover:underline mb-4 inline-block">← Tools for companies</Link>
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Fundraising</p>
          <h1 className="text-4xl font-extrabold mb-3">🎯 Pitch Deck Builder</h1>
          <p className="text-gray-400 max-w-3xl">
            A 14-slide investor deck built the way top consulting and private-equity firms build theirs: an executive summary
            up front, one message per slide stated as a full-sentence title, sources under the figures, and the numbers investors
            check first — unit economics, EBITDA and runway. Download it as an editable <strong className="text-white">.pptx</strong> for
            PowerPoint, Keynote or Google Slides.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Builder ─────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-6">
              {SLIDES.map((k, i) => {
                const flagged = findings.some(f => f.slide === k && f.level === "fix");
                return (
                  <button
                    key={k}
                    onClick={() => setActiveTab(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      activeTab === i
                        ? "bg-blue-600 text-white"
                        : "bg-[#0d1426] border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
                    }`}
                  >
                    {i + 1} · {SLIDE_NAMES[k]}{flagged ? " •" : ""}
                  </button>
                );
              })}
            </div>

            <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white">{activeTab + 1} · {SLIDE_NAMES[slide]}</h2>
                <Hint>{PURPOSE[slide]}</Hint>
              </div>

              {slide !== "cover" && (
                <div className="bg-[#0a0f1e] border border-gray-800 rounded-xl p-4 space-y-2">
                  <Label>Slide title — the one message of this slide</Label>
                  <Input value={data.headlines[slide] ?? ""} onChange={v => setHeadline(slide, v)} placeholder={auto[slide]} />
                  <Hint>
                    Write it as a sentence that states the conclusion, not a topic (“Revenue triples to $3M by year 4”, not “Financials”).
                    Leave it blank to use the suggestion, which updates as you fill in the slide.
                  </Hint>
                </div>
              )}

              {slide === "cover" && (
                <Grid>
                  <div>
                    <Label>Company name *</Label>
                    <Input value={data.company} onChange={v => upd("company", v)} placeholder="My Company" />
                  </div>
                  <div>
                    <Label>One-liner * (under 12 words)</Label>
                    <Input value={data.tagline} onChange={v => upd("tagline", v)} placeholder="Automated bookkeeping for small restaurants" />
                  </div>
                  <div>
                    <Label>Industry</Label>
                    <Input value={data.industry} onChange={v => upd("industry", v)} placeholder="SaaS" />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <CurrencyPicker label="Currency" hideLabel />
                  </div>
                  <div>
                    <Label>Deck date</Label>
                    <input type="date" value={data.deckDate}
                      onChange={e => upd("deckDate", e.target.value)}
                      className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <Label>Company logo (optional)</Label>
                    <button onClick={() => logoRef.current?.click()}
                      className="w-full bg-[#111827] border border-dashed border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-400 hover:border-blue-500 hover:text-white transition text-left">
                      {data.logo ? "✓ Logo uploaded" : "Click to upload PNG / JPG"}
                    </button>
                    <input ref={logoRef} type="file" accept="image/png,image/jpeg" onChange={handleLogo} className="hidden" />
                  </div>
                </Grid>
              )}

              {slide === "summary" && (
                <div className="space-y-3">
                  <Label>Investment highlights (one per line, up to 6 — optional)</Label>
                  <TextArea value={data.highlights} onChange={v => upd("highlights", v)} rows={6}
                    placeholder={summaryPoints({ ...data, highlights: "" }, sym).join("\n")} />
                  <Hint>Blank uses the points shown in grey, drawn from the rest of the deck. A key-figures panel sits beside them.</Hint>
                </div>
              )}

              {slide === "problem" && (
                <Grid cols={3}>
                  {data.problems.map((p, i) => (
                    <div key={i} className="space-y-3">
                      <div>
                        <Label>Problem {i + 1}{i < 2 ? " *" : " (optional)"}</Label>
                        <Input value={p.label} onChange={v => updArr<typeof p>("problems", i, "label", v)} placeholder={["Inefficiency", "High cost", ""][i]} />
                      </div>
                      <div>
                        <Label>Why it hurts (quantify it)</Label>
                        <TextArea value={p.desc} onChange={v => updArr<typeof p>("problems", i, "desc", v)} rows={4} placeholder="Finance teams lose 2 days a month to manual reconciliation." />
                      </div>
                    </div>
                  ))}
                </Grid>
              )}

              {slide === "solution" && (
                <>
                  <div>
                    <Label>How you solve it *</Label>
                    <TextArea value={data.solNarrative} onChange={v => upd("solNarrative", v)} rows={4} />
                  </div>
                  <div>
                    <Label>Key differentiators (up to 3, short and measurable)</Label>
                    <Grid cols={3}>
                      {data.differentiators.map((d_, i) => (
                        <Input key={i} value={d_}
                          onChange={v => upd("differentiators", data.differentiators.map((x, j) => (j === i ? v : x)))}
                          placeholder={["10× faster", "50% cheaper", "Optional"][i]} />
                      ))}
                    </Grid>
                  </div>
                </>
              )}

              {slide === "whyNow" && (
                <div className="space-y-2">
                  <Label>What changed (one trend per line, up to 3)</Label>
                  <TextArea value={data.whyNow} onChange={v => upd("whyNow", v)} rows={4}
                    placeholder={"New regulation from 2026\nCosts of AI fell 90% in two years\nRemote work made X standard"} />
                </div>
              )}

              {slide === "market" && (
                <>
                  <Grid cols={3}>
                    <div>
                      <Label>TAM ({sym} billions)</Label>
                      <NumInput value={data.tamVal} onChange={v => upd("tamVal", v)} min={0} step={0.5} prefix={sym} />
                    </div>
                    <div>
                      <Label>SAM ({sym} billions)</Label>
                      <NumInput value={data.samVal} onChange={v => upd("samVal", v)} min={0} step={0.1} prefix={sym} />
                    </div>
                    <div>
                      <Label>SOM ({sym} millions)</Label>
                      <NumInput value={data.somVal} onChange={v => upd("somVal", v)} min={0} step={5} prefix={sym} />
                    </div>
                  </Grid>
                  <div>
                    <Label>How you sized it</Label>
                    <TextArea value={data.mktNarrative} onChange={v => upd("mktNarrative", v)} rows={3}
                      placeholder="Bottom-up: 40,000 target companies × $2,500 average contract = $100M SAM." />
                  </div>
                  <div>
                    <Label>Source</Label>
                    <Input value={data.mktSource} onChange={v => upd("mktSource", v)} placeholder="Gartner 2026; Eurostat; company analysis" />
                  </div>
                </>
              )}

              {slide === "competition" && (
                <div className="space-y-3">
                  <Hint>Name what customers compare you on, then tick who offers each. Your company is the first row.</Hint>
                  <div className="overflow-x-auto">
                    <table className="text-sm">
                      <thead>
                        <tr>
                          <th className="text-left pr-3 pb-2 text-xs text-gray-400 font-semibold min-w-[10rem]">Criteria →</th>
                          {data.criteria.map((c, i) => (
                            <th key={i} className="px-1 pb-2">
                              <input value={c} placeholder={`Criterion ${i + 1}`}
                                onChange={e => upd("criteria", data.criteria.map((x, j) => (j === i ? e.target.value : x)))}
                                className="w-32 bg-[#111827] border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500" />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-800">
                          <td className="pr-3 py-2 text-white font-semibold">{data.company || "Your company"}</td>
                          {Array.from({ length: CRITERIA }, (_, i) => (
                            <td key={i} className="text-center">
                              <input type="checkbox" checked={data.usHas[i]} aria-label={`${data.company} — ${data.criteria[i]}`}
                                onChange={e => upd("usHas", data.usHas.map((x, j) => (j === i ? e.target.checked : x)))} className="w-4 h-4 accent-blue-500" />
                            </td>
                          ))}
                        </tr>
                        {data.competitors.map((c, ci) => (
                          <tr key={ci} className="border-t border-gray-800">
                            <td className="pr-3 py-1.5">
                              <input value={c.name} placeholder={`Competitor ${ci + 1}`}
                                onChange={e => updArr<typeof c>("competitors", ci, "name", e.target.value)}
                                className="w-40 bg-[#111827] border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500" />
                            </td>
                            {Array.from({ length: CRITERIA }, (_, i) => (
                              <td key={i} className="text-center">
                                <input type="checkbox" checked={c.has[i]} aria-label={`${c.name || `Competitor ${ci + 1}`} — ${data.criteria[i]}`}
                                  onChange={e => updArr<typeof c>("competitors", ci, "has", c.has.map((x, j) => (j === i ? e.target.checked : x)))} className="w-4 h-4 accent-blue-500" />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Hint>Up to {COMPETITORS} alternatives. Include the indirect ones — spreadsheets, consultants, doing nothing.</Hint>
                </div>
              )}

              {slide === "model" && (
                <Grid>
                  <div>
                    <Label>Revenue streams (one per line, main one first)</Label>
                    <TextArea value={data.revStreams} onChange={v => upd("revStreams", v)} rows={6} />
                  </div>
                  <div>
                    <Label>Pricing (one per line)</Label>
                    <TextArea value={data.pricing} onChange={v => upd("pricing", v)} rows={6} />
                  </div>
                </Grid>
              )}

              {slide === "traction" && (
                <>
                  <div>
                    <Label>Key numbers (up to 4)</Label>
                    <Grid cols={4}>
                      {data.kpis.map((k, i) => (
                        <div key={i} className="space-y-2">
                          <Input value={k.label} onChange={v => updArr<typeof k>("kpis", i, "label", v)} placeholder={["MRR", "Customers", "MoM growth", "Net retention"][i]} />
                          <Input value={k.value} onChange={v => updArr<typeof k>("kpis", i, "value", v)} placeholder={["$25K", "120", "18%", "112%"][i]} />
                        </div>
                      ))}
                    </Grid>
                  </div>
                  <div>
                    <Label>Milestones (one per line, with dates — up to 5, shown as a timeline)</Label>
                    <TextArea value={data.milestones} onChange={v => upd("milestones", v)} rows={5} />
                  </div>
                </>
              )}

              {slide === "unitEconomics" && (
                <>
                  <Grid cols={4}>
                    <div><Label>Revenue / customer / month</Label><NumInput value={data.arpa} onChange={v => upd("arpa", v)} min={0} step={10} prefix={sym} /></div>
                    <div><Label>Gross margin %</Label><NumInput value={data.grossMarginPct} onChange={v => upd("grossMarginPct", v)} min={0} step={1} prefix="%" /></div>
                    <div><Label>Monthly churn %</Label><NumInput value={data.churnPct} onChange={v => upd("churnPct", v)} min={0} step={0.1} prefix="%" /></div>
                    <div><Label>CAC</Label><NumInput value={data.cac} onChange={v => upd("cac", v)} min={0} step={100} prefix={sym} /></div>
                  </Grid>
                  <div className="grid grid-cols-3 gap-3">
                    <Stat label="Lifetime value" value={ue.ltv !== null ? compact(sym, ue.ltv) : "n/a"} />
                    <Stat label="LTV / CAC" value={ue.ltvToCac !== null ? `${ue.ltvToCac.toFixed(1)}×` : "n/a"} tone={ue.ltvToCac === null ? "plain" : ue.ltvToCac >= 3 ? "good" : "warn"} />
                    <Stat label="CAC payback" value={ue.paybackMonths !== null ? `${Math.round(ue.paybackMonths)} months` : "n/a"} tone={ue.paybackMonths === null ? "plain" : ue.paybackMonths <= 18 ? "good" : "warn"} />
                  </div>
                  <Hint>LTV = revenue per customer × gross margin ÷ monthly churn. Payback = CAC ÷ monthly gross profit per customer.</Hint>
                </>
              )}

              {slide === "financials" && (
                <>
                  <Hint>Annual figures in {sym}. EBITDA rather than net profit: it&apos;s what investors compare across companies. A loss is negative.</Hint>
                  <div className="grid grid-cols-5 gap-3">
                    {data.revVals.map((_, i) => (
                      <div key={i} className="space-y-3">
                        <p className="text-blue-400 text-xs font-bold uppercase tracking-wide text-center">Year {i + 1}</p>
                        <div>
                          <Label>Revenue</Label>
                          <NumInput value={data.revVals[i]} step={10000} onChange={v => upd("revVals", data.revVals.map((x, j) => (j === i ? v : x)))} />
                        </div>
                        <div>
                          <Label>EBITDA</Label>
                          <NumInput value={data.profVals[i]} step={10000} onChange={v => upd("profVals", data.profVals.map((x, j) => (j === i ? v : x)))} />
                        </div>
                        <p className="text-[11px] text-gray-500 text-center">
                          {fin.margins[i] === null ? "–" : `${fin.margins[i]!.toFixed(0)}% margin`}
                          {fin.growth[i] !== null && <><br />{fin.growth[i]! >= 0 ? "+" : ""}{fin.growth[i]!.toFixed(0)}% growth</>}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label>Key assumptions (one per line, 2–4)</Label>
                    <TextArea value={data.assumptions} onChange={v => upd("assumptions", v)} rows={4} />
                  </div>
                </>
              )}

              {slide === "team" && (
                <Grid>
                  {data.team.map((m, i) => (
                    <div key={i} className="space-y-3 bg-[#0a0f1e] rounded-xl p-4 border border-gray-800">
                      <p className="text-blue-400 text-xs font-bold uppercase tracking-wide">Member {i + 1}</p>
                      <Input value={m.name} onChange={v => updArr<typeof m>("team", i, "name", v)} placeholder="Name" />
                      <Input value={m.role} onChange={v => updArr<typeof m>("team", i, "role", v)} placeholder="Role" />
                      <TextArea value={m.bio} onChange={v => updArr<typeof m>("team", i, "bio", v)} rows={3} placeholder="Relevant experience and results, in one or two lines" />
                    </div>
                  ))}
                </Grid>
              )}

              {slide === "ask" && (
                <Grid>
                  <div className="space-y-4">
                    <div>
                      <Label>Raising ({sym})</Label>
                      <NumInput value={data.fundingAmt} onChange={v => upd("fundingAmt", v)} min={0} step={50000} prefix={sym} />
                    </div>
                    <div>
                      <Label>Round</Label>
                      <Select value={data.fundingType} onChange={v => upd("fundingType", v)}
                        options={["Pre-seed", "Seed", "Series A", "Series B", "Bridge / Convertible"]} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Runway (months)</Label>
                        <NumInput value={data.runwayMonths} onChange={v => upd("runwayMonths", v)} min={0} step={1} />
                      </div>
                      <div>
                        <Label>Pre-money (optional)</Label>
                        <NumInput value={data.preMoney} onChange={v => upd("preMoney", v)} min={0} step={500000} prefix={sym} />
                      </div>
                    </div>
                    {dil !== null && (
                      <Hint>Post-money {compact(sym, data.preMoney + data.fundingAmt)} — the round sells {dil.toFixed(0)}% of the company.</Hint>
                    )}
                    <div>
                      <Label>What this round delivers (one per line)</Label>
                      <TextArea value={data.achieveText} onChange={v => upd("achieveText", v)} rows={4} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Use of funds — area and % (should total 100)</Label>
                    {data.useOfFunds.map((u, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <Input value={u.label} onChange={v => updArr<typeof u>("useOfFunds", i, "label", v)}
                            placeholder={["Product & Engineering", "Sales & Marketing", "Operations", ""][i]} />
                        </div>
                        <div className="w-20">
                          <input type="number" value={u.pct} min={0} max={100}
                            onChange={e => updArr<typeof u>("useOfFunds", i, "pct", Number(e.target.value))}
                            className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                        </div>
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    ))}
                    <Hint>Total: {data.useOfFunds.filter(u => u.label.trim()).reduce((s, u) => s + u.pct, 0)}%</Hint>
                  </div>
                </Grid>
              )}

              {slide === "closing" && (
                <Grid cols={3}>
                  <div><Label>Contact name</Label><Input value={data.contactName} onChange={v => upd("contactName", v)} placeholder="Jane Doe, CEO" /></div>
                  <div><Label>Email</Label><Input value={data.contactEmail} onChange={v => upd("contactEmail", v)} placeholder="jane@company.com" /></div>
                  <div><Label>Website</Label><Input value={data.website} onChange={v => upd("website", v)} placeholder="company.com" /></div>
                </Grid>
              )}
            </div>

            {/* Navigation + generate */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab(t => Math.max(0, t - 1))}
                  disabled={activeTab === 0}
                  className="px-5 py-2.5 bg-[#0d1426] border border-gray-700 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setActiveTab(t => Math.min(SLIDES.length - 1, t + 1))}
                  disabled={activeTab === SLIDES.length - 1}
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
          </div>

          {/* ── Storyline + investor review ─────────────────────────────────── */}
          <aside className="lg:w-[22rem] shrink-0 space-y-4">
            <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Storyline</h3>
              <Hint>Read only the titles: they should tell the whole story. Click one to edit its slide.</Hint>
              <ol className="mt-3 space-y-1.5">
                {SLIDES.filter(k => k !== "cover" && k !== "closing").map(k => {
                  const i = SLIDES.indexOf(k);
                  return (
                    <li key={k}>
                      <button onClick={() => setActiveTab(i)}
                        className={`text-left text-xs leading-snug w-full rounded px-1.5 py-1 transition ${i === activeTab ? "bg-blue-600/20 text-white" : "text-gray-300 hover:bg-white/5"}`}>
                        <span className="text-gray-500 mr-1">{i + 1}.</span>
                        {data.headlines[k]?.trim() || auto[k]}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Investor review</h3>
              <Hint>What an investor&apos;s first read would flag.</Hint>
              {findings.length === 0 ? (
                <p className="mt-3 text-sm text-emerald-300">Nothing flagged. Check every figure against your model before sending.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {findings.map((f, i) => (
                    <li key={i}>
                      <button onClick={() => setActiveTab(SLIDES.indexOf(f.slide))} className="text-left w-full group">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 mr-1.5 ${f.level === "fix" ? "bg-red-900/50 text-red-300" : "bg-amber-900/40 text-amber-300"}`}>
                          {f.level === "fix" ? "Fix" : "Check"}
                        </span>
                        <span className="text-[11px] text-gray-500 mr-1">{SLIDE_NAMES[f.slide]}:</span>
                        <span className="text-xs text-gray-300 group-hover:text-white">{f.message}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {fixes > 0 && <p className="mt-3 text-[11px] text-red-300">{fixes} to fix before sending.</p>}
            </div>

            <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-5 text-xs text-gray-400 space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">House rules</h3>
              <p>· One message per slide; the title states it.</p>
              <p>· Every number that isn&apos;t yours gets a source.</p>
              <p>· Lead with the executive summary — many investors read only that.</p>
              <p>· Ten to fifteen slides; put detail in an appendix.</p>
              <p>· {lines(data.assumptions).length ? "Projections stand on stated assumptions." : "State the assumptions behind the projections."}</p>
            </div>
          </aside>
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          Exported as editable .pptx with native charts · Open in PowerPoint, Keynote or Google Slides · Built by{" "}
          <span className="text-gray-500">FinancePlots</span>
        </p>
      </div>

      <PitchChat
        data={data}
        set={patch => setData(prev => ({ ...prev, ...patch }))}
        setSlide={k => setActiveTab(SLIDES.indexOf(k))}
        sym={sym}
        download={handleGenerate}
      />
    </main>
  );
}
