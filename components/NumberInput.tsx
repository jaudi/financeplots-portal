"use client";

import { useState, type InputHTMLAttributes } from "react";
import { useLocale } from "next-intl";
import { parseTyped } from "@/lib/life-plan";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "min" | "max" | "step"> & {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  /** Kept so callers can pass it; a text box has no spinner. */
  step?: number;
  /** Round to whole numbers. */
  integer?: boolean;
  /** No thousands separators (years). */
  plain?: boolean;
  /** What a box left empty means. */
  emptyValue?: number;
};

// The tools' number box, the same way Life Plan's `Num` works. A controlled
// <input type="number"> fed `parseFloat(...) || 0` snapped back to 0 when
// cleared, so typing gave "05000", and "400.000" (Spanish thousands) read as
// 400. This is a text box read by parseTyped(): "20,000", "20.000", "£400k",
// "1.2m", "4,5". The text stays as typed while focused, a value passes on
// only when it reads as a number in range, and leaving the box tidies and
// clamps it. Shown with thousands separators when not being edited.
export default function NumberInput({
  value, onChange, min = -Infinity, max = Infinity, step: _step, integer = false, plain = false, emptyValue = 0,
  onFocus, onBlur, ...rest
}: Props) {
  const locale = useLocale();
  const decimal = locale === "es" ? "," : ".";
  const [draft, setDraft] = useState<string | null>(null);
  const show = (n: number) =>
    Number.isFinite(n)
      ? n.toLocaleString(locale === "es" ? "es-ES" : "en-GB", { maximumFractionDigits: integer ? 0 : 4, useGrouping: !plain })
      : "";
  const tidy = (n: number) => {
    const c = Math.min(max, Math.max(min, n));
    return integer ? Math.round(c) : c;
  };

  return (
    <input
      type="text"
      inputMode={integer && min >= 0 ? "numeric" : "decimal"}
      autoComplete="off"
      {...rest}
      value={draft ?? show(value)}
      onFocus={e => {
        setDraft(show(value));
        e.target.select();
        onFocus?.(e);
      }}
      onChange={e => {
        setDraft(e.target.value);
        if (e.target.value.trim() === "") return onChange(emptyValue);
        const n = parseTyped(e.target.value, decimal);
        if (n !== null && n >= min && n <= max) onChange(integer ? Math.round(n) : n);
      }}
      onBlur={e => {
        const n = draft === null || draft.trim() === "" ? emptyValue : parseTyped(draft, decimal);
        if (n !== null) onChange(tidy(n));
        setDraft(null);
        onBlur?.(e);
      }}
    />
  );
}
