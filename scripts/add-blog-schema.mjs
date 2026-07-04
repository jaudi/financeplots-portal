import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const BLOG_DIR = "app/[locale]/blog";

const slugs = readdirSync(BLOG_DIR).filter((name) => {
  const p = join(BLOG_DIR, name);
  return statSync(p).isDirectory();
});

let changed = 0;
let skipped = 0;

for (const slug of slugs) {
  const file = join(BLOG_DIR, slug, "page.tsx");
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const alreadyHasCanonical = /alternates\s*:\s*\{[^}]*canonical/.test(src);
  const alreadyHasArticleJsonLd = src.includes('"@type": "Article"');

  if (alreadyHasCanonical && alreadyHasArticleJsonLd) {
    skipped++;
    continue;
  }

  const url = `https://www.financeplots.com/blog/${slug}`;

  const ogTitleMatch = src.match(/openGraph:\s*\{[\s\S]*?title:\s*"([^"]+)"/);
  const ogDescMatch = src.match(/openGraph:\s*\{[\s\S]*?description:\s*"([^"]+)"/);
  if (!ogTitleMatch || !ogDescMatch) {
    console.warn(`skip (no og): ${slug}`);
    skipped++;
    continue;
  }
  const title = ogTitleMatch[1];
  const description = ogDescMatch[1];

  if (!alreadyHasCanonical) {
    const twitterBlockRe = /(\n\s*twitter:\s*\{[\s\S]*?\},)(\s*\n\};)/;
    if (twitterBlockRe.test(src)) {
      src = src.replace(
        twitterBlockRe,
        `$1\n  alternates: {\n    canonical: "${url}",\n  },$2`
      );
    }
  }

  if (!alreadyHasArticleJsonLd) {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      url,
      image: "https://www.financeplots.com/og-image.png",
      author: { "@type": "Organization", name: "FinancePlots" },
      publisher: {
        "@type": "Organization",
        name: "FinancePlots",
        logo: { "@type": "ImageObject", url: "https://www.financeplots.com/logo-sm.png" },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    };
    const script = `      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(
      JSON.stringify(jsonLd)
    )} }} />\n`;

    const mainOpenRe = /(<main[^>]*>\s*\n)(\s*<BlogArticleShell>)/;
    if (mainOpenRe.test(src)) {
      src = src.replace(mainOpenRe, `$1${script}$2`);
    } else {
      console.warn(`skip (no main+shell): ${slug}`);
      skipped++;
      continue;
    }
  }

  writeFileSync(file, src);
  changed++;
  console.log(`ok: ${slug}`);
}

console.log(`\nchanged: ${changed}, skipped: ${skipped}`);
