"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { tabHref } from "@/components/StocksNav";

// "My list": tickers the visitor collects across the Stocks area, kept in this
// browser only (no account, nothing sent anywhere). The visitor adds every
// ticker themselves — the site never suggests or pre-fills one — and the list
// keeps the order they were added in.

const KEY = "financeplots:my-list";
const EVENT = "financeplots:my-list";
export const MY_LIST_MAX = 8;
const EMPTY: string[] = [];

let cache: { raw: string | null; list: string[] } = { raw: null, list: EMPTY };

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY; // storage blocked (private window, site data off)
  }
  if (raw === cache.raw) return cache.list; // same array while unchanged, as useSyncExternalStore needs
  let list: string[] = EMPTY;
  try {
    const parsed = JSON.parse(raw ?? "[]");
    if (Array.isArray(parsed)) list = parsed.filter((t): t is string => typeof t === "string").slice(0, MY_LIST_MAX);
  } catch {
    list = EMPTY;
  }
  cache = { raw, list };
  return list;
}

function write(list: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage blocked: the list just won't persist
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useMyList() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    list,
    has: (t: string) => list.includes(t),
    full: list.length >= MY_LIST_MAX,
    add: (t: string) => !list.includes(t) && list.length < MY_LIST_MAX && write([...list, t]),
    remove: (t: string) => write(list.filter((x) => x !== t)),
    clear: () => write([]),
  };
}

/** "＋ My list" / "✓ In my list" toggle for one ticker. */
export function AddToListButton({ ticker, compact = false }: { ticker: string; compact?: boolean }) {
  const { has, add, remove, full } = useMyList();
  const inList = has(ticker);
  const label = inList ? "✓ In my list" : full ? "My list is full" : "＋ My list";
  return (
    <button
      type="button"
      onClick={() => (inList ? remove(ticker) : add(ticker))}
      disabled={!inList && full}
      aria-pressed={inList}
      title={inList ? "Remove from my list" : `Add ${ticker} to my list`}
      className={`${compact ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"} rounded-lg font-semibold border transition disabled:opacity-40 ${
        inList ? "bg-blue-600/15 border-blue-500 text-white" : "bg-[#111827] border-gray-700 text-gray-200 hover:border-blue-500"
      }`}
    >
      {label}
    </button>
  );
}

/** The list itself, with what can be done with it. Renders nothing while empty. */
export function MyListPanel() {
  const { list, remove, clear } = useMyList();
  if (list.length === 0) return null;
  const locale = typeof window !== "undefined" && window.location.pathname.startsWith("/es/") ? "/es" : "";
  const [first, ...rest] = list;
  const action = "px-4 py-2 rounded-lg text-sm font-semibold transition";
  return (
    <section className="max-w-2xl mx-auto mt-8 bg-[#0d1426] border border-gray-800 rounded-2xl p-5" aria-label="My list">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white">My list <span className="text-gray-500 font-normal">· {list.length} of {MY_LIST_MAX}, saved in this browser</span></h2>
        <button onClick={clear} className="text-xs text-gray-500 hover:text-white transition">Clear</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {list.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 bg-[#111827] border border-gray-700 rounded-lg pl-3 pr-1 py-1 text-sm">
            <Link href={`${locale}/tools/stocks/${encodeURIComponent(t)}`} className="font-mono text-gray-200 hover:text-blue-300">{t}</Link>
            <button onClick={() => remove(t)} aria-label={`Remove ${t}`} className="text-gray-500 hover:text-white px-1.5">×</button>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {list.length > 1 && (
          <Link
            href={`${locale}/tools/stocks/${encodeURIComponent(first)}?vs=${rest.slice(0, 3).map(encodeURIComponent).join(",")}`}
            className={`${action} bg-blue-600 hover:bg-blue-500 text-white`}
          >
            Compare figures{list.length > 4 ? " (first 4)" : ""}
          </Link>
        )}
        {list.length > 1 && (
          <Link href={locale + tabHref("compare", list, null)} className={`${action} bg-[#111827] border border-gray-700 text-gray-200 hover:text-white`}>
            Compare prices
          </Link>
        )}
        <Link href={locale + tabHref("portfolio", list, null)} className={`${action} bg-[#111827] border border-gray-700 text-gray-200 hover:text-white`}>
          Analyse as a portfolio
        </Link>
      </div>
    </section>
  );
}
