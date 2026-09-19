/**
 * The Observer — weekly macro editions written by the agent in scripts/observer/run.mjs
 * and committed as content/observer/<date>.json after review. Read at build time.
 */
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "content", "observer");

export type Region = "US" | "Euro" | "Asia";

export interface MarketPoint {
  symbol: string;
  label: string;
  region: Region | "Global";
  date: string;
  close: number;
  change1w: number | null;
  change1m: number | null;
}

export interface MacroPoint {
  id: string;
  label: string;
  unit: string;
  date: string;
  value: number;
  prior: { date: string; value: number } | null;
  stale: boolean;
}

export interface Edition {
  slug: string;
  date: string;
  title: string;
  dek: string;
  mood: { label: MoodLabel; explanation: string };
  regions: { region: Region; headline: string; summary: string }[];
  watchNextWeek: string[];
  body: string;
  sources: { title: string; publisher: string; url: string }[];
  data: {
    markets: MarketPoint[];
    macro: Record<Region, MacroPoint[]>;
    fearAndGreed: { score: number; rating: string; previousWeek: number; previousMonth: number; date: string } | null;
  };
  /** Kokoro read-aloud MP3, hosted as a GitHub Release asset. Absent if audio failed that week. */
  audio?: { url: string; durationSeconds: number };
  meta: { model: string; generatedAt: string };
}

export function formatDuration(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} min listen`;
}

export const MOODS = ["Risk-off", "Nervous", "Mixed", "Cautious optimism", "Risk-on"] as const;
export type MoodLabel = (typeof MOODS)[number];

export function listEditions(): Edition[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .reverse()
    .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Edition);
}

export function getEdition(slug: string): Edition | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slug)) return null;
  const file = path.join(DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as Edition;
}

export function formatEditionDate(date: string, locale = "en-GB"): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
