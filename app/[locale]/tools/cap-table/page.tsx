import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import CapTable from "@/components/CapTable";
import RelatedTools from "@/components/RelatedTools";
import { pageMetadata } from "@/lib/page-metadata";

const BASE = "https://www.financeplots.com";
const PATH = "/tools/cap-table";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "capTable" });
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription"), path: PATH, locale, localized: true });
}

export default async function CapTablePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "capTable" });
  const tc = await getTranslations({ locale, namespace: "toolCommon" });

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Cap Table & Dilution Calculator",
            description: "Model ownership before and after a priced round: SAFE conversions, the new investors' shares and an option-pool top-up.",
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
          <Link href="/tools/business" className="text-gray-400 hover:text-white text-sm transition">{tc("backBusiness")}</Link>
          <div className="text-center mt-4 mb-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">{t("eyebrow")}</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{t("title")}</h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">{t("intro")}</p>
          </div>
          <CapTable />
        </div>
      </div>
      <RelatedTools current="cap-table" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
