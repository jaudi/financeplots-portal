"use client";

import FactorSnowflake, { EJES } from "@/components/FactorSnowflake";
import type { FactorScores } from "@/lib/screener";

type Ganadora = {
  ticker: string;
  nombre?: string;
  sector?: string;
  score?: number | null;
  factores?: FactorScores;
  cobertura_pct?: number;
  beneficio_en_pico?: boolean | null;
  precio_actual?: number | null;
  ma50?: number | null;
  ma200?: number | null;
  retorno_12m?: number | null;
};

function tono(v: number | null | undefined) {
  if (v === null || v === undefined) return "text-gray-600";
  if (v >= 60) return "text-emerald-400";
  if (v >= 40) return "text-amber-400";
  return "text-red-400";
}

/** Where the price sits between its 200-day and 50-day averages, as a track with
 *  a marker. It answers "is this above or below its own trend, and by how much"
 *  without a price chart — the reports carry no price history, only these three
 *  numbers, and drawing a line through three points would be a chart that
 *  implies data it does not have. */
function BandaDeTendencia({ precio, ma50, ma200 }: { precio?: number | null; ma50?: number | null; ma200?: number | null }) {
  if (!precio || !ma50 || !ma200) return null;

  const bajo = Math.min(precio, ma50, ma200);
  const alto = Math.max(precio, ma50, ma200);
  const span = alto - bajo || 1;
  const pos = (v: number) => ((v - bajo) / span) * 100;

  const porEncima = precio > ma200;

  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] uppercase tracking-wide text-gray-600 mb-1.5">
        <span>Trend</span>
        <span className={porEncima ? "text-emerald-400/70" : "text-red-400/70"}>
          {porEncima ? "above" : "below"} 200-day
        </span>
      </div>
      <div className="relative h-1.5 bg-gray-800 rounded-full">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-gray-600 rounded"
          style={{ left: `${pos(ma200)}%` }}
          title={`200-day average: ${ma200.toFixed(2)}`}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-gray-500 rounded"
          style={{ left: `${pos(ma50)}%` }}
          title={`50-day average: ${ma50.toFixed(2)}`}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 -ml-1 rounded-full ${
            porEncima ? "bg-emerald-400" : "bg-red-400"
          }`}
          style={{ left: `${pos(precio)}%` }}
          title={`Price: ${precio.toFixed(2)}`}
        />
      </div>
      <div className="flex justify-between text-[9px] text-gray-600 mt-1">
        <span>{bajo.toFixed(0)}</span>
        <span>{alto.toFixed(0)}</span>
      </div>
    </div>
  );
}

/** The companies that made the report, shown as shapes before they are shown as
 *  a table. Rendered only when the pipeline supplied factor scores, so reports
 *  written before the multifactor engine simply skip it. */
export default function WinnerCards({ companies }: { companies: Ganadora[] }) {
  const conFactores = companies.filter((c) => c.factores && Object.keys(c.factores).length > 0);
  if (conFactores.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {conFactores.map((c, i) => (
          <div
            key={c.ticker}
            className="bg-[#0d1426] border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <FactorSnowflake factores={c.factores!} size={104} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-gray-600 text-xs font-mono">#{i + 1}</span>
                  <span className="font-mono font-bold text-blue-300">{c.ticker}</span>
                </div>
                <p className="text-white text-sm font-semibold truncate" title={c.nombre}>
                  {c.nombre}
                </p>
                <p className="text-gray-500 text-xs mb-2">{c.sector}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl font-extrabold ${tono(c.score)}`}>
                    {c.score === null || c.score === undefined ? "—" : c.score.toFixed(0)}
                  </span>
                  <span className="text-gray-600 text-xs">/ 100</span>
                </div>
                {c.beneficio_en_pico && (
                  <span
                    className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-300 bg-amber-400/10 border border-amber-400/25 rounded-full px-2 py-0.5 cursor-help"
                    title="Earnings are at a multi-year high. In a cyclical business the multiple looks cheapest at the top of the cycle."
                  >
                    peak earnings
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1 mt-4">
              {EJES.map((e) => {
                const v = c.factores?.[e.clave];
                return (
                  <div key={e.clave} className="text-center" title={e.ayuda}>
                    <div className={`text-sm font-bold ${tono(v)}`}>
                      {v === undefined ? "—" : v.toFixed(0)}
                    </div>
                    <div className="text-[9px] uppercase tracking-wide text-gray-600">{e.corta}</div>
                  </div>
                );
              })}
            </div>

            <BandaDeTendencia precio={c.precio_actual} ma50={c.ma50} ma200={c.ma200} />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-600 text-center mt-5">
        Each shape is the company&apos;s five factor scores. A score is a percentile rank within this
        index — 70 means higher than 70% of it, not &ldquo;good&rdquo;.
      </p>
    </div>
  );
}
