"use client";

import { useEffect, useState } from "react";
import type { PerformanceData, ScreenerPerformance as Perf } from "@/lib/screener";

/** Below this, the numbers are noise and the component says so instead of
 *  letting a reader draw a conclusion from three weeks and six names. */
const SEMANAS_MINIMAS_PARA_CREER = 26;

function pct(value: number | null | undefined, sign = true) {
  if (value === null || value === undefined) return "—";
  const s = sign && value > 0 ? "+" : "";
  return `${s}${value.toFixed(2)}%`;
}

function toneFor(value: number | null | undefined) {
  if (value === null || value === undefined) return "text-gray-500";
  return value >= 0 ? "text-emerald-400" : "text-red-400";
}

export default function ScreenerPerformance({ screenerKey }: { screenerKey: string }) {
  const [perf, setPerf] = useState<Perf | null>(null);
  const [method, setMethod] = useState<PerformanceData["method"] | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "absent">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/performance");
        if (!res.ok) throw new Error(String(res.status));
        const json: PerformanceData = await res.json();
        if (cancelled) return;
        const entry = json.screeners?.[screenerKey];
        if (!entry) {
          setState("absent");
          return;
        }
        setPerf(entry);
        setMethod(json.method);
        setState("ready");
      } catch {
        // No measurement yet is a normal state, not an error worth showing.
        if (!cancelled) setState("absent");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [screenerKey]);

  if (state !== "ready" || !perf) return null;

  const young = perf.weeks_of_history < SEMANAS_MINIMAS_PARA_CREER;

  return (
    <div className="mt-10">
      <div className="text-center mb-8">
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Did it work?</p>
        <h3 className="text-2xl font-extrabold text-white mb-2">Track record</h3>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          Every name this screen has ever picked, priced from the run that first picked it, against the{" "}
          {perf.benchmark} over the same window. Most screeners never show you this.
        </p>
      </div>

      {young && (
        <div className="max-w-2xl mx-auto mb-8 bg-amber-500/5 border border-amber-500/30 rounded-xl px-5 py-4">
          <p className="text-amber-300 text-sm font-bold mb-1">⚠️ Too early to mean anything</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            {perf.weeks_of_history} weeks of history and {perf.n_positions}{" "}
            {perf.n_positions === 1 ? "position" : "positions"}. That is noise, not evidence — a run of
            this length says nothing about whether the screen works. It is published anyway because
            starting the clock in public is the only way to ever have an answer.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
        <div className="bg-[#0d1426] border border-gray-800 rounded-xl px-5 py-4 text-center">
          <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Screen</div>
          <div className={`text-2xl font-extrabold ${toneFor(perf.portfolio_return_pct)}`}>
            {pct(perf.portfolio_return_pct)}
          </div>
        </div>
        <div className="bg-[#0d1426] border border-gray-800 rounded-xl px-5 py-4 text-center">
          <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">{perf.benchmark}</div>
          <div className={`text-2xl font-extrabold ${toneFor(perf.benchmark_return_pct)}`}>
            {pct(perf.benchmark_return_pct)}
          </div>
        </div>
        <div className="bg-[#0d1426] border border-gray-800 rounded-xl px-5 py-4 text-center">
          <div
            className="text-gray-500 text-xs uppercase tracking-wide mb-1 cursor-help"
            title="Screen minus benchmark. This is the only number that matters: beating the index is the whole point of picking stocks at all."
          >
            Difference
          </div>
          <div className={`text-2xl font-extrabold ${toneFor(perf.alpha_pp)}`}>
            {perf.alpha_pp === null ? "—" : `${perf.alpha_pp > 0 ? "+" : ""}${perf.alpha_pp.toFixed(2)} pp`}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mb-6 bg-[#0d1426] border border-gray-800 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Ticker</th>
              <th className="text-left px-4 py-3">First picked</th>
              <th className="text-right px-4 py-3">Entry</th>
              <th className="text-right px-4 py-3">Now</th>
              <th className="text-right px-4 py-3">Return</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {perf.positions.map((p) => (
              <tr key={p.ticker} className="border-b border-gray-800/60 last:border-0">
                <td className="px-4 py-3 font-mono text-blue-300">{p.ticker}</td>
                <td className="px-4 py-3 text-gray-400">{p.entry_date}</td>
                <td className="px-4 py-3 text-right text-gray-300">{p.entry_price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {p.current_price === null ? "—" : p.current_price.toFixed(2)}
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${toneFor(p.return_pct)}`}>
                  {pct(p.return_pct)}
                </td>
                <td className="px-4 py-3">
                  {p.still_passing ? (
                    <span className="text-emerald-400/70 text-xs">still passing</span>
                  ) : (
                    <span
                      className="text-gray-500 text-xs cursor-help"
                      title="This name no longer passes the filter. It is still held here because the screen has no sell rule — see the note below."
                    >
                      dropped out
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {method && (
        <div className="bg-[#0d1426]/60 border border-gray-800 rounded-xl px-5 py-4 text-xs text-gray-500 leading-relaxed">
          <p className="mb-2">
            <span className="text-gray-400 font-semibold">Entry.</span> {method.entry}
          </p>
          <p className="mb-2">
            <span className="text-gray-400 font-semibold">Holding.</span> {method.holding}
          </p>
          <p className="mb-2">
            <span className="text-gray-400 font-semibold">Benchmark.</span> {method.benchmark}
          </p>
          <p>
            <span className="text-gray-400 font-semibold">Not included.</span> {method.costs}
          </p>
        </div>
      )}
    </div>
  );
}
