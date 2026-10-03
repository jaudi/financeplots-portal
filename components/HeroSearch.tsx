"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import TickerSearch from "@/components/TickerSearch";

// The homepage's search box: a company name or ticker opens its company page.
// Like every stock search on the site, it suggests nothing until the visitor
// types (UK MAR, CLAUDE.md) — so no example tickers in the placeholder either.

export default function HeroSearch({ label, placeholder, cta }: { label: string; placeholder: string; cta: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const go = (ticker = value) => {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    const prefix = window.location.pathname.startsWith("/es") ? "/es" : "";
    router.push(`${prefix}/tools/stocks/${encodeURIComponent(t)}`);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
      className="w-full max-w-xl"
    >
      <label htmlFor="hero-search" className="block text-sm text-gray-400 mb-2">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <TickerSearch
          id="hero-search"
          value={value}
          onChange={setValue}
          onPick={(symbol) => go(symbol)}
          onEnter={() => go()}
          placeholder={placeholder}
          ariaLabel={label}
          className="py-3! text-base! rounded-xl!"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-600/25 whitespace-nowrap"
        >
          {cta}
        </button>
      </div>
    </form>
  );
}
