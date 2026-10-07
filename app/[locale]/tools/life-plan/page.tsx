import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import LifePlan from "@/components/LifePlan";
import RelatedTools from "@/components/RelatedTools";
import { decodeShared, examplePlan } from "@/lib/life-plan";

const BASE = "https://www.financeplots.com";
const PATH = "/tools/life-plan";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ p?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lifePlan" });
  const url = locale === "es" ? `${BASE}/es${PATH}` : `${BASE}${PATH}`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: url, languages: { en: `${BASE}${PATH}`, es: `${BASE}/es${PATH}` } },
    openGraph: { title: t("metaTitle"), description: t("metaDescription"), url, siteName: "FinancePlots", type: "website" },
  };
}

export default async function LifePlanPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { p } = await searchParams;
  const t = await getTranslations({ locale, namespace: "lifePlan" });
  const tc = await getTranslations({ locale, namespace: "toolCommon" });
  const startYear = new Date().getUTCFullYear();

  // ?p= is the page's own share link. Without it the page opens on an example
  // made of amounts only.
  const shared = decodeShared(p, startYear);

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Life Plan",
            description: "A household's savings, debts and net worth year by year, with life events on a timeline and two plans side by side.",
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
          <LifePlan initialPlans={shared?.plans ?? [examplePlan(startYear)]} initialHorizon={shared?.horizon ?? 30} startYear={startYear} />
        </div>
      </div>
      <RelatedTools current="life-plan" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
