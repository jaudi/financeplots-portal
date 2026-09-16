import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ObserverEdition from "@/components/ObserverEdition";
import { getEdition, listEditions } from "@/lib/observer";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return listEditions().flatMap((e) => [
    { locale: "en", slug: e.slug },
    { locale: "es", slug: e.slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const edition = getEdition(slug);
  if (!edition) return {};
  const url = `https://www.financeplots.com/observer/${slug}`;
  return {
    title: `${edition.title} — The Observer`,
    description: edition.dek,
    // Editions are English-only; the /es route renders the same page.
    alternates: { canonical: url },
    openGraph: {
      title: edition.title,
      description: edition.dek,
      url,
      siteName: "FinancePlots",
      type: "article",
      publishedTime: edition.date,
      images: [{ url: "https://www.financeplots.com/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: edition.title,
      description: edition.dek,
      images: ["https://www.financeplots.com/og-image.png"],
    },
  };
}

export default async function ObserverEditionPage({ params }: Props) {
  const { slug } = await params;
  const edition = getEdition(slug);
  if (!edition) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: edition.title,
    description: edition.dek,
    datePublished: edition.date,
    url: `https://www.financeplots.com/observer/${slug}`,
    image: "https://www.financeplots.com/og-image.png",
    author: { "@type": "Organization", name: "FinancePlots" },
    publisher: {
      "@type": "Organization",
      name: "FinancePlots",
      logo: { "@type": "ImageObject", url: "https://www.financeplots.com/logo-sm.png" },
    },
  };

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white pt-28 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ObserverEdition edition={edition} />
    </main>
  );
}
