"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import GuidedChat, { type ChatQuestion } from "@/components/GuidedChat";

// Compound Interest's questions for GuidedChat: what you start with, what you
// add each month, for how long, and which yearly return to assume (the
// page's presets, or your own). Ends with the final value.

/** Words for each preset, in the page's PRESETS order. */
const PRESET_WORDS = [
  ["s&p", "sp", "500"],
  ["global", "world", "mundial", "msci"],
  ["bonds", "bond", "bonos"],
  ["savings", "savings account", "ahorro", "cuenta"],
  ["custom", "other", "my own", "otra", "otro", "personalizada", "personalizado"],
];

export default function CompoundChat({
  initial, setInitial, monthly, setMonthly, years, setYears, presets, preset, setPreset, customRate, setCustomRate, finalValue,
}: {
  initial: number;
  setInitial: (v: number) => void;
  monthly: number;
  setMonthly: (v: number) => void;
  years: number;
  setYears: (v: number) => void;
  /** The page's presets with their translated labels; rate null = custom. */
  presets: { label: string; rate: number | null }[];
  preset: number;
  setPreset: (i: number) => void;
  customRate: number;
  setCustomRate: (v: number) => void;
  finalValue: number;
}) {
  const t = useTranslations("compoundInterest");

  const questions = useMemo((): ChatQuestion[] => [
    { kind: "amount", id: "initial", ask: t("chat.askInitial"), current: initial, unit: "money", min: 0, apply: setInitial },
    { kind: "amount", id: "monthly", ask: t("chat.askMonthly"), current: monthly, unit: "money", min: 0, apply: setMonthly },
    { kind: "amount", id: "years", ask: t("chat.askYears"), current: years, unit: "number", min: 1, max: 50, apply: setYears },
    {
      kind: "choice", id: "rate", ask: t("chat.askRate"),
      options: presets.map((p, i) => ({
        label: p.rate === null ? p.label : `${p.label} ${p.rate}%`,
        words: [...(PRESET_WORDS[i] ?? []), ...(p.rate !== null ? [`${p.rate}`, `${p.rate}%`] : [])],
        apply: () => setPreset(i),
      })),
    },
    {
      kind: "amount", id: "custom", ask: t("chat.askCustomRate"), current: customRate, unit: "percent", min: 0, max: 30,
      apply: setCustomRate, skip: () => presets[preset]?.rate !== null,
    },
  ], [t, initial, setInitial, monthly, setMonthly, years, setYears, presets, preset, setPreset, customRate, setCustomRate]);

  return (
    <GuidedChat
      questions={questions}
      currency="£"
      title={t("chat.title")}
      openLabel={t("chat.open")}
      doneText={t("chat.done", { years, value: `£${Math.round(finalValue).toLocaleString("en-GB")}` })}
      doneButton={t("chat.see")}
    />
  );
}
