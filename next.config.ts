import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {},
  // /tools/etf-screener was in the sitemap, so it has been crawled and may be
  // bookmarked. It now 404s. Sending it to the tools hub rather than to the
  // Nasdaq-100 screener is deliberate: a growth screen for US large-cap tech is
  // not what someone searching for a low-cost UCITS ETF ranking wants, and
  // Google treats a redirect to an unrelated page as a soft 404 anyway.
  async redirects() {
    return [
      { source: "/tools/etf-screener", destination: "/tools", permanent: true },
      { source: "/es/tools/etf-screener", destination: "/es/tools", permanent: true },
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
