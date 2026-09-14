import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// The three index screener pages published curated lists of named securities
// and were removed for UK MAR reasons (2026-09-14). They were in the sitemap, so
// they send people to the neutral stock screener with that index preselected —
// the same subject, where the user sets the criteria. Nothing is shown there
// until the user runs a screen.
const RETIRED_SCREENERS: [string, string][] = [
  ["quality-screener", "sp500"],
  ["quality-screener-ibex35", "ibex35"],
  ["growth-screener-nasdaq100", "nasdaq100"],
];

const nextConfig: NextConfig = {
  turbopack: {},
  // /tools/etf-screener was in the sitemap, so it has been crawled and may be
  // bookmarked. It now 404s. Sending it to the tools hub rather than to the
  // stock screener is deliberate: an equity screen is not what someone
  // searching for a low-cost UCITS ETF ranking wants, and Google treats a
  // redirect to an unrelated page as a soft 404 anyway.
  async redirects() {
    return [
      { source: "/tools/etf-screener", destination: "/tools", permanent: true },
      { source: "/es/tools/etf-screener", destination: "/es/tools", permanent: true },
      // Deleted 2026-09-14: the article quoted model valuations for named
      // companies (UK MAR). It was in the sitemap, so send readers to the blog.
      { source: "/blog/reverse-dcf-what-the-price-assumes", destination: "/blog", permanent: true },
      { source: "/es/blog/reverse-dcf-what-the-price-assumes", destination: "/es/blog", permanent: true },
      ...RETIRED_SCREENERS.flatMap(([slug, index]) => [
        { source: `/tools/${slug}`, destination: `/tools/stock-screener?index=${index}`, permanent: true },
        { source: `/es/tools/${slug}`, destination: `/es/tools/stock-screener?index=${index}`, permanent: true },
      ]),
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const existing = Array.isArray(config.externals) ? config.externals : [];
      config.externals = [...existing, "@react-pdf/renderer"];
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
