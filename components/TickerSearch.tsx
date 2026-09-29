"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import type { SymbolMatch } from "@/lib/symbol-search";

/**
 * A ticker box that also finds companies by name (/api/symbols): type
 * "Inditex" and pick "ITX.MC". Suggests nothing until two characters are
 * typed; the order comes from the server (match quality, then alphabetical).
 *
 * With `multi`, the box holds a comma-separated list and searches only the
 * part after the last comma — picking replaces that part with the ticker.
 */
export default function TickerSearch({
  id,
  value,
  onChange,
  onPick,
  onEnter,
  placeholder,
  ariaLabel,
  multi = false,
  className = "",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Called after a pick, with the ticker and the box's new value. */
  onPick?: (symbol: string, value: string) => void;
  /** Enter with no suggestion list open. */
  onEnter?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  multi?: boolean;
  className?: string;
}) {
  const listId = useId();
  const [options, setOptions] = useState<SymbolMatch[]>([]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  // The value just picked, so the list doesn't reopen on it.
  const [picked, setPicked] = useState<string | null>(null);

  const term = (multi ? value.split(",").pop() ?? "" : value).trim();

  useEffect(() => {
    if (term.length < 2 || term === picked) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/symbols?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const json = (await res.json()) as { results?: SymbolMatch[] };
        setOptions(json.results ?? []);
        setActive(0);
        setOpen(true);
      } catch {
        /* aborted or offline: keep the box usable as a plain ticker input */
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [term, picked]);

  const showList = open && term.length >= 2 && term !== picked && options.length > 0;

  function pick(m: SymbolMatch) {
    const next = multi
      ? [...value.split(",").slice(0, -1).map((s) => s.trim()).filter(Boolean), m.symbol].join(", ") + ", "
      : m.symbol;
    setPicked(multi ? "" : m.symbol);
    setOpen(false);
    onChange(next);
    onPick?.(m.symbol, next);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return;
    if (showList && e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (showList && e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + options.length) % options.length);
    } else if (showList && e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showList) pick(options[active]);
      else onEnter?.();
    }
  }

  return (
    <div className="relative flex-1 min-w-0">
      <input
        id={id}
        value={value}
        onChange={(e) => {
          setPicked(null);
          onChange(e.target.value);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
        onFocus={() => options.length && setOpen(true)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? `${listId}-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        className={`w-full min-w-0 bg-[#111827] border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm outline-none transition ${className}`}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-[#0d1426] border border-gray-700 rounded-lg shadow-2xl shadow-black/60 py-1"
        >
          {options.map((m, i) => (
            <li
              key={m.symbol}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown, not click: it fires before the input's blur closes the list
              onMouseDown={(e) => {
                e.preventDefault();
                pick(m);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-baseline justify-between gap-3 px-3 py-2 cursor-pointer text-sm ${i === active ? "bg-blue-600/20" : ""}`}
            >
              <span className="text-gray-200 truncate">{m.name}</span>
              <span className="shrink-0 text-xs text-gray-400 tabular-nums">
                <span className="text-white font-semibold">{m.symbol}</span>
                {m.exchange && <span className="ml-1.5">{m.exchange}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
