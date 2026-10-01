"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TickerSearch from "@/components/TickerSearch";
import { tabHref, type StocksTab } from "@/components/StocksNav";

// The Stocks area's front door: one search box. One ticker opens its price
// history, several open the comparison; nothing is suggested before the
// visitor types (see TickerSearch).

export default function StocksHub() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const tickers = [...new Set(value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))];

  const open = (tab: StocksTab) => {
    if (tickers.length === 0) return;
    const locale = window.location.pathname.startsWith("/es/") ? "/es" : "";
    router.push(locale + tabHref(tab, tickers, null));
  };

  const button = "px-4 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="max-w-2xl mx-auto">
      <label htmlFor="stocks-search" className="block text-sm text-gray-300 mb-2">
        Type a company name or ticker. Add more, separated by commas, to compare them.
      </label>
      <TickerSearch
        id="stocks-search"
        multi
        value={value}
        onChange={setValue}
        onEnter={() => open(tickers.length > 1 ? "compare" : "analysis")}
        placeholder="e.g. Apple, or AAPL, MSFT"
        ariaLabel="Search stocks"
        className="w-full"
      />
      <div className="flex flex-wrap gap-2 mt-3">
        <button onClick={() => open("analysis")} disabled={tickers.length !== 1} className={`${button} bg-blue-600 hover:bg-blue-500 text-white`}>
          📈 Price history
        </button>
        <button onClick={() => open("compare")} disabled={tickers.length < 2} className={`${button} bg-[#111827] border border-gray-700 text-gray-200 hover:text-white`}>
          📉 Compare {tickers.length > 1 ? tickers.length : ""}
        </button>
        <button onClick={() => open("portfolio")} disabled={tickers.length === 0} className={`${button} bg-[#111827] border border-gray-700 text-gray-200 hover:text-white`}>
          📊 Analyse as a portfolio
        </button>
      </div>
      {tickers.length > 4 && (
        <p className="text-xs text-gray-500 mt-2">Compare shows the first four; a portfolio takes up to eight.</p>
      )}
      <p className="text-sm text-gray-400 mt-8 text-center">
        Don&apos;t have a company in mind?{" "}
        <Link href="/tools/stock-screener" className="text-blue-400 hover:text-blue-300 font-semibold">
          Filter the S&amp;P 500, Nasdaq-100 or IBEX 35 by measures you choose →
        </Link>
      </p>
    </div>
  );
}
