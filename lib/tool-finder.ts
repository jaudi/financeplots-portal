// The tool finder's goals (components/ToolFinderChat.tsx), kept apart so tests can check them.

export type Audience = "personal" | "business";

/** Words for the first question. Short answers like "para mí" count only on
 *  their own (`whole`), so "para mi empresa" still means a company. */
export const WHO: Record<Audience, { words: string[]; whole?: string[] }> = {
  personal: {
    words: ["myself", "personal", "particular", "individual", "family", "familia"],
    whole: ["me", "for me", "just me", "mine", "yo", "mi", "para mi", "solo yo", "para mi mismo", "para mi misma"],
  },
  business: { words: ["company", "business", "firm", "empresa", "negocio", "compania"] },
};

/** Each goal: its copy key in `toolFinder.goal`, the tool slug it leads to, and words to say or type. */
export const GOALS: Record<Audience, { key: string; slug: string; words: string[] }[]> = {
  personal: [
    { key: "takeHome", slug: "take-home-pay", words: ["earn", "salary", "take home", "tax", "salario", "sueldo", "cobro", "nomina", "impuestos"] },
    { key: "budget", slug: "personal-budget", words: ["budget", "spend", "spending", "presupuesto", "gastos", "gasto"] },
    { key: "savings", slug: "compound-interest", words: ["savings", "save", "grow", "interest", "ahorro", "ahorros", "interes", "crecer"] },
    { key: "realReturn", slug: "investment-return", words: ["xirr", "irr", "real return", "annual return", "returned", "tir", "rentabilidad real", "rentado", "rendido"] },
    { key: "loan", slug: "lending", words: ["loan", "mortgage", "debt", "prestamo", "hipoteca", "deuda"] },
    { key: "invest", slug: "stocks", words: ["shares", "stocks", "investments", "invest", "acciones", "invertir", "inversiones", "bolsa"] },
    { key: "plan", slug: "financial-planner", words: ["full plan", "everything", "whole", "plan completo", "todo"] },
  ],
  business: [
    { key: "year", slug: "annual-budget", words: ["budget", "year", "annual", "presupuesto", "anual"] },
    { key: "cash", slug: "cash-flow", words: ["cash", "weeks", "cash flow", "tesoreria", "caja", "semanas"] },
    { key: "breakEven", slug: "break-even", words: ["break even", "breakeven", "umbral", "rentabilidad", "punto muerto", "margin", "margen"] },
    { key: "forecast", slug: "financial-model", words: ["five years", "5 years", "forecast", "model", "cinco anos", "5 anos", "modelo", "proyeccion"] },
    { key: "worth", slug: "valuation", words: ["worth", "value", "valuation", "sell", "exit", "vale", "valor", "valoracion", "vender"] },
    { key: "whole", slug: "financial-planner-company", words: ["whole picture", "step by step", "everything", "paso a paso", "todo", "completo"] },
    { key: "raise", slug: "pitch-deck", words: ["raise", "investors", "pitch", "deck", "funding", "inversores", "financiacion", "ronda", "levantar"] },
    { key: "economy", slug: "macro-dashboard", words: ["economy", "inflation", "interest rates", "macro", "economia", "inflacion", "tipos"] },
    { key: "listed", slug: "stocks", words: ["listed", "shares", "stocks", "cotizadas", "acciones", "bolsa"] },
  ],
};
