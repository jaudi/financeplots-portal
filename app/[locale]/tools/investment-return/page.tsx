import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import InvestmentReturn from "@/components/InvestmentReturn";
import RelatedTools from "@/components/RelatedTools";
import { decodeFlows, isIsoDate, type DatedFlow } from "@/lib/investment-return";
import { normaliseSymbol } from "@/lib/price-types";

const BASE = "https://www.financeplots.com";
const PATH = "/tools/investment-return";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ f?: string; v?: string; on?: string; vs?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "investmentReturn" });
  const url = locale === "es" ? `${BASE}/es${PATH}` : `${BASE}${PATH}`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: url, languages: { en: `${BASE}${PATH}`, es: `${BASE}/es${PATH}` } },
    openGraph: { title: t("metaTitle"), description: t("metaDescription"), url, siteName: "FinancePlots", type: "website" },
  };
}

// An example to show how the page reads, used only when the link carries no
// figures of its own. Amounts of money, not securities: nothing is suggested.
const EXAMPLE: DatedFlow[] = [
  { date: "2021-02-01", amount: 5000 },
  { date: "2022-02-01", amount: 3000 },
  { date: "2023-09-15", amount: -1500 },
  { date: "2024-06-01", amount: 4000 },
];
const EXAMPLE_VALUE = 12_900;

export default async function InvestmentReturnPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { f, v, on, vs } = await searchParams;
  const t = await getTranslations({ locale, namespace: "investmentReturn" });
  const tc = await getTranslations({ locale, namespace: "toolCommon" });
  const today = new Date().toISOString().slice(0, 10);

  // ?f=…&v=…&on=…&vs=… come from the page's own share link and the MCP tool's tool_page.
  const shared = decodeFlows(f);
  const value = Number(v);
  const initialFlows = shared.length ? shared : EXAMPLE;
  const initialValue = shared.length ? (v !== undefined && Number.isFinite(value) && value >= 0 ? value : null) : EXAMPLE_VALUE;
  const initialValueDate = on && isIsoDate(on) && on <= today ? on : today;
  const initialCompare = vs ? normaliseSymbol(vs) : null;

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Investment Return (XIRR) Calculator",
            description: "The real annual return (XIRR) on an investment with money paid in and taken out on different dates, with the same money replayed in an index you choose.",
            url: `${BASE}${PATH}`,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
            provider: { "@type": "Organization", name: "FinancePlots", url: BASE },
          }),
        }}
      />

      <div className="pt-[100px] pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link href="/tools/personal" className="text-gray-400 hover:text-white text-sm transition">{tc("backPersonal")}</Link>
          <div className="text-center mt-4 mb-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">{t("eyebrow")}</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{t("title")}</h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">{t("intro")}</p>
          </div>
          <InvestmentReturn
            initialFlows={initialFlows}
            initialValue={initialValue}
            initialValueDate={initialValueDate}
            initialCompare={initialCompare}
            today={today}
          />
        </div>
      </div>
      <RelatedTools current="investment-return" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
