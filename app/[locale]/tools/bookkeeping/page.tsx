import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { messagesMetadata } from "@/lib/page-metadata";
import BookkeepingPlayground from "@/components/BookkeepingPlayground";
import RelatedTools from "@/components/RelatedTools";

// Bookkeeping Playground — learn double entry by running a coffee cart for a
// month. The playground is a client component; the explainer under it is
// server-rendered so search engines see what the page teaches.

export const generateMetadata = messagesMetadata("bookkeeping", "/tools/bookkeeping");

export default async function BookkeepingPage() {
  const t = await getTranslations("bookkeeping");
  const tc = await getTranslations("toolCommon");
  const faqs = [1, 2, 3, 4] as const;

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Bookkeeping Playground",
              "description": "Learn double-entry bookkeeping by posting a coffee cart's first month and watching the T-accounts, trial balance, P&L and balance sheet update live.",
              "url": "https://www.financeplots.com/tools/bookkeeping",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
              "provider": { "@type": "Organization", "name": "FinancePlots", "url": "https://www.financeplots.com" },
            },
            {
              "@type": "FAQPage",
              "mainEntity": faqs.map((n) => ({
                "@type": "Question",
                "name": t(`faq${n}q`),
                "acceptedAnswer": { "@type": "Answer", "text": t(`faq${n}a`) },
              })),
            },
          ],
        }) }}
      />
      <div className="fixed top-[65px] left-0 right-0 z-40 bg-[#0d1426]/95 backdrop-blur border-b border-gray-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3 min-w-0">
          <Link href="/tools/business" className="text-gray-400 hover:text-white text-sm transition shrink-0 whitespace-nowrap">{tc("backBusiness")}</Link>
          <span className="text-gray-700 hidden sm:block">|</span>
          <h1 className="text-white font-bold text-sm sm:text-base truncate">{t("pageTitle")}</h1>
          <span className="text-gray-500 text-sm hidden md:block truncate">· {t("pageSubtitle")}</span>
        </div>
      </div>

      <div className="pt-[133px] pb-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-400 mb-6 max-w-3xl">{t("intro")}</p>
          <BookkeepingPlayground />

          <section className="mt-14 grid md:grid-cols-2 gap-x-10 gap-y-8 text-sm text-gray-400 leading-relaxed max-w-5xl">
            <div>
              <h2 className="text-white font-bold text-base mb-3">{t("howTitle")}</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>{t("how1")}</li>
                <li>{t("how2")}</li>
                <li>{t("how3")}</li>
              </ol>
            </div>
            {faqs.map((n) => (
              <div key={n}>
                <h2 className="text-white font-bold text-base mb-3">{t(`faq${n}q`)}</h2>
                <p>{t(`faq${n}a`)}</p>
              </div>
            ))}
          </section>
          <p className="mt-8 text-xs text-gray-600 max-w-3xl">{t("simplified")}</p>
        </div>
      </div>

      <RelatedTools current="bookkeeping" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
