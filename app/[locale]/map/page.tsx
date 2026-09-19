import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FinancePlots System Map — Your Finance Tool Journey",
  description:
    "Explore the FinancePlots system map. Two paths: Personal Finance and Professional FP&A. Find the right tools for your financial journey.",
  alternates: { canonical: "https://www.financeplots.com/map" },
};

const PERSONAL_STATIONS = [
  { n: 1, label: "Personal Budget",    icon: "💸", href: "/tools/personal-budget",    desc: "Track income & expenses" },
  { n: 2, label: "Compound Interest",  icon: "📈", href: "/tools/compound-interest",  desc: "Grow your savings" },
  { n: 3, label: "Mortgage & Loans",   icon: "🏠", href: "/tools/lending",            desc: "Plan borrowing costs" },
  { n: 4, label: "Stock Analysis",     icon: "🔍", href: "/tools/stock-analysis",     desc: "Analyse any stock" },
  { n: 5, label: "Stock Comparison",   icon: "⚖️",  href: "/tools/stock-comparison",  desc: "Compare side by side" },
  { n: 6, label: "Portfolio Analysis", icon: "📊", href: "/tools/portfolio-analysis", desc: "Risk & return overview" },
]

const PROFESSIONAL_STATIONS = [
  { n: 1, label: "Annual Budget",       icon: "💰", href: "/tools/annual-budget",    desc: "12-month P&L builder" },
  { n: 2, label: "Cash Flow Forecast",  icon: "💧", href: "/tools/cash-flow",        desc: "13-week rolling forecast" },
  { n: 3, label: "Break-Even",          icon: "⚖️",  href: "/tools/break-even",      desc: "Find your break-even point" },
  { n: 4, label: "Financial Model",     icon: "🏗️",  href: "/tools/financial-model", desc: "5-year projections" },
  { n: 5, label: "DCF Valuation",       icon: "🏢", href: "/tools/valuation",        desc: "Business valuation" },
]

// SVG layout constants
const W = 560
const H = 860
const LX = 145   // personal line x
const RX = 415   // professional line x
const TOP = 120
const GAP = 112  // gap between stations

