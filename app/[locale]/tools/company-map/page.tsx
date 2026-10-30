import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import CompanyMap from "@/components/CompanyMap";
import RelatedTools from "@/components/RelatedTools";
import StocksNav from "@/components/StocksNav";
import { getCompanyMapData } from "@/lib/company-map";

// Where the companies of the S&P 500, Nasdaq-100, FTSE 100 and IBEX 35 have
// their headquarters. Every company in the chosen index, one dot each, same
// size and colour — a map of who and where, never of how a company is doing
// (UK MAR, CLAUDE.md). The list under the map is server-rendered: it is what
// search engines read, and the way in on a small phone.

const BASE = "https://www.financeplots.com";
const PATH = "/tools/company-map";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "companyMap" });
  const url = locale === "es" ? `${BASE}/es${PATH}` : `${BASE}${PATH}`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: url, languages: { en: `${BASE}${PATH}`, es: `${BASE}/es${PATH}` } },
    openGraph: { title: t("metaTitle"), description: t("metaDescription"), url, siteName: "FinancePlots", type: "website" },
  };
}

export default async function CompanyMapPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "companyMap" });
  const tc = await getTranslations({ locale, namespace: "toolCommon" });
  const data = await getCompanyMapData();
  const asOf = data.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: t("title"),
            description: t("metaDescription"),
            url: locale === "es" ? `${BASE}/es${PATH}` : `${BASE}${PATH}`,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
            provider: { "@type": "Organization", name: "FinancePlots", url: BASE },
          }),
        }}
      />
      <div className="pt-[100px] pb-16 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <StocksNav current="hub" />
          <Link href="/tools/stocks" className="text-gray-400 hover:text-white text-sm transition">{t("back")}</Link>
          <div className="mt-4 mb-6">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">{t("eyebrow")}</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{t("title")}</h1>
            <p className="text-gray-400 text-sm max-w-3xl leading-relaxed">{t("intro")}</p>
          </div>

          <CompanyMap data={data} />

          <p className="text-xs text-gray-500 mt-8 max-w-3xl leading-relaxed">
            {t("sources")}
            {asOf && <> {t("dataAsOf", { date: asOf })}</>}
          </p>

          <div className="mt-8 bg-amber-500/5 border border-amber-500/30 rounded-xl px-5 py-4 max-w-3xl">
            <p className="text-amber-300 text-sm font-bold mb-1">⚠️ {tc("screenerDisclaimerTitle")}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{tc("screenerDisclaimer")}</p>
          </div>
        </div>
      </div>
      <RelatedTools current="company-map" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
