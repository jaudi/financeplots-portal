import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import ScreenerSpotlight from "@/components/ScreenerSpotlight";
import { getSp500Report } from "@/lib/screener";

export const metadata: Metadata = {
  title: "FinancePlots — Independent Writing on Markets, Macro & FP&A",
  description:
    "Independent writing on markets, macro and corporate finance, plus 16 free FP&A tools — personal budget, portfolio analysis, DCF valuation, cash flow forecast and more. No signup.",
  alternates: { canonical: "https://www.financeplots.com" },
};

type Article = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tag: string;
};

const TAG_COLORS: Record<string, string> = {
  "Corporate Finance": "text-blue-400",
  "Finanzas Corporativas": "text-blue-400",
  "Valuation": "text-purple-400",
  "Valoración": "text-purple-400",
  "Small Business Finance": "text-yellow-400",
  "Finanzas para Pymes": "text-yellow-400",
  "Personal Finance": "text-green-400",
  "Finanzas Personales": "text-green-400",
  "Startup Finance": "text-orange-400",
  "Finanzas para Startups": "text-orange-400",
  "Analysis": "text-gray-400",
  "Análisis": "text-gray-400",
  "Opinion": "text-red-400",
  "Opinión": "text-red-400",
  "Tutorial": "text-teal-400",
  "Tutorial (es)": "text-teal-400",
  "Guide": "text-purple-400",
  "Guía": "text-purple-400",
};