export default function MapPage() {
  const personalY = (i: number) => TOP + i * GAP
  const proY = (i: number) => TOP + 56 + i * GAP  // offset by half a gap

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <section className="pt-32 pb-8 px-6 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-full px-4 py-1.5 mb-5">
          System Map
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          Your Finance Tool Journey
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Two lines. 17 tools. Pick your path and start building.
        </p>
      </section>

      {/* Legend */}
      <div className="flex justify-center gap-8 mb-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="w-8 h-1 rounded-full bg-blue-500 inline-block" />
          <span className="text-blue-400">Personal Finance Line</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="w-8 h-1 rounded-full bg-amber-400 inline-block" />
          <span className="text-amber-400">Professional FP&amp;A Line</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex justify-center px-4 pb-20">
        <div className="relative w-full max-w-[560px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ overflow: "visible" }}
          >
            {/* ── Terminus labels ── */}
            {/* Personal top */}
            <text x={LX} y={42} textAnchor="middle" fill="#93c5fd" fontSize={11} fontWeight="700" letterSpacing="1">
              PERSONAL FINANCE LINE
            </text>
            <line x1={LX - 40} y1={50} x2={LX + 40} y2={50} stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 3" />

            {/* Professional top */}
            <text x={RX} y={42} textAnchor="middle" fill="#fcd34d" fontSize={11} fontWeight="700" letterSpacing="1">
              PROFESSIONAL FP&amp;A LINE
            </text>
            <line x1={RX - 40} y1={50} x2={RX + 40} y2={50} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" />

            {/* ── Personal line track ── */}
            <line
              x1={LX} y1={TOP - 14}
              x2={LX} y2={personalY(PERSONAL_STATIONS.length - 1) + 50}
              stroke="#3b82f6" strokeWidth={4} strokeLinecap="round"
            />

            {/* ── Professional line track ── */}
            <line
              x1={RX} y1={proY(0) - 14}
              x2={RX} y2={proY(PROFESSIONAL_STATIONS.length - 1) + 50}
              stroke="#f59e0b" strokeWidth={4} strokeLinecap="round"
            />

            {/* ── Cross-connections ── */}
            {/* Connection 1: Personal 1 ↔ Pro 1 (both budget tools) */}
            <line
              x1={LX + 16} y1={personalY(0)}
              x2={RX - 16} y2={proY(0)}
              stroke="#ffffff" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.25}
            />

            {/* Connection 2: Personal 2 ↔ Pro 3 (growth / break-even) */}
            <line
              x1={LX + 16} y1={personalY(2)}
              x2={RX - 16} y2={proY(2)}
              stroke="#ffffff" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.25}
            />

            {/* Connection 3: Personal 6 ↔ Pro 4 (portfolio / financial model) */}
            <line
              x1={LX + 16} y1={personalY(4)}
              x2={RX - 16} y2={proY(3)}
              stroke="#ffffff" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.25}
            />

            {/* ── Terminus bottom labels ── */}
            <text
              x={LX} y={personalY(PERSONAL_STATIONS.length - 1) + 76}
              textAnchor="middle" fill="#93c5fd" fontSize={10} fontWeight="600" letterSpacing="0.5"
            >
              Personal Portfolio Terminus
            </text>
            <text
              x={RX} y={proY(PROFESSIONAL_STATIONS.length - 1) + 76}
              textAnchor="middle" fill="#fcd34d" fontSize={10} fontWeight="600" letterSpacing="0.5"
            >
              Corporate DCF Terminus
            </text>

            {/* ── Personal stations ── */}
            {PERSONAL_STATIONS.map((s, i) => {
              const cy = personalY(i)
              return (
                <g key={s.href}>
                  {/* Station glow */}
                  <circle cx={LX} cy={cy} r={20} fill="#1e3a5f" opacity={0.6} />
                  {/* Station circle */}
                  <circle cx={LX} cy={cy} r={14} fill="#0a0f1e" stroke="#3b82f6" strokeWidth={3} />
                  {/* Number */}
                  <text x={LX} y={cy + 5} textAnchor="middle" fill="#93c5fd" fontSize={13} fontWeight="800">
                    {s.n}
                  </text>
                  {/* Icon */}
                  <text x={LX - 32} y={cy + 5} textAnchor="middle" fontSize={16}>
                    {s.icon}
                  </text>
                  {/* Label */}
                  <text x={LX - 52} y={cy - 5} textAnchor="end" fill="#e2e8f0" fontSize={12} fontWeight="700">
                    {s.label}
                  </text>
                  {/* Description */}
                  <text x={LX - 52} y={cy + 10} textAnchor="end" fill="#64748b" fontSize={10}>
                    {s.desc}
                  </text>
                  {/* Invisible link hit area */}
                  <a href={s.href}>
                    <rect x={LX - 180} y={cy - 22} width={166} height={44} fill="transparent" rx={6} />
                  </a>
                </g>
              )
            })}

            {/* ── Professional stations ── */}
            {PROFESSIONAL_STATIONS.map((s, i) => {
              const cy = proY(i)
              return (
                <g key={s.href}>
                  {/* Station glow */}
                  <circle cx={RX} cy={cy} r={20} fill="#3d2a00" opacity={0.6} />
                  {/* Station circle */}
                  <circle cx={RX} cy={cy} r={14} fill="#0a0f1e" stroke="#f59e0b" strokeWidth={3} />
                  {/* Number */}
                  <text x={RX} y={cy + 5} textAnchor="middle" fill="#fcd34d" fontSize={13} fontWeight="800">
                    {s.n}
                  </text>
                  {/* Icon */}
                  <text x={RX + 32} y={cy + 5} textAnchor="middle" fontSize={16}>
                    {s.icon}
                  </text>
                  {/* Label */}
                  <text x={RX + 52} y={cy - 5} textAnchor="start" fill="#e2e8f0" fontSize={12} fontWeight="700">
                    {s.label}
                  </text>
                  {/* Description */}
                  <text x={RX + 52} y={cy + 10} textAnchor="start" fill="#64748b" fontSize={10}>
                    {s.desc}
                  </text>
                  {/* Invisible link hit area */}
                  <a href={s.href}>
                    <rect x={RX + 14} y={cy - 22} width={166} height={44} fill="transparent" rx={6} />
                  </a>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* CTA */}
      <section className="border-t border-white/5 px-6 py-12 text-center">
        <p className="text-gray-400 text-sm mb-4">All tools are free. No signup required.</p>
        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition"
        >
          Open All Tools →
        </Link>
      </section>
    </main>
  )
}
