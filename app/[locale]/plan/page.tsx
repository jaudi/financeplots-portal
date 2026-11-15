import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FinancialPlanReport from "@/components/FinancialPlanReport";

// The report behind the MCP tool financial_plan's `report_page` link. The plan
// is in ?p= (no database), so every URL is someone's own figures: never indexed,
// never in the sitemap, not a tool in the menus.

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ p?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "planReport" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function PlanPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { p } = await searchParams;
  const t = await getTranslations({ locale, namespace: "planReport" });
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="pt-[100px] pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">{t("eyebrow")}</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">{t("title")}</h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">{t("intro")}</p>
          </div>
          <FinancialPlanReport p={typeof p === "string" ? p : undefined} />
        </div>
      </div>
    </main>
  );
}
