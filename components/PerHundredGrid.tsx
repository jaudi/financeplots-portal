import type { PerHundred } from "@/lib/salary-pages";

// "Of every £100 you earn": 100 squares, £1 each, kept first. Shared by the
// salary pages and their embeds. No hooks, so server pages can render it.
// Colours by position (the site's chart palette), never good/bad.

export const PART_COLOURS = ["#3b82f6", "#64748b", "#94a3b8"];

export function perHundredParts(h: PerHundred, short = false) {
  return [
    { label: "you keep", value: h.keep },
    { label: "income tax", value: h.incomeTax },
    { label: short ? "NI" : "National Insurance", value: h.ni },
  ];
}

export default function PerHundredGrid({ h, className = "" }: { h: PerHundred; className?: string }) {
  const squares = perHundredParts(h).flatMap((p, i) => Array<number>(p.value).fill(i));
  return (
    <div
      role="img"
      aria-label={`Of every £100: £${h.keep} you keep, £${h.incomeTax} income tax, £${h.ni} National Insurance`}
      className={`grid grid-cols-10 gap-[3px] ${className}`}
    >
      {squares.map((part, i) => (
        <div key={i} className="aspect-square rounded-[2px]" style={{ background: PART_COLOURS[part] }} />
      ))}
    </div>
  );
}

/** `big = false` is the compact version for embeds ("NI", smaller figures). */
export function PerHundredLegend({ h, big = true }: { h: PerHundred; big?: boolean }) {
  return (
    <ul className="space-y-1.5">
      {perHundredParts(h, !big).map((p, i) => (
        <li key={p.label} className="flex items-center gap-2.5 text-sm text-gray-300">
          <span className="w-3 h-3 rounded-[3px] shrink-0" style={{ background: PART_COLOURS[i] }} />
          <span className={`text-white font-bold ${big ? "text-lg w-12" : "text-base w-10"}`}>£{p.value}</span>
          {p.label}
        </li>
      ))}
    </ul>
  );
}
