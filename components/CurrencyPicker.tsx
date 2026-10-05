"use client";

import { useSyncExternalStore } from "react";
import { CURRENCIES, DEFAULT_CURRENCY, asCurrency, type Currency } from "@/lib/currency";

// The £ / $ / € choice, shared by every planning tool: picked once, it carries
// to the next tool (kept in this browser only, like My list). Pages that render
// before the browser has answered show the default, then switch.

const KEY = "financeplots:currency";
const EVENT = "financeplots:currency";

function read(): Currency {
  try {
    return asCurrency(window.localStorage.getItem(KEY));
  } catch {
    return DEFAULT_CURRENCY; // storage blocked (private window, site data off)
  }
}

function write(c: Currency) {
  try {
    window.localStorage.setItem(KEY, c);
  } catch {
    // storage blocked: the choice just won't carry to the next tool
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

/** Accepts any string, keeps only £, $ or €. Stable, so effects needn't list it. */
const setCurrency = (c: string) => write(asCurrency(c));

/** The visitor's currency, shared by every tool, and its setter. */
export function useCurrency(): [Currency, (c: string) => void] {
  return [useSyncExternalStore(subscribe, read, () => DEFAULT_CURRENCY), setCurrency];
}

/** `hideLabel`: the label is read out to screen readers only (e.g. in a tool's top bar). */
export default function CurrencyPicker({ label, hideLabel = false, className = "" }: { label: string; hideLabel?: boolean; className?: string }) {
  const [currency] = useCurrency();
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {!hideLabel && <span className="text-xs text-gray-400">{label}</span>}
      <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
        {CURRENCIES.map(c => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={currency === c}
            onClick={() => setCurrency(c)}
            className={`w-9 py-1.5 rounded-lg text-sm font-semibold transition ${currency === c ? "bg-blue-600 text-white" : "bg-[#111827] text-gray-400 border border-gray-700 hover:text-white"}`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
