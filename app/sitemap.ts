import { MetadataRoute } from "next";

const BASE = "https://www.financeplots.com";

const BLOG_SLUGS = [
  "5-year-financial-model",
  "annual-budget-guide",
  "bootstrapping-runway",
  "break-even-analysis-guide",
  "cash-flow-forecast-guide",
  "claude-products-guide",
  "control-is-the-whole-game",
  "dcf-valuation-guide",
  "finance-dashboard-problem",
  "financial-forecasting",
  "ifrs-ias-standards-guide",
  "investment-portfolio-analysis",
  "personal-budget-guide",
  "powerbi-vs-streamlit",
  "python-for-streamlit",
  "real-assets-balance-sheets-opportunities",
  "uk-pension-savings",
  "us-10y-yield-equity-risk-premium",
  "value-vs-growth-investing",
];

const TOOL_SLUGS = [
  "annual-budget",
  "break-even",
  "cash-flow",
  "compound-interest",
  "financial-model",
  "financial-planner",
  "financial-planner-company",
  "lending",
  "market-indices",
  "personal-budget",
  "pitch-deck",
  "portfolio-analysis",
  "quality-screener",
  "quality-screener-ibex35",
  "screen-recorder",
  "stock-analysis",
  "stock-comparison",
  "valuation",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${BASE}/tools`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${BASE}/blog`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE}/learn`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE}/learn/power-bi`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE}/learn/streamlit`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE}/learn/claude-finance`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE}/map`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE}/glossary`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${BASE}/quiz`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${BASE}/download`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE}/about`, priority: 0.6, changeFrequency: "yearly" as const },
    { url: `${BASE}/es`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${BASE}/es/tools`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE}/es/blog`, priority: 0.7, changeFrequency: "weekly" as const },
  ];

  const blogPages = BLOG_SLUGS.flatMap((slug) => [
    { url: `${BASE}/blog/${slug}`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE}/es/blog/${slug}`, priority: 0.6, changeFrequency: "monthly" as const },
  ]);

  const toolPages = TOOL_SLUGS.flatMap((slug) => [
    { url: `${BASE}/tools/${slug}`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE}/es/tools/${slug}`, priority: 0.7, changeFrequency: "monthly" as const },
  ]);

  return [
    ...staticPages,
    ...blogPages,
    ...toolPages,
  ].map((page) => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
