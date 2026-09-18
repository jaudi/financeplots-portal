"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

function ToolCard({ tool }: { tool: { icon: string; name: string; desc: string; href: string } }) {
  const t = useTranslations("tools");
  return (
    <Link
      href={tool.href}
      className="bg-[#0d1426] border border-gray-800 hover:border-blue-600/60 rounded-2xl p-6 transition group block"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl shrink-0">{tool.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-white font-bold text-base group-hover:text-blue-300 transition">
              {tool.name}
            </h2>
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">
              {t("liveBadge")}
            </span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{tool.desc}</p>
        </div>
      </div>
    </Link>
  );
}

export default function ToolsPage() {
  const t = useTranslations("tools");
  const tm = useTranslations("mcp");
  const stockTools = t.raw("stockTools") as { icon: string; name: string; desc: string; href: string }[];
  const fpaTools = t.raw("fpaTools") as { icon: string; name: string; desc: string; href: string }[];

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest text-center mb-3">
          {t("label")}
        </p>
        <h1 className="text-4xl font-extrabold text-center mb-3">
          {t("title")}
        </h1>
        <p className="text-gray-400 text-center mb-16">
          {t("subtitle")}
        </p>

        {/* Featured — 2-column grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {/* Individual Planner */}
          <Link
            href="/tools/financial-planner"
            className="block bg-gradient-to-br from-blue-900/40 to-purple-900/20 border border-blue-700/40 hover:border-blue-500 rounded-2xl p-7 transition group"
          >
            <div className="flex items-start gap-4 overflow-hidden">
              <span className="text-4xl shrink-0">🗺️</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-white font-bold text-lg group-hover:text-blue-300 transition">{t("featuredTitle")}</h2>
                  <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">{t("featuredBadge")}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t("featuredDesc")}
                </p>
                <div className="flex flex-wrap gap-2 mt-4 text-xs text-gray-500">
                  <span>💰 Budget</span>
                  <span>→</span>
                  <span>💳 Debt</span>
                  <span>→</span>
                  <span>📈 Compounding</span>
                  <span>→</span>
                  <span>🎯 Allocation</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Company Planner */}
          <Link
            href="/tools/financial-planner-company"
            className="block bg-gradient-to-br from-green-900/40 to-teal-900/20 border border-green-700/40 hover:border-green-500 rounded-2xl p-7 transition group"
          >
            <div className="flex items-start gap-4 overflow-hidden">
              <span className="text-4xl shrink-0">🏢</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-white font-bold text-lg group-hover:text-green-300 transition">{t("featuredTitleCompany")}</h2>
                  <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-semibold">{t("featuredBadge")}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t("featuredDescCompany")}
                </p>
                <div className="flex flex-wrap gap-2 mt-4 text-xs text-gray-500">
                  <span>📊 P&amp;L</span>
                  <span>→</span>
                  <span>💧 Cash Flow</span>
                  <span>→</span>
                  <span>⚖️ Balance Sheet</span>
                  <span>→</span>
                  <span>💎 Valuation</span>
                  <span>→</span>
                  <span>🚀 Exit</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* The same tools, from inside an AI assistant */}
        <Link
          href="/mcp"
          className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 bg-[#0d1426] border border-blue-600/30 hover:border-blue-500 rounded-2xl px-6 py-5 mb-12 transition group"
        >
          <span className="text-3xl shrink-0">🤖</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold group-hover:text-blue-300 transition">{tm("bannerTitle")}</h2>
            <p className="text-gray-500 text-sm">{tm("bannerDesc")}</p>
          </div>
          <span className="text-blue-400 text-sm font-semibold shrink-0">{tm("bannerCta")}</span>
        </Link>

        {/* Stock & Market */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">📡</span>
            <div>
              <h2 className="text-white font-bold text-lg">{t("stockSectionTitle")}</h2>
              <p className="text-gray-500 text-xs">{t("stockSectionSubtitle")}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {stockTools.map(tool => <ToolCard key={tool.name} tool={tool} />)}
          </div>
        </div>

        {/* FP&A */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">🧮</span>
            <div>
              <h2 className="text-white font-bold text-lg">{t("fpaSectionTitle")}</h2>
              <p className="text-gray-500 text-xs">{t("fpaSectionSubtitle")}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {fpaTools.map(tool => <ToolCard key={tool.name} tool={tool} />)}
          </div>
        </div>

        {/* Fundraising */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">🎯</span>
            <div>
              <h2 className="text-white font-bold text-lg">Fundraising</h2>
              <p className="text-gray-500 text-xs">Raise capital with confidence</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/tools/pitch-deck"
              className="bg-[#0d1426] border border-gray-800 hover:border-blue-600/60 rounded-2xl p-6 transition group block"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0">🎯</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-white font-bold text-base group-hover:text-blue-300 transition">
                      Pitch Deck Builder
                    </h2>
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">
                      Live
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    9-slide investor pitch deck — cover, problem, solution, market size, business
                    model, traction, financials, team and the ask. Download as editable PowerPoint (.pptx).
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
