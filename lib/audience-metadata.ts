import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AUDIENCES, type Audience } from "@/lib/audiences";

const BASE = "https://www.financeplots.com";

export async function audienceMetadata(audience: Audience, locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "audiences" });
  const path = AUDIENCES[audience].href;
  const url = locale === "es" ? `${BASE}/es${path}` : `${BASE}${path}`;
  const title = t(`${audience}.metaTitle`);
  const description = t(`${audience}.metaDescription`);
  return {
    title,
    description,
    alternates: { canonical: url, languages: { en: `${BASE}${path}`, es: `${BASE}/es${path}` } },
    openGraph: { title, description, url, siteName: "FinancePlots", type: "website" },
  };
}
