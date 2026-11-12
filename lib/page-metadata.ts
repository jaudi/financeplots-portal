import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// One place that builds a page's <head>: title, description, canonical and the
// share cards (Open Graph for LinkedIn/WhatsApp/Facebook, Twitter for X).
//
// Why every page needs all of it: Next merges metadata one key deep, so a page
// that sets `openGraph` without `images` loses the root's image, and a page
// that sets no `twitter` keeps the root's generic "FinancePlots — Free FP&A
// Tools…" title on X. Before 2026-11-12 most tool links shared on X showed the
// site's title instead of the tool's, and pages with no metadata at all
// inherited the homepage's canonical URL.

export const BASE = "https://www.financeplots.com";
const IMAGE = { url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "FinancePlots" };

export interface PageMetaInput {
  title: string;
  description: string;
  /** Path without locale, e.g. "/tools/lending". */
  path: string;
  locale?: string;
  /** The page exists in English and Spanish (/es/…). English-only pages
   *  always point at the English URL. */
  localized?: boolean;
  /** false for pages that must not claim a canonical (noindex pages). */
  canonical?: boolean;
  robots?: Metadata["robots"];
}

export function pageMetadata({ title, description, path, locale = "en", localized = false, canonical = true, robots }: PageMetaInput): Metadata {
  const es = localized && locale === "es";
  const url = `${BASE}${es ? "/es" : ""}${path}`;
  return {
    title,
    description,
    ...(robots && { robots }),
    ...(canonical && {
      alternates: {
        canonical: url,
        ...(localized && { languages: { en: `${BASE}${path}`, es: `${BASE}/es${path}` } }),
      },
    }),
    openGraph: {
      type: "website",
      siteName: "FinancePlots",
      locale: es ? "es_ES" : "en_GB",
      url,
      title,
      description,
      images: [IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@financeplots",
      title,
      description,
      images: [IMAGE.url],
    },
  };
}

/** generateMetadata for a page whose copy is in the `pageMeta.<key>` message
 *  namespace and that exists in both languages. For "use client" pages, export
 *  it from a layout.tsx next to the page. */
export function messagesMetadata(key: string, path: string) {
  return async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "pageMeta" });
    return pageMetadata({ title: t(`${key}.title`), description: t(`${key}.description`), path, locale, localized: true });
  };
}
