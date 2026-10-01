"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import TickerSearch from "@/components/TickerSearch";
import { MAX_VS } from "@/lib/stock-metrics";

// Picks the companies a company page is compared with (?vs=MSFT,GOOGL). The
// visitor types every one — nothing is proposed — and they stay in that order.

export default function CompareWith({ ticker, vs }: { ticker: string; vs: string[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const go = (next: string[]) => {
    const clean = [...new Set(next.map((t) => t.trim().toUpperCase()).filter((t) => t && t !== ticker))].slice(0, MAX_VS);
    const path = window.location.pathname;
    router.push(clean.length ? `${path}?vs=${clean.map(encodeURIComponent).join(",")}` : path, { scroll: false });
  };

  const add = () => {
    go([...vs, ...value.split(",")]);
    setValue("");
  };

  return (
    <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-5">
      <label htmlFor="compare-with" className="block text-sm font-semibold text-white mb-1">Compare {ticker}&apos;s figures with…</label>
      <p className="text-xs text-gray-500 mb-3">Up to {MAX_VS} more companies from the S&amp;P 500, Nasdaq-100 or IBEX 35, side by side.</p>
      {vs.length < MAX_VS && (
        <div className="flex gap-2">
          <TickerSearch
            id="compare-with"
            multi
            value={value}
            onChange={setValue}
            onPick={(_, next) => setValue(next)}
            onEnter={add}
            placeholder="Company name or ticker"
            className="flex-1"
          />
          <button onClick={add} disabled={!value.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
            Add
          </button>
        </div>
      )}
      {vs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {vs.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 bg-[#111827] border border-gray-700 rounded-lg pl-3 pr-1 py-1 text-sm font-mono text-gray-200">
              {t}
              <button onClick={() => go(vs.filter((x) => x !== t))} aria-label={`Stop comparing with ${t}`} className="text-gray-500 hover:text-white px-1.5">×</button>
            </span>
          ))}
          <button onClick={() => go([])} className="text-xs text-gray-500 hover:text-white ml-1 transition">Clear</button>
        </div>
      )}
    </div>
  );
}
