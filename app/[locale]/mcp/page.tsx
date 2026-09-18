import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import CopyText from "@/components/CopyText";

// How to connect the FinancePlots MCP server (/api/mcp) to Claude and other
// AI assistants. The tool list here is written for people, not taken from
// lib/mcp-server.ts — update both when a tool is added or removed.

const MCP_URL = "https://www.financeplots.com/api/mcp";
const CLAUDE_CODE_CMD = `claude mcp add --transport http financeplots ${MCP_URL}`;

type Props = { params: Promise<{ locale: string }> };

interface Group {
  icon: string;
  title: string;
  items: { name: string; desc: string }[];
  example: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mcp" });
  const url = locale === "es" ? "https://www.financeplots.com/es/mcp" : "https://www.financeplots.com/mcp";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: url,
      languages: { en: "https://www.financeplots.com/mcp", es: "https://www.financeplots.com/es/mcp" },
    },
    openGraph: { title: t("metaTitle"), description: t("metaDescription"), url, siteName: "FinancePlots", type: "website" },
  };
}

export default async function McpPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mcp" });
  const steps = t.raw("steps") as string[];
  const groups = t.raw("groups") as Group[];
  const notes = t.raw("notes") as string[];

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "FinancePlots connector for Claude",
            description: "Free MCP server with finance calculators, US macro data, market quotes and a stock screener.",
            url: "https://www.financeplots.com/mcp",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
            provider: { "@type": "Organization", name: "FinancePlots", url: "https://www.financeplots.com" },
          }),
        }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest text-center mb-3">{t("label")}</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">{t("title")}</h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-10">{t("subtitle")}</p>

        <div className="max-w-2xl mx-auto mb-16">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">{t("urlLabel")}</p>
          <CopyText text={MCP_URL} copyLabel={t("copy")} copiedLabel={t("copied")} />
        </div>

        {/* Steps */}
        <section className="bg-gradient-to-br from-blue-900/40 to-purple-900/20 border border-blue-700/40 rounded-2xl p-7 mb-6">
          <h2 className="text-xl font-bold mb-6">{t("stepsTitle")}</h2>
          <ol className="grid md:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <li key={i} className="bg-[#0d1426]/80 border border-gray-800 rounded-xl p-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm mb-3">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Other apps */}
        <section className="bg-[#0d1426] border border-gray-800 rounded-2xl p-7 mb-16">
          <h2 className="text-lg font-bold mb-4">{t("otherTitle")}</h2>
          <p className="text-sm text-gray-400 mb-2">{t("otherClaudeCode")}</p>
          <div className="mb-5">
            <CopyText text={CLAUDE_CODE_CMD} copyLabel={t("copy")} copiedLabel={t("copied")} />
          </div>
          <p className="text-sm text-gray-400">{t("otherGeneric")}</p>
        </section>

        {/* What you can ask */}
        <h2 className="text-2xl font-extrabold mb-6">{t("whatTitle")}</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {groups.map((g) => (
            <section key={g.title} className="bg-[#0d1426] border border-gray-800 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{g.icon}</span>
                <h3 className="font-bold">{g.title}</h3>
              </div>
              <ul className="space-y-3 mb-5 flex-1">
                {g.items.map((item) => (
                  <li key={item.name}>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </li>
                ))}
              </ul>
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">{t("exampleLabel")}</p>
                <p className="text-sm text-blue-100 italic">“{g.example}”</p>
              </div>
            </section>
          ))}
        </div>

        {/* Explainer and notes */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <section className="bg-[#0d1426] border border-gray-800 rounded-2xl p-6">
            <h2 className="font-bold mb-3">{t("whatIsTitle")}</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{t("whatIsBody")}</p>
          </section>
          <section className="bg-[#0d1426] border border-gray-800 rounded-2xl p-6">
            <h2 className="font-bold mb-3">{t("notesTitle")}</h2>
            <ul className="space-y-2">
              {notes.map((n) => (
                <li key={n} className="text-sm text-gray-400 leading-relaxed flex gap-2">
                  <span className="text-blue-400 shrink-0">•</span>
                  {n}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="text-center">
          <Link href="/tools" className="text-blue-400 hover:text-blue-300 font-semibold text-sm transition">
            {t("ctaTools")}
          </Link>
        </p>
      </div>
    </main>
  );
}
