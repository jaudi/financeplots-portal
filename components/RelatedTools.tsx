import Link from "next/link";

const ALL_TOOLS: { slug: string; icon: string; name: string }[] = [
  { slug: "financial-planner",         icon: "🗺️", name: "Personal Financial Planner" },
  { slug: "financial-planner-company", icon: "🏢", name: "Financial Journey — Companies" },
  { slug: "break-even",                icon: "⚖️", name: "Break-Even Analysis" },
  { slug: "financial-model",           icon: "📈", name: "5-Year Financial Model" },
  { slug: "annual-budget",             icon: "💰", name: "Annual Budget" },
  { slug: "cash-flow",                 icon: "💧", name: "13-Week Cash Flow Forecast" },
  { slug: "valuation",                 icon: "🏢", name: "Business Valuation" },
  { slug: "lending",                   icon: "🏦", name: "Lending Calculator" },
  { slug: "personal-budget",           icon: "💸", name: "Personal Budget" },
  { slug: "compound-interest",         icon: "💹", name: "Compound Interest" },
  { slug: "portfolio-analysis",        icon: "📊", name: "Portfolio Analysis" },
  { slug: "stock-comparison",          icon: "📉", name: "Stock Comparison" },
  { slug: "stock-analysis",            icon: "📈", name: "Stock Analysis" },
  { slug: "market-indices",            icon: "🌐", name: "World Market Indices" },
  { slug: "quality-screener",          icon: "🏆", name: "S&P 500 Quality Screener" },
  { slug: "quality-screener-ibex35",   icon: "🇪🇸", name: "IBEX 35 Quality Screener" },
];

// Map each tool to 3 related slugs
const RELATED: Record<string, string[]> = {
  "financial-planner":         ["personal-budget", "compound-interest", "lending"],
  "financial-planner-company": ["break-even", "cash-flow", "valuation"],
  "break-even":                ["financial-model", "cash-flow", "financial-planner-company"],
  "financial-model":           ["break-even", "annual-budget", "valuation"],
  "annual-budget":             ["financial-model", "cash-flow", "personal-budget"],
  "cash-flow":                 ["annual-budget", "break-even", "financial-planner-company"],
  "valuation":                 ["financial-model", "break-even", "financial-planner-company"],
  "lending":                   ["financial-planner", "compound-interest", "personal-budget"],
  "personal-budget":           ["financial-planner", "compound-interest", "lending"],
  "compound-interest":         ["personal-budget", "lending", "portfolio-analysis"],
  "portfolio-analysis":        ["market-indices", "stock-comparison", "quality-screener"],
  "stock-comparison":          ["market-indices", "stock-analysis", "quality-screener"],
  "stock-analysis":            ["quality-screener", "stock-comparison", "portfolio-analysis"],
  "market-indices":            ["stock-comparison", "stock-analysis", "portfolio-analysis"],
  "quality-screener":          ["quality-screener-ibex35", "stock-analysis", "stock-comparison"],
  "quality-screener-ibex35":   ["quality-screener", "stock-analysis", "portfolio-analysis"],
};

export default function RelatedTools({ current }: { current: string }) {
  const slugs = RELATED[current] ?? [];
  const tools = slugs
    .map(s => ALL_TOOLS.find(t => t.slug === s))
    .filter(Boolean) as { slug: string; icon: string; name: string }[];

  if (tools.length === 0) return null;

  return (
    <section className="border-t border-gray-800 mt-12 pt-10 px-6 pb-16 max-w-5xl mx-auto">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-5">Also try</p>
      <div className="flex flex-wrap gap-3">
        {tools.map(tool => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="flex items-center gap-2 bg-[#0d1426] border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white px-5 py-3 rounded-xl text-sm font-semibold transition"
          >
            <span>{tool.icon}</span>
            <span>{tool.name}</span>
            <span className="text-gray-500 ml-1">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
