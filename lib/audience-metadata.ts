import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AUDIENCES, type Audience } from "@/lib/audiences";
import { pageMetadata } from "@/lib/page-metadata";

export async function audienceMetadata(audience: Audience, locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "audiences" });
  return pageMetadata({
    title: t(`${audience}.metaTitle`),
    description: t(`${audience}.metaDescription`),
    path: AUDIENCES[audience].href,
    locale,
    localized: true,
  });
}
