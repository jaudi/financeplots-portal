// The measures a user can screen on. Shared by the server (which allowlists
// these fields out of the pipeline's JSON) and the client (which labels them),
// so the two can't disagree about what exists.
//
// Every entry is reported or market data. Nothing here is a score, a rank or a
// model's opinion of a company — keep it that way (UK MAR; see CLAUDE.md).
//
// Units follow the pipeline: "%" values are percentage points (roe 16.5 means
// 16.5%), "x" values are plain multiples, and the share price is in the
// currency the shares trade in.

export const METRIC_KEYS = [
  "per",
  "per_normalizado",
  "precio_valor_libros",
  "ev_ebit",
  "fcf_yield",
  "roe",
  "roa",
  "roic",
  "margen_operativo",
  "deuda_patrimonio",
  "deuda_neta_ebitda",
  "cobertura_intereses",
  "crecimiento_ingresos_normalizado",
  "crecimiento_beneficios_normalizado",
  "precio_actual",
  "retorno_6m",
  "retorno_12m",
  "distancia_ma200_pct",
  "rsi",
] as const;

export type MetricKey = (typeof METRIC_KEYS)[number];

export const METRIC_GROUPS = ["Valuation", "Profitability", "Debt", "Growth", "Price & trend"] as const;
export type MetricGroup = (typeof METRIC_GROUPS)[number];

export interface MetricDef {
  key: MetricKey;
  label: string;
  /** One plain-English sentence. Shown under the label, so no jargon. */
  help: string;
  unit: "%" | "x" | "";
  group: MetricGroup;
  /** Anchor on /glossary, where one exists. */
  glossary?: string;
}

export const METRICS: MetricDef[] = [
  { key: "per", label: "P/E ratio", unit: "x", group: "Valuation", glossary: "pe-ratio",
    help: "Share price divided by the last twelve months' earnings per share." },
  { key: "per_normalizado", label: "P/E on average earnings", unit: "x", group: "Valuation", glossary: "pe-ratio",
    help: "Share price divided by earnings averaged over the last few reported years." },
  { key: "precio_valor_libros", label: "Price / book", unit: "x", group: "Valuation",
    help: "Market value divided by the accounting value of shareholders' equity." },
  { key: "ev_ebit", label: "EV / EBIT", unit: "x", group: "Valuation", glossary: "ebit",
    help: "Company value including its debt, divided by operating profit." },
  { key: "fcf_yield", label: "Free cash flow yield", unit: "%", group: "Valuation", glossary: "free-cash-flow",
    help: "Cash left after running costs and investment, as a share of market value." },

  { key: "roe", label: "Return on equity", unit: "%", group: "Profitability", glossary: "roe",
    help: "Net profit as a percentage of the shareholders' money in the business." },
  { key: "roa", label: "Return on assets", unit: "%", group: "Profitability", glossary: "roa",
    help: "Net profit as a percentage of everything the company owns." },
  { key: "roic", label: "Return on invested capital", unit: "%", group: "Profitability",
    help: "Profit as a percentage of the money invested in the business, from lenders and owners." },
  { key: "margen_operativo", label: "Operating margin", unit: "%", group: "Profitability", glossary: "ebit",
    help: "Operating profit as a percentage of revenue." },

  { key: "deuda_patrimonio", label: "Debt / equity", unit: "%", group: "Debt", glossary: "debt-to-equity",
    help: "Total debt as a percentage of shareholders' equity." },
  { key: "deuda_neta_ebitda", label: "Net debt / EBITDA", unit: "x", group: "Debt", glossary: "ebitda",
    help: "Debt minus cash, divided by yearly operating earnings. Negative means more cash than debt." },
  { key: "cobertura_intereses", label: "Interest cover", unit: "x", group: "Debt",
    help: "How many times operating profit covers the interest bill." },

  { key: "crecimiento_ingresos_normalizado", label: "Revenue growth", unit: "%", group: "Growth",
    help: "Latest year's revenue compared with the average of the previous reported years." },
  { key: "crecimiento_beneficios_normalizado", label: "Earnings growth", unit: "%", group: "Growth",
    help: "Latest year's net profit compared with the average of the previous reported years." },

  { key: "precio_actual", label: "Share price", unit: "", group: "Price & trend",
    help: "Latest price, in the currency the shares trade in." },
  { key: "retorno_6m", label: "6-month return", unit: "%", group: "Price & trend", glossary: "momentum",
    help: "Change in the share price over the last six months." },
  { key: "retorno_12m", label: "12-month return", unit: "%", group: "Price & trend", glossary: "momentum",
    help: "Change in the share price over the last twelve months." },
  { key: "distancia_ma200_pct", label: "Price vs 200-day average", unit: "%", group: "Price & trend", glossary: "moving-average",
    help: "How far the price is above (+) or below (−) its average over the last 200 trading days." },
  { key: "rsi", label: "RSI (14-day)", unit: "", group: "Price & trend", glossary: "rsi",
    help: "A 0–100 gauge comparing recent price rises with recent falls." },
];