export default async function Home() {
  const t = await getTranslations("home");
  const tBlog = await getTranslations("blog");

  const personalTools = t.raw("personalTools") as [string, string, string, string][];
  const professionalTools = t.raw("professionalTools") as [string, string, string, string][];
  const articles = tBlog.raw("articles") as Article[];

  const featured = articles[0];
  const recent = articles.slice(1, 7); // next 6 after the featured one
  const totalArticles = articles.length;

  const sp500Report = await getSp500Report();

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">

      <ScreenerSpotlight report={sp500Report} />

      {/* ── Hero: featured article ── */}
      <section className="relative px-6 pt-16 pb-20 overflow-hidden border-t border-gray-800">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-full px-4 py-1.5">
              {t("featuredArticleBadge")}
            </span>
            <span className={`text-xs font-semibold uppercase tracking-wider ${TAG_COLORS[featured.tag] ?? "text-blue-400"}`}>
              {featured.tag}
            </span>
            <span className="text-gray-500 text-xs">{featured.date}</span>
          </div>

          <Link
            href={`/blog/${featured.slug}`}
            className="block group"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight group-hover:text-blue-300 transition">
              {featured.title}
            </h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-3xl">
              {featured.description}
            </p>
          </Link>

          <div className="flex gap-4 flex-wrap">
            <Link
              href={`/blog/${featured.slug}`}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-base transition shadow-lg shadow-blue-600/25"
            >
              {t("heroCtaArticle")}
            </Link>
            <Link
              href="/tools"
              className="bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-gray-600 text-gray-200 font-semibold px-8 py-4 rounded-xl text-base transition"
            >
              {t("heroCtaTools")}
            </Link>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-8 md:gap-12 mt-16 pt-10 border-t border-gray-800">
            {[
              [String(totalArticles), t("stat3Label")],
              ["16", t("stat1Label")],
              ["2",  t("stat2Label")],
            ].map(([num, label]) => (
              <div key={label}>
                <div className="text-3xl font-extrabold text-white">{num}</div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog grid: recent articles ── */}
      <section className="bg-[#0d1426] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">{t("blogLabel")}</p>
              <h2 className="text-3xl font-bold">{t("latestArticlesTitle")}</h2>
            </div>
            <Link href="/blog" className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition">
              {t("viewAllArticles")}
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recent.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="block bg-[#111827] border border-gray-800 rounded-2xl p-6 hover:border-blue-700/50 transition group"
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${TAG_COLORS[a.tag] ?? "text-blue-400"}`}>
                  {a.tag}
                </span>
                <h3 className="text-white font-semibold mt-2 mb-2 text-base leading-snug group-hover:text-blue-300 transition">
                  {a.title}
                </h3>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed line-clamp-2">{a.description}</p>
                <span className="text-gray-600 text-xs">{a.date}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promo video ── */}
      <section className="px-6 py-20">
        <div className="max-w-sm mx-auto">
          <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-blue-700/30 shadow-2xl shadow-blue-600/10 bg-[#0d1426]">
            <video
              src="/financeplots-top-tools.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Tools ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest text-center mb-3">{t("toolsLabel")}</p>
          <h2 className="text-3xl font-bold text-center mb-3">{t("toolsTitle")}</h2>
          <p className="text-gray-400 text-center mb-10">{t("toolsSubtitle")}</p>

          {/* Featured: Financial Journey Planners */}
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {/* Individual */}
            <Link
              href="/tools/financial-planner"
              className="block bg-gradient-to-br from-blue-900/40 to-purple-900/20 border border-blue-700/40 hover:border-blue-500 rounded-2xl p-7 transition group"
            >
              <div className="flex items-start gap-4 overflow-hidden">
                <span className="text-4xl shrink-0">🗺️</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-white font-bold text-lg md:text-xl group-hover:text-blue-300 transition">{t("featuredToolTitle")}</h3>
                    <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">{t("featuredBadge")}</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t("featuredToolDesc")}
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
            {/* Company */}
            <Link
              href="/tools/financial-planner-company"
              className="block bg-gradient-to-br from-green-900/40 to-teal-900/20 border border-green-700/40 hover:border-green-500 rounded-2xl p-7 transition group"
            >
              <div className="flex items-start gap-4 overflow-hidden">
                <span className="text-4xl shrink-0">🏢</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-white font-bold text-lg md:text-xl group-hover:text-green-300 transition">{t("featuredToolTitleCompany")}</h3>
                    <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-semibold">{t("featuredBadge")}</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t("featuredToolDescCompany")}
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

          <div className="grid md:grid-cols-2 gap-10">

            {/* Personal */}
            <div>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
                <span className="text-2xl">👤</span>
                <div>
                  <h3 className="text-white font-bold">{t("personalFinanceTitle")}</h3>
                  <p className="text-gray-500 text-xs">{t("personalFinanceSubtitle")}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {personalTools.map(([icon, name, desc, href]) => (
                  <li key={name}>
                    <Link href={href} className="flex gap-3 items-start bg-[#0d1426] border border-gray-800 rounded-xl p-4 hover:border-blue-700/50 transition group">
                      <span className="text-xl mt-0.5">{icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm group-hover:text-blue-300 transition">{name}</p>
                        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Professional */}
            <div>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
                <span className="text-2xl">🏢</span>
                <div>
                  <h3 className="text-white font-bold">{t("professionalTitle")}</h3>
                  <p className="text-gray-500 text-xs">{t("professionalSubtitle")}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {professionalTools.map(([icon, name, desc, href]) => (
                  <li key={name}>
                    <Link href={href} className="flex gap-3 items-start bg-[#0d1426] border border-gray-800 rounded-xl p-4 hover:border-blue-700/50 transition group">
                      <span className="text-xl mt-0.5">{icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm group-hover:text-blue-300 transition">{name}</p>
                        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* How it works */}
              <div className="mt-6 bg-blue-600/5 border border-blue-700/20 rounded-xl p-5">
                <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">{t("howItWorksLabel")}</p>
                <ol className="space-y-2">
                  {[
                    t("howItWorks1"),
                    t("howItWorks2"),
                    t("howItWorks3"),
                    t("howItWorks4"),
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2 text-gray-400 text-sm">
                      <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>{step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map & Learn ── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <Link
            href="/map"
            className="group flex flex-col gap-4 bg-[#0d1426] border border-gray-800 hover:border-blue-600/40 rounded-2xl p-8 transition"
          >
            <div className="text-4xl">🗺️</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Tools Map</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                See all FinancePlots tools in one place — navigate by category and find the right tool instantly.
              </p>
            </div>
            <span className="text-blue-400 text-sm font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
              Explore the map →
            </span>
          </Link>

          <Link
            href="/learn"
            className="group flex flex-col gap-4 bg-[#0d1426] border border-gray-800 hover:border-purple-600/40 rounded-2xl p-8 transition"
          >
            <div className="text-4xl">📚</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Learn</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                80 free interactive lessons — Power BI and Streamlit. Real code, simulators and quizzes. No signup needed.
              </p>
            </div>
            <span className="text-purple-400 text-sm font-semibold flex items-center gap-1 transition-all">
              Start learning →
            </span>
          </Link>
        </div>
      </section>

      {/* ── Book ── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0d1426] border border-blue-700/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="text-6xl shrink-0">📖</div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">{t("bookLabel")}</p>
              <h2 className="text-2xl font-bold text-white mb-2">{t("bookTitle")}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                {t("bookDesc")}
              </p>
              <a
                href="https://www.amazon.co.uk/Your-money-rules-Javier-Audibert-ebook/dp/B0GT78FLKJ/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3 rounded-xl transition shadow-lg shadow-blue-600/25 text-sm"
              >
                {t("bookCta")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-xl mx-auto">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest text-center mb-3">{t("contactLabel")}</p>
          <h2 className="text-3xl font-bold text-center mb-3">{t("contactTitle")}</h2>
          <p className="text-gray-400 text-center mb-10 text-sm">
            {t("contactDesc")}
          </p>
          <div className="text-center">
            <a
              href="mailto:hello@financeplots.com"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-blue-600/25"
            >
              {t("contactCta")}
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-white font-bold text-xl mb-1">
                Finance<span className="text-blue-400">Plots</span>
              </div>
              <p className="text-gray-500 text-xs">{t("footerTagline")}</p>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="/blog" className="hover:text-gray-300 transition">Blog</a>
              <a href="/tools" className="hover:text-gray-300 transition">Tools</a>
              <a href="/about" className="hover:text-gray-300 transition">About</a>
              <a href="/#contact" className="hover:text-gray-300 transition">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-600 text-xs">
            {t("footerCopyright")}
          </div>
        </div>
      </footer>

    </main>
  );
}
