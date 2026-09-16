import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MOODS, formatDuration, formatEditionDate, type Edition, type Region } from "@/lib/observer";

// Neutral palette on purpose: an index falling is news, not a warning sign.
// Text codes rather than flag emoji: Windows renders flag emoji as bare letters.
const REGION_META: Record<Region, { name: string; code: string; accent: string }> = {
  US:   { name: "United States", code: "US", accent: "border-blue-500/40" },
  Euro: { name: "Euro area",     code: "EU", accent: "border-indigo-500/40" },
  Asia: { name: "Asia",          code: "AS", accent: "border-cyan-500/40" },
};

// The figures shown on each region card: [source, id].
const REGION_FIGURES: Record<Region, ["market" | "macro", string][]> = {
  US:   [["market", "^GSPC"], ["market", "^VIX"], ["macro", "DGS10"], ["macro", "CPIAUCSL"]],
  Euro: [["market", "^STOXX50E"], ["macro", "ECBDFR"], ["macro", "CP0000EZ19M086NEST"], ["market", "EURUSD=X"]],
  Asia: [["market", "^N225"], ["market", "^HSI"], ["market", "000001.SS"], ["market", "JPY=X"]],
};

const SHORT_LABELS: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^VIX": "VIX",
  DGS10: "US 10y yield",
  CPIAUCSL: "US inflation",
  "^STOXX50E": "Euro Stoxx 50",
  ECBDFR: "ECB rate",
  CP0000EZ19M086NEST: "Euro inflation",
  "EURUSD=X": "EUR/USD",
  "^N225": "Nikkei 225",
  "^HSI": "Hang Seng",
  "000001.SS": "Shanghai",
  "JPY=X": "USD/JPY",
};

