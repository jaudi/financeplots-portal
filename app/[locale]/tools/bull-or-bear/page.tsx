import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { messagesMetadata } from "@/lib/page-metadata";
import BullOrBear from "@/components/BullOrBear";
import RelatedTools from "@/components/RelatedTools";
import { monthAt, upShare } from "@/lib/bull-or-bear";

// Bull or Bear? — a guessing game on the S&P 500's history. The game is the
// client component; the text under it is server-rendered so search engines
// see what the page is about.

export const generateMetadata = messagesMetadata("bull-or-bear", "/tools/bull-or-bear");

export default async function BullOrBearPage() {
  const t = await getTranslations("bullOrBear");
  const tc = await getTranslations("toolCommon");
  const year = monthAt(1).slice(0, 4); // data starts Dec 1927; call it 1928
  const pct = Math.round(upShare() * 100);

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoGame",
          "name": "Bull or Bear?",
          "description": "Guess whether the S&P 500 was higher or lower a year after a hidden stretch of its history since 1928.",
          "url": "https://www.financeplots.com/tools/bull-or-bear",
          "genre": "Educational",
          "gamePlatform": "Web browser",
          "applicationCategory": "Game",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
          "provider": { "@type": "Organization", "name": "FinancePlots", "url": "https://www.financeplots.com" },
        }) }}
      />
      <div className="fixed top-[65px] left-0 right-0 z-40 bg-[#0d1426]/95 backdrop-blur border-b border-gray-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3 min-w-0">
          <Link href="/tools/personal" className="text-gray-400 hover:text-white text-sm transition shrink-0 whitespace-nowrap">{tc("backPersonal")}</Link>
          <span className="text-gray-700 hidden sm:block">|</span>
          <h1 className="text-white font-bold text-sm sm:text-base truncate">{t("pageTitle")}</h1>
          <span className="text-gray-500 text-sm hidden md:block truncate">· {t("pageSubtitle")}</span>
        </div>
      </div>

      <div className="pt-[133px] pb-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <BullOrBear />

          <section className="mt-12 grid sm:grid-cols-2 gap-6 text-sm text-gray-400 leading-relaxed">
            <div>
              <h2 className="text-white font-bold text-base mb-3">{t("howTitle")}</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>{t("how1")}</li>
                <li>{t("how2")}</li>
                <li>{t("how3")}</li>
              </ol>
            </div>
            <div>
              <h2 className="text-white font-bold text-base mb-3">{t("aboutTitle")}</h2>
              <p>{t("aboutText", { year, pct })}</p>
            </div>
          </section>
          <p className="mt-8 text-xs text-gray-600">{t("source")}</p>
        </div>
      </div>

      <RelatedTools current="bull-or-bear" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
