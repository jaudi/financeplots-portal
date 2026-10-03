import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { formatDuration, formatEditionDate, listEditions, MOODS } from "@/lib/observer";
import { AUDIENCE_KEYS, audienceSlugs } from "@/lib/audiences";
import AudienceDoors from "@/components/AudienceDoors";
import HeroSearch from "@/components/HeroSearch";
import HeroSnowflake from "@/components/HeroSnowflake";

// The homepage, laid out as a landing page (2026-10-03): one promise and one
// action above the fold, then proof, then the two audiences, then what makes
// the site different, then the weekly writing. Copy lives in the `home`
// namespace of the message files.
//
// UK MAR (CLAUDE.md): the homepage names no share. The hero snowflake is an
// illustration with invented positions, the search suggests nothing until the
// visitor types, and no example uses a real ticker.

export const metadata: Metadata = {
  title: "FinancePlots — Free Finance Tools You Can See",
  description:
    "Free finance tools for your money and your company — budgets, cash flow, valuation, take-home pay — plus a visual page for every S&P 500, Nasdaq-100 and IBEX 35 company. No signup, no ads. Works inside Claude.",
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

  const articles = tBlog.raw("articles") as Article[];
  const recent = articles.slice(0, 3);
  const totalArticles = articles.length;
  const toolCount = new Set(AUDIENCE_KEYS.flatMap((a) => audienceSlugs(a))).size;
  const [observer] = listEditions();
  const dateLocale = (await getLocale()) === "es" ? "es-ES" : "en-GB";

  const features = [
    { icon: "❄️", title: t("feature1Title"), desc: t("feature1Desc"), href: "/tools/stocks", cta: t("feature1Cta") },
    { icon: "📐", title: t("feature2Title"), desc: t("feature2Desc"), href: "/tools", cta: t("feature2Cta") },
    { icon: "🎓", title: t("feature3Title"), desc: t("feature3Desc"), href: "/blog", cta: t("feature3Cta") },
  ];

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">

      {/* ── Hero: one promise, one action ── */}
      <section className="relative px-4 sm:px-6 pt-28 md:pt-32 pb-12 overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
          <div>
            <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/25 rounded-full px-3.5 py-1.5 mb-6">
              {t("heroEyebrow")}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5">
              {t("heroLine1")}{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">{t("heroLine2")}</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-xl">{t("heroSub")}</p>

            <HeroSearch label={t("heroSearchLabel")} placeholder={t("heroSearchPlaceholder")} cta={t("heroSearchCta")} />

            <p className="text-sm text-gray-400 mt-6">
              {t("heroOr")}{" "}
              <Link href="/tools/personal" className="text-blue-400 hover:text-blue-300 font-semibold">{t("heroForYou")}</Link>
              {" · "}
              <Link href="/tools/business" className="text-green-400 hover:text-green-300 font-semibold">{t("heroForCompany")}</Link>
            </p>
          </div>

          <HeroSnowflake caption={t("heroSnowflakeCaption")} />
        </div>

        {/* Proof strip */}
        <dl className="relative max-w-6xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-800/60 border border-gray-800 rounded-2xl overflow-hidden">
          {[
            [String(toolCount), t("proofTools")],
            ["0", t("proofSignup")],
            ["3", t("proofIndices")],
            [String(totalArticles), t("proofArticles")],
          ].map(([value, label]) => (
            <div key={label} className="flex flex-col bg-[#0b1122] px-5 py-4">
              <dt className="text-gray-500 text-xs uppercase tracking-wider order-2">{label}</dt>
              <dd className="text-2xl md:text-3xl font-extrabold text-white order-1">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Two audiences ── */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest text-center mb-3">{t("doorsLabel")}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">{t("doorsTitle")}</h2>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">{t("doorsSub")}</p>
          <AudienceDoors />
        </div>
      </section>

      {/* ── What makes it different ── */}
      <section className="px-4 sm:px-6 py-16 bg-[#0d1426] border-y border-gray-800/60">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest text-center mb-3">{t("whyLabel")}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">{t("whyTitle")}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <Link key={f.title} href={f.href} className="group flex flex-col bg-[#0a0f1e] border border-gray-800 hover:border-blue-600/60 rounded-2xl p-7 transition">
                <span className="text-3xl mb-4">{f.icon}</span>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{f.desc}</p>
                <span className="mt-auto text-blue-400 text-sm font-semibold">{f.cta}</span>
              </Link>
            ))}
          </div>

          {/* Inside Claude: the connector, shown as a conversation */}
          <div className="mt-12 grid lg:grid-cols-2 gap-8 items-center bg-gradient-to-br from-orange-500/10 to-blue-600/5 border border-orange-500/20 rounded-2xl p-7 md:p-10">
            <div>
              <p className="text-orange-300 text-xs font-bold uppercase tracking-widest mb-3">{t("mcpLabel")}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3">{t("mcpTitle")}</h2>
              <p className="text-gray-400 leading-relaxed mb-6">{t("mcpDesc")}</p>
              <Link href="/mcp" className="inline-block bg-white text-[#0a0f1e] hover:bg-gray-200 font-bold px-6 py-3 rounded-xl transition">
                {t("mcpCta")}
              </Link>
            </div>
            <div className="bg-[#0a0f1e] border border-gray-800 rounded-2xl p-5 space-y-3 text-sm" aria-hidden="true">
              <div className="ml-auto max-w-[85%] bg-blue-600/20 border border-blue-500/30 rounded-2xl rounded-br-sm px-4 py-2.5 text-gray-100">
                {t("mcpChatUser")}
              </div>
              <div className="max-w-[90%] bg-[#111827] border border-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 text-gray-300">
                <p className="text-[11px] text-orange-300 font-semibold mb-1.5">⚙ {t("mcpChatTool")}</p>
                {t("mcpChatReply")}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["take_home_pay", "company_snowflake", "business_valuation", "loan_repayment", "us_macro_indicators"].map((name) => (
                  <span key={name} className="font-mono text-[11px] text-gray-400 bg-black/30 border border-gray-800 rounded-md px-2 py-0.5">{name}</span>
                ))}
                <span className="text-[11px] text-gray-500 px-1 py-0.5">{t("mcpChatMore")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Observer: latest weekly edition ── */}
      {observer && (
        <section className="px-4 sm:px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
              <div>
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">{t("observerLabel")}</p>
                <h2 className="text-3xl font-bold">{t("observerTitle")}</h2>
              </div>
              <Link href="/observer" className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition">
                {t("observerAll")} →
              </Link>
            </div>

            <Link
              href={`/observer/${observer.slug}`}
              className="block bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border border-blue-700/40 hover:border-blue-500 rounded-2xl p-7 md:p-8 transition group"
            >
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  {t("observerLatest")}
                </span>
                <span className="text-gray-400 text-xs">{t("observerWeekOf", { date: formatEditionDate(observer.date, dateLocale) })}</span>
                {observer.audio && (
                  <span className="text-gray-400 text-xs">· 🎧 {formatDuration(observer.audio.durationSeconds)}</span>
                )}
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold leading-tight mb-3 group-hover:text-blue-300 transition">
                {observer.title}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">{observer.dek}</p>

              <div className="grid md:grid-cols-3 gap-3 mb-6">
                {observer.regions.map((r) => (
                  <div key={r.region} className="bg-black/20 border border-gray-800 rounded-xl p-4">
                    <p className="text-gray-500 text-[11px] uppercase tracking-wider mb-1">
                      {r.region === "Euro" ? "Euro area" : r.region === "US" ? "United States" : "Asia"}
                    </p>
                    <p className="text-gray-200 text-sm font-semibold leading-snug">{r.headline}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs">{t("observerMood")}</span>
                  <div className="flex gap-1">
                    {MOODS.map((m) => (
                      <span key={m} className={`w-6 h-1.5 rounded-full ${m === observer.mood.label ? "bg-blue-400" : "bg-gray-700"}`} />
                    ))}
                  </div>
                  <span className="text-white text-sm font-semibold">{observer.mood.label}</span>
                </div>
                <span className="text-blue-400 text-sm font-semibold">{t("observerCta")}</span>
              </div>
            </Link>

            <p className="mt-4 text-gray-600 text-xs">{t("observerDisclaimer")}</p>
          </div>
        </section>
      )}

      {/* ── Latest articles ── */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">{t("blogLabel")}</p>
              <h2 className="text-3xl font-bold">{t("latestArticlesTitle")}</h2>
            </div>
            <Link href="/blog" className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition">
              {t("viewAllArticles", { count: totalArticles })}
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {recent.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="flex flex-col bg-[#111827] border border-gray-800 rounded-2xl p-6 hover:border-blue-700/50 transition group"
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${TAG_COLORS[a.tag] ?? "text-blue-400"}`}>
                  {a.tag}
                </span>
                <h3 className="text-white font-semibold mt-2 mb-2 leading-snug group-hover:text-blue-300 transition">
                  {a.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-3">{a.description}</p>
                <span className="mt-auto text-gray-600 text-xs">{a.date}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="px-4 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto bg-[#0d1426] border border-gray-800 rounded-2xl p-7 md:p-8 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="text-5xl shrink-0">✉️</div>
          <div className="flex-1">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">{t("contactLabel")}</p>
            <h2 className="text-xl font-bold text-white mb-1">{t("contactTitle")}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{t("contactDesc")}</p>
          </div>
          <a
            href="mailto:hello@financeplots.com"
            className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
          >
            {t("contactCtaShort")}
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-white font-bold text-xl mb-1">
                Finance<span className="text-blue-400">Plots</span>
              </div>
              <p className="text-gray-500 text-xs">{t("footerTagline")}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-500">
              <Link href="/tools" className="hover:text-gray-300 transition">Tools</Link>
              <Link href="/tools/stocks" className="hover:text-gray-300 transition">Stocks</Link>
              <Link href="/observer" className="hover:text-gray-300 transition">The Observer</Link>
              <Link href="/blog" className="hover:text-gray-300 transition">Blog</Link>
              <Link href="/mcp" className="hover:text-gray-300 transition">Claude connector</Link>
              <Link href="/about" className="hover:text-gray-300 transition">About</Link>
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