function fmt(n: number, dp = 2) {
  return n.toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

// Big index levels read better without decimals; FX, yields and the VIX need them.
function priceDecimals(n: number) {
  return n >= 1000 ? 0 : 2;
}

function Change({ value, suffix = "%" }: { value: number | null; suffix?: string }) {
  if (value == null) return <span className="text-gray-600">—</span>;
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "•";
  return (
    <span className="text-gray-300 tabular-nums whitespace-nowrap">
      <span className="text-[10px] text-gray-500 mr-1">{arrow}</span>
      {value > 0 ? "+" : ""}
      {fmt(value)}
      {suffix}
    </span>
  );
}

function RegionFigure({ edition, kind, id }: { edition: Edition; kind: "market" | "macro"; id: string }) {
  const label = SHORT_LABELS[id] ?? id;
  if (kind === "market") {
    const m = edition.data.markets.find((x) => x.symbol === id);
    if (!m) return null;
    return (
      <div>
        <p className="text-gray-500 text-[11px] uppercase tracking-wider">{label}</p>
        <p className="text-white font-bold text-lg tabular-nums">{fmt(m.close, priceDecimals(m.close))}</p>
        <p className="text-xs"><Change value={m.change1w} /> <span className="text-gray-600">1w</span></p>
      </div>
    );
  }
  const all = Object.values(edition.data.macro).flat();
  const m = all.find((x) => x.id === id);
  if (!m) return null;
  return (
    <div>
      <p className="text-gray-500 text-[11px] uppercase tracking-wider">{label}</p>
      <p className="text-white font-bold text-lg tabular-nums">{fmt(m.value)}{m.unit === "%" ? "%" : ""}</p>
      <p className="text-xs text-gray-600">
        {m.prior ? <>was {fmt(m.prior.value)}{m.unit === "%" ? "%" : ""}</> : m.date}
      </p>
    </div>
  );
}

function MoodMeter({ edition }: { edition: Edition }) {
  const active = MOODS.indexOf(edition.mood.label);
  const fg = edition.data.fearAndGreed;
  return (
    <section className="bg-[#0d1426] border border-gray-800 rounded-2xl p-6">
      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Market mood</p>
      <div className="grid grid-cols-5 gap-1.5 mb-2" role="img" aria-label={`Market mood: ${edition.mood.label}`}>
        {MOODS.map((m, i) => (
          <div
            key={m}
            className={`h-2.5 rounded-full ${i === active ? "bg-blue-400" : "bg-gray-800"}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-gray-500 mb-4">
        <span>Risk-off</span>
        <span>Risk-on</span>
      </div>
      <p className="text-white text-2xl font-bold mb-2">{edition.mood.label}</p>
      <p className="text-gray-400 text-sm leading-relaxed">{edition.mood.explanation}</p>

      {fg && (
        <div className="mt-6 pt-5 border-t border-gray-800">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-gray-400 text-xs">CNN Fear &amp; Greed index</p>
            <p className="text-white font-bold tabular-nums">
              {fg.score} <span className="text-gray-500 text-xs font-normal capitalize">{fg.rating}</span>
            </p>
          </div>
          <div className="relative h-2 rounded-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500">
            <div
              className="absolute -top-1 w-1 h-4 rounded bg-blue-400"
              style={{ left: `calc(${Math.min(100, Math.max(0, fg.score))}% - 2px)` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-500 mt-1.5">
            <span>Extreme fear</span>
            <span>Extreme greed</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            A week ago: {fg.previousWeek} · a month ago: {fg.previousMonth}
          </p>
        </div>
      )}
    </section>
  );
}

function MarketTable({ edition }: { edition: Edition }) {
  const groups: (Region | "Global")[] = ["US", "Euro", "Asia", "Global"];
  const groupName = { US: "United States", Euro: "Europe", Asia: "Asia", Global: "Commodities & crypto" };
  return (
    <section className="bg-[#0d1426] border border-gray-800 rounded-2xl p-6">
      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Markets this week</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs text-right">
              <th className="text-left font-normal pb-2">Market</th>
              <th className="font-normal pb-2">Last</th>
              <th className="font-normal pb-2">1 week</th>
              <th className="font-normal pb-2">1 month</th>
            </tr>
          </thead>
          {groups.map((g) => {
            const rows = edition.data.markets.filter((m) => m.region === g);
            if (rows.length === 0) return null;
            return (
              <tbody key={g}>
                <tr>
                  <td colSpan={4} className="pt-4 pb-1 text-[11px] uppercase tracking-wider text-gray-500">
                    {groupName[g]}
                  </td>
                </tr>
                {rows.map((m) => (
                  <tr key={m.symbol} className="border-t border-gray-800/60 text-right">
                    <td className="text-left py-2 text-gray-200">{m.label}</td>
                    <td className="py-2 text-gray-300 tabular-nums">{fmt(m.close, priceDecimals(m.close))}</td>
                    <td className="py-2"><Change value={m.change1w} /></td>
                    <td className="py-2"><Change value={m.change1m} /></td>
                  </tr>
                ))}
              </tbody>
            );
          })}
        </table>
      </div>
      <p className="text-gray-600 text-xs mt-4">
        Changes are percentage moves in the price or level, including for yields and the VIX.
      </p>
    </section>
  );
}

export default function ObserverEdition({ edition }: { edition: Edition }) {
  return (
    <article className="max-w-5xl mx-auto">
      <Link href="/observer" className="text-blue-400 text-sm hover:text-blue-300 transition mb-8 inline-block">
        ← All editions
      </Link>

      <header className="mb-10 max-w-3xl">
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
          The Observer · Week of {formatEditionDate(edition.date)}
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">{edition.title}</h1>
        <p className="text-gray-400 text-lg leading-relaxed">{edition.dek}</p>

        {edition.audio && (
          <div className="mt-6 bg-[#0d1426] border border-gray-800 rounded-2xl p-4">
            <p className="flex items-center gap-2 text-sm text-gray-300 font-semibold mb-3">
              <span aria-hidden>🎧</span> Listen to this edition
              <span className="text-gray-500 font-normal">· {formatDuration(edition.audio.durationSeconds)}</span>
            </p>
            <audio controls preload="none" src={edition.audio.url} className="w-full">
              <a href={edition.audio.url}>Download the audio</a>
            </audio>
          </div>
        )}
      </header>

      {/* Region cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {edition.regions.map((r) => (
          <section key={r.region} className={`bg-[#0d1426] border ${REGION_META[r.region].accent} rounded-2xl p-5`}>
            <p className="flex items-center gap-2 text-gray-400 text-xs font-semibold mb-2">
              <span className="text-[10px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded px-1.5 py-0.5">
                {REGION_META[r.region].code}
              </span>
              {REGION_META[r.region].name}
            </p>
            <h2 className="text-white font-bold leading-snug mb-2">{r.headline}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{r.summary}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              {REGION_FIGURES[r.region].map(([kind, id]) => (
                <RegionFigure key={id} edition={edition} kind={kind} id={id} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-14">
        <MoodMeter edition={edition} />
        <MarketTable edition={edition} />
      </div>

      {/* Article */}
      <div className="max-w-3xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-12 mb-4">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold text-white mt-8 mb-3">{children}</h3>,
            p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-5">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-5">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 text-gray-300 mb-5">{children}</ol>,
            strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-blue-500 pl-4 italic text-gray-400 mb-5">{children}</blockquote>
            ),
          }}
        >
          {edition.body}
        </ReactMarkdown>

        {edition.watchNextWeek.length > 0 && (
          <section className="mt-12 bg-blue-600/5 border border-blue-700/20 rounded-2xl p-6">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">On the calendar next week</p>
            <ul className="space-y-2">
              {edition.watchNextWeek.map((w) => (
                <li key={w} className="flex gap-2 text-gray-300 text-sm">
                  <span className="text-blue-400">→</span>
                  {w}
                </li>
              ))}
            </ul>
          </section>
        )}

        {edition.sources.length > 0 && (
          <section className="mt-12">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Sources</p>
            <ol className="space-y-1.5 text-sm list-decimal pl-5 text-gray-500">
              {edition.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-gray-400 hover:text-blue-300">
                    {s.title}
                  </a>{" "}
                  <span className="text-gray-600">— {s.publisher}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <p className="mt-12 pt-6 border-t border-gray-800 text-gray-600 text-xs leading-relaxed">
          {edition.audio && "The audio version is read by Kokoro, an open-source text-to-speech model. "}
          The Observer is written by an AI agent ({edition.meta.model}) from public data — FRED, Eurostat,
          Yahoo Finance, SEC EDGAR filings, CNN Fear &amp; Greed, Reddit and news headlines — and reviewed before it is published.
          Market data is as of {formatEditionDate(edition.date)}. It is general commentary, not investment advice
          or a recommendation to buy or sell anything.
        </p>
      </div>
    </article>
  );
}
