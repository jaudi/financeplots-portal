import { METRIC_KEYS, type MetricKey } from "@/lib/stock-metrics";

// The pipeline's universe files carry every company in the index. This module
// passes on only reported and market data — never a composite score, factor
// percentile or valuation output, and never the pipeline's ordering — so the
// stock screener can only ever show what the user asked for. The fields are an
// allowlist on purpose: a new field the pipeline starts writing stays off the
// site until someone decides it is data rather than an opinion.

export const UNIVERSE_SCREENS = ["sp500", "nasdaq100", "ibex35"] as const;
export type UniverseScreen = (typeof UNIVERSE_SCREENS)[number];

export type UniverseCompany = {
  ticker: string;
  nombre: string;
  sector: string | null;
} & Record<MetricKey, number | null>;

export interface UniverseData {
  generated_at: string | null;
  screen: UniverseScreen;
  count: number;
  companies: UniverseCompany[];
}

// The pipeline writes weekly. Revalidating hourly, with the hour in the URL as
// the cache key, means a new run surfaces within the hour even though Vercel's
// Data Cache survives redeploys.
const REVALIDATE_SECONDS = 3600;

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function getUniverse(screen: UniverseScreen): Promise<UniverseData | null> {
  const hourBucket = Math.floor(Date.now() / (REVALIDATE_SECONDS * 1000));
  const path = `data/universe-${screen}.json`;

  // The data repo is private. With SCREENER_REPO_TOKEN — a fine-grained,
  // read-only token for that one repo — the file comes through the GitHub API.
  // Without it, the public raw URL, which only works while the repo is public.
  const token = process.env.SCREENER_REPO_TOKEN;
  const url = token
    ? `https://api.github.com/repos/jaudi/sp500-quality-screener/contents/${path}?ref=main&h=${hourBucket}`
    : `https://raw.githubusercontent.com/jaudi/sp500-quality-screener/refs/heads/main/${path}?h=${hourBucket}`;
  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.raw+json", "X-GitHub-Api-Version": "2022-11-28" }
    : {};

  try {
    const res = await fetch(url, { headers, next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const raw = (await res.json()) as { generated_at?: string; companies?: Record<string, unknown>[] };

    const companies = (raw.companies ?? [])
      .filter((c) => typeof c.ticker === "string")
      .map((c) => {
        const row = {
          ticker: c.ticker as string,
          nombre: typeof c.nombre === "string" ? c.nombre : (c.ticker as string),
          sector: typeof c.sector === "string" ? c.sector : null,
        } as UniverseCompany;
        for (const key of METRIC_KEYS) row[key] = numberOrNull(c[key]);
        return row;
      })
      .sort((a, b) => a.ticker.localeCompare(b.ticker));

    return { generated_at: raw.generated_at ?? null, screen, count: companies.length, companies };
  } catch {
    return null;
  }
}
